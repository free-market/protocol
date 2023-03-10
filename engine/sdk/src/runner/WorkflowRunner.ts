import type { EIP1193Provider } from 'eip1193-provider'
import {
  Address,
  Amount,
  Arguments,
  Asset,
  AssetAmount,
  Chain,
  FungibleToken,
  fungibleTokenSchema,
  StepBase,
  stepSchema,
  Workflow,
  workflowSchema,
} from '../model'
import type { StepNode } from './StepNode'
import { MapWithDefault } from '../utils/MapWithDefault'
import { getParameterSchema, PARAMETER_REFERENCE_REGEXP } from '../model/Parameter'
import { Memoize } from 'typescript-memoize'
import { WorkflowValidationError, WorkflowValidationProblem, WorkflowValidationProblemType } from './WorkflowValidationError'
import assert from '../utils/assert'
import type { ZodObject, ZodType } from 'zod'
import { WorkflowArgumentError, WorkflowArgumentProblem, WorkflowArgumentProblemType } from './WorkflowArgumentError'
import cloneDeep from 'lodash.clonedeep'
import type { DeepReadonly } from '../utils/DeepReadonly'
import { AssetReference, assetReferenceSchema } from '../model/AssetReference'
import axios from 'axios'
import { createStepHelper, getStepHelper } from '../helpers'
import type { IStepHelper, NextSteps } from '../helpers/IStepHelper'
import { WORKFLOW_END_STEP_ID } from './constants'
import type { ChainOrStart, WorkflowSegment } from './WorkflowSegment'
import { NATIVE_ASSETS } from '../NativeAssets'
import { AssetNotFoundError, AssetNotFoundProblem } from './AssetNotFoundError'
import z from 'zod'
import type { IWorkflowRunner } from './IWorkflowRunner'
import type { EncodedWorkflow, EncodedWorkflowStep } from '../EncodedWorkflow'
import type { EvmWorkflowStep } from '@freemarket/evm'
type ParameterPath = string[]
type VisitStepCallback = (stepObject: any, path: string[]) => void

type ReadOnlyWorkflow = DeepReadonly<Workflow>

export class WorkflowRunner implements IWorkflowRunner {
  private workflow: Workflow
  private providers = new Map<string, EIP1193Provider>()
  private stepHelpers = new MapWithDefault<ChainOrStart, Map<string, IStepHelper<any>>>(() => new Map())
  private steps: StepNode[]
  private userAddress?: Address

  constructor(workflow: Workflow | string) {
    const unparsedWorkflow = typeof workflow === 'string' ? JSON.parse(workflow) : workflow
    const parsedWorkflow = workflowSchema.parse(unparsedWorkflow)
    this.workflow = parsedWorkflow
    this.steps = this.addMissingStepIds(parsedWorkflow.steps)
    this.validateWorkflowSteps()
    this.validateParameters()
  }

  setProvider(chainOrStart: ChainOrStart, provider: EIP1193Provider): void {
    this.providers.set(chainOrStart, provider)
    const chainMap = this.stepHelpers.get(chainOrStart)
    if (chainMap) {
      for (const helper of chainMap.values()) {
        helper.setProvider(provider)
      }
    }
  }

  setUserAddress(address: Address) {
    this.userAddress = address
  }

  getUserAddress(): Address {
    assert(this.userAddress, 'user address not set')
    return this.userAddress
  }

  setStartChainProvider(provider: EIP1193Provider) {
    this.providers.set('start-chain', provider)
  }

  getWorkflow(): DeepReadonly<Workflow> {
    return this.workflow
  }

  findAllParameterReferences(): Map<string, ParameterPath[]> {
    const mapParamNameToPaths = new MapWithDefault<string, ParameterPath[]>(() => [])
    for (const step of this.steps) {
      this.visitStepValues(step, [step.stepId], (obj, path) => {
        if (typeof obj === 'string') {
          const matchResult = PARAMETER_REFERENCE_REGEXP.exec(obj)
          if (matchResult) {
            const paramName = matchResult[1]
            mapParamNameToPaths.getWithDefault(paramName).push(path)
          }
        }
      })
    }
    return mapParamNameToPaths
  }

  validateParameters() {
    const problems = [] as WorkflowValidationProblem[]

    const mapDeclaredParamNameToType = new Map<string, string>()
    if (this.workflow.parameters) {
      for (const param of this.workflow.parameters) {
        mapDeclaredParamNameToType.set(param.name, param.type)
      }
    }

    for (const key of this.getRemittanceKeys()) {
      if (key.endsWith('.amount')) {
        mapDeclaredParamNameToType.set(key, 'amount')
      } else if (key.endsWith('.asset')) {
        mapDeclaredParamNameToType.set(key, 'asset')
      } else {
        mapDeclaredParamNameToType.set(key, 'asset-amount')
      }
    }

    // get all parameter references in the steps
    const mapNameToPaths = this.findAllParameterReferences()
    for (const [paramName, valuePaths] of mapNameToPaths) {
      const declaredParamType = mapDeclaredParamNameToType.get(paramName)
      for (const valuePath of valuePaths) {
        const stepId = valuePath[0]
        const step = this.getStep(stepId)
        assert(step)
        if (!declaredParamType) {
          problems.push({
            type: WorkflowValidationProblemType.UndeclaredParameter,
            stepId,
            step,
            // prettier-ignore
            message: `Parameter '${paramName}' at path '${valuePath.join('.')}' was not declared in workflow.parameters`,
          })
          continue
        }
        const schema = stepSchema._def.optionsMap.get(step.type)
        assert(schema)
        const property = WorkflowRunner.getZodChild(schema, valuePath.slice(1)) as any
        assert(property._def._parameterTypeName)

        if (declaredParamType !== property._def._parameterTypeName) {
          problems.push({
            type: WorkflowValidationProblemType.ParameterTypeMismatch,
            stepId,
            step,
            // prettier-ignore
            message: `parameter type '${declaredParamType}' for parameter '${paramName}' does not match expected type '${property._def._parameterTypeName}' at path '${valuePath.join('.')}'`,
          })
        }
      }
    }

    if (problems.length > 0) {
      throw new WorkflowValidationError(problems)
    }
  }

  validateWorkflowSteps(): Map<string, StepNode> {
    const mapStepIdToStep = new Map<string, StepNode>()
    const problems = [] as WorkflowValidationProblem[]

    // ensure all stepIds are unique, and fill in missing stepIds
    for (let i = 0; i < this.steps.length; ++i) {
      const step = this.steps[i]
      if (mapStepIdToStep.has(step.stepId)) {
        problems.push({
          type: WorkflowValidationProblemType.NonUniqueStepId,
          stepId: step.stepId,
          step,
          message: `stepId '${step.stepId}' of stepId ${i} is not unique`,
        })
      }
      mapStepIdToStep.set(step.stepId, step as StepNode)
    }

    // validate  nextStepIds
    for (let i = 0; i < this.steps.length; ++i) {
      const step = this.steps[i]

      if (step.nextStepId !== WORKFLOW_END_STEP_ID && !mapStepIdToStep.has(step.nextStepId)) {
        problems.push({
          type: WorkflowValidationProblemType.NonExistentNextStepId,
          stepId: step.stepId,
          step,
          message: `nextStepId '${step.nextStepId}' of step '${step.stepId}' does not exist`,
        })
        problems.push()
      }
    }
    if (problems.length > 0) {
      throw new WorkflowValidationError(problems)
    }
    return mapStepIdToStep
  }

  // can be called before arguments are applied,
  // but may miss some if asset-refs are still not dereferenced
  async validateAssetRefs(startChain: Chain): Promise<void> {
    // not sure if there is a better way to find all assetRefs in a workflow
    const assetRefs: { path: string[]; assetRef: AssetReference }[] = []
    const getAssetRefPaths = (path: string[], obj: any) => {
      for (const key in obj) {
        const childObj = obj[key]
        // not sure if this is necessary, but this is intended to be a lightweight pre-check before running it through the schema
        let looksLikeAssetRef =
          childObj['type'] === 'native' || (childObj['type'] === 'fungible-token' && typeof childObj['symbol'] === 'string')
        if (looksLikeAssetRef) {
          const parseResult = assetReferenceSchema.safeParse(childObj)
          if (parseResult.success) {
            assetRefs.push({ path: path.concat([key]), assetRef: parseResult.data })
          } else {
            looksLikeAssetRef = false
          }
        }
        if (!looksLikeAssetRef && typeof childObj === 'object') {
          getAssetRefPaths(path.concat(key), childObj)
        }
      }
      return assetRefs
    }

    const mapStepIdToStep = this.getStepMap()
    const segments = this.getWorkflowSegments()
    const problems: AssetNotFoundProblem[] = []
    for (const segment of segments) {
      for (const segmentChain of segment.chains) {
        const chain = segmentChain === 'start-chain' ? startChain : segmentChain
        for (const stepId of segment.stepIds) {
          const step = mapStepIdToStep.get(stepId)
          assert(step)
          assetRefs.splice(0, assetRefs.length)
          const assetRefPaths = getAssetRefPaths([], step)
          for (const ref of assetRefPaths) {
            try {
              await this.dereferenceAsset(ref.assetRef, chain)
            } catch (e) {
              if (e instanceof AssetNotFoundError) {
                const pathPrefix = [stepId]
                const currentProblems = e.problems.map(it => new AssetNotFoundProblem(it.symbol, it.chain, pathPrefix.concat(ref.path)))
                problems.splice(problems.length, 0, ...currentProblems)
              } else {
                throw e
              }
            }
          }
        }
      }
    }
    if (problems.length > 0) {
      throw new AssetNotFoundError(problems)
    }
  }

  @Memoize()
  getReachableSet(stepId: string): string[] {
    const mapStepIdToNextStepInfo = this.getNextStepsMap()
    const seenIds = new Set<string>()
    const toVisitIds = new Set<string>()
    let currentStepId = stepId
    for (;;) {
      if (!seenIds.has(currentStepId)) {
        seenIds.add(currentStepId)
      }
      const nextInfo = mapStepIdToNextStepInfo.get(currentStepId)
      if (nextInfo) {
        for (const otherStepId of nextInfo.sameChain) {
          if (!seenIds.has(otherStepId)) {
            toVisitIds.add(otherStepId)
          }
        }
      }
      if (toVisitIds.size === 0) {
        break
      }
      // this looks hackish but just treating set also as a queue and dequeueing here
      for (const nextToVisit of toVisitIds) {
        currentStepId = nextToVisit
        break
      }
      toVisitIds.delete(currentStepId)
    }
    return Array.from(seenIds)
  }

  @Memoize()
  private getNextStepsMap() {
    const mapStepIdToNextStepInfo = new Map<string, NextSteps>()
    for (const step of this.steps) {
      const helper = getStepHelper(step.type, this)
      const result = helper.getPossibleNextSteps(step as any)
      if (result) {
        mapStepIdToNextStepInfo.set(step.stepId, result)
      }
    }
    return mapStepIdToNextStepInfo
  }

  getChains(): ChainOrStart[] {
    const chains = new Set<ChainOrStart>()
    const segments = this.getWorkflowSegments()
    for (const segment of segments) {
      for (const chain of segment.chains) {
        chains.add(chain)
      }
    }
    return Array.from(chains)
  }

  // chains are valid candidates for parameters, so
  // if called before args are applied, args may show up instead of chains
  @Memoize()
  getWorkflowSegments(): WorkflowSegment[] {
    const mapStepIdToChains = new MapWithDefault<string, Set<ChainOrStart>>(() => new Set())
    const startStepIds = new Set<string>()
    mapStepIdToChains.getWithDefault(this.steps[0].stepId).add('start-chain')
    startStepIds.add(this.steps[0].stepId)
    for (const step of this.steps) {
      const helper = createStepHelper(step.type, this)
      const result = helper.getPossibleNextSteps(step as any)
      if (result) {
        if (result.differentChains) {
          for (const diffChain of result.differentChains) {
            startStepIds.add(diffChain.stepId)
            mapStepIdToChains.getWithDefault(diffChain.stepId).add(diffChain.chain)
          }
        }
      }
    }

    const rv: WorkflowSegment[] = []
    for (const stepId of startStepIds) {
      rv.push({
        chains: Array.from(mapStepIdToChains.getWithDefault(stepId)),
        stepIds: this.getReachableSet(stepId),
      })
    }
    return rv
  }

  async encodeSegment(startStepId: string, chain: Chain): Promise<EncodedWorkflow> {
    const reachable = this.getReachableSet(startStepId)

    const mapStepIdToIndex = new Map<string, number>()
    for (let i = 0; i < reachable.length; ++i) {
      mapStepIdToIndex.set(reachable[i], i)
    }

    // TODO how to handle non-evm?
    const promises = reachable.map(async stepId => {
      const step = this.getStep(stepId)
      const nextStepIndex = step.nextStepId === WORKFLOW_END_STEP_ID ? -1 : mapStepIdToIndex.get(step.nextStepId)
      assert(nextStepIndex)
      const helper = getStepHelper(step.type, this)
      const encoded = await helper.encodeWorkflowStep(chain, step as any)
      return {
        ...encoded,
        nextStepIndex,
      }
    })
    const encodedSteps: EvmWorkflowStep[] = await Promise.all(promises)
    return { steps: encodedSteps }
  }

  validateArguments(args?: Arguments) {
    const params = this.workflow.parameters
    const problems = [] as WorkflowArgumentProblem[]
    const unseenParams = new Set<string>()
    const mapParamNameToSchema = new Map<string, ZodType<any>>()
    if (params) {
      for (const param of params) {
        mapParamNameToSchema.set(param.name, getParameterSchema(param.type))
        unseenParams.add(param.name)
      }
    }
    if (args) {
      for (const argName in args) {
        const arg = args[argName]
        unseenParams.delete(argName)
        const zodType = mapParamNameToSchema.get(argName)
        if (!zodType) {
          problems.push({
            type: WorkflowArgumentProblemType.MissingParameter,
            argumentName: argName,
            message: `Argument '${argName}' is not declared in workflow.parameters`,
          })
        } else {
          const parseResult = zodType.safeParse(arg)
          if (!parseResult.success) {
            problems.push({
              type: WorkflowArgumentProblemType.SchemaError,
              message: parseResult.error.message,
              argumentName: argName,
              parameterName: argName,
              zodError: parseResult.error,
            })
          }
        }
      }
    }
    unseenParams.forEach(unseenParamName =>
      problems.push({
        type: WorkflowArgumentProblemType.MissingArgument,
        parameterName: unseenParamName,
        message: `An argument was not provided for parameter '${unseenParamName}'`,
      })
    )
    if (problems.length) {
      throw new WorkflowArgumentError(problems)
    }
  }

  // async getRequiredPaymentAssets(): Promise<Record<string, AssetAmount>> {
  //   for (const step of steps) {
  //     const helper = getStepHelper(step.type, this)
  //     const result = helper.getPossibleNextSteps(step as any)
  //   }
  // }

  async applyArguments(args: Arguments = {}): Promise<WorkflowRunner> {
    const argValues = cloneDeep(args)

    // TODO need to validate remittances in validateParameters too
    const remittances = await this.getRemittances()
    for (const k in remittances) {
      argValues[k] = remittances[k]
    }

    const rv = new WorkflowRunner(cloneDeep(this.workflow))
    const allParams = rv.findAllParameterReferences()
    for (const [paramName, paths] of allParams) {
      const argValue = argValues[paramName]
      for (const path of paths) {
        assert(path.length > 0)
        const step = rv.getStep(path[0])
        let obj = step as Record<string, any>
        for (let i = 1; i < path.length - 1; ++i) {
          obj = obj[path[i]]
        }
        obj[path[path.length - 1]] = argValue
      }
    }
    delete rv.workflow.parameters
    return rv
  }

  @Memoize()
  async getRemittances(): Promise<Record<string, AssetAmount | Amount | AssetReference>> {
    const rv: Record<string, AssetAmount | Amount | AssetReference> = {}
    const segments = this.getWorkflowSegments()
    for (const segment of segments) {
      for (const segmentChain of segment.chains) {
        for (const stepId of segment.stepIds) {
          const step = this.getStep(stepId)
          const helper = this.getStepHelper(segmentChain, step.type)
          const remittance = await helper.getRemittance(step)
          if (remittance) {
            rv[`remittances.${segmentChain}.${stepId}`] = remittance
            rv[`remittances.${stepId}`] = remittance
            rv[`remittances.${segmentChain}.${stepId}.amount`] = remittance.amount
            rv[`remittances.${stepId}.amount`] = remittance.amount
            rv[`remittances.${segmentChain}.${stepId}.asset`] = remittance.asset
            rv[`remittances.${stepId}.asset`] = remittance.asset
          }
        }
      }
    }
    return rv
  }

  private getRemittanceKeys(): Set<string> {
    const rv = new Set<string>()
    const segments = this.getWorkflowSegments()
    for (const segment of segments) {
      for (const segmentChain of segment.chains) {
        for (const stepId of segment.stepIds) {
          const step = this.getStep(stepId)
          const helper = this.getStepHelper(segmentChain, step.type)
          if (helper.requiresRemittance(step)) {
            rv.add(`remittances.${segmentChain}.${stepId}`)
            rv.add(`remittances.${stepId}`)
            rv.add(`remittances.${segmentChain}.${stepId}.amount`)
            rv.add(`remittances.${stepId}.amount`)
            rv.add(`remittances.${segmentChain}.${stepId}.asset`)
            rv.add(`remittances.${stepId}.asset`)
          }
        }
      }
    }
    return rv
  }

  private addMissingStepIds(steps: StepBase[]): StepNode[] {
    // add missing stepIds
    for (let i = 0; i < steps.length; ++i) {
      if (!steps[i].stepId) {
        steps[i].stepId = WorkflowRunner.formatStepId(i)
      }
    }

    // add missing nextStepIds
    for (let i = 0; i < steps.length; ++i) {
      if (!steps[i].nextStepId) {
        const isLastNode = i === steps.length - 1
        if (isLastNode) {
          steps[i].nextStepId = WORKFLOW_END_STEP_ID
        } else {
          steps[i].nextStepId = steps[i + 1].stepId
        }
      }
    }
    return steps as StepNode[]
  }

  private static formatStepId(stepIndex: number): string {
    return `__step_${stepIndex}__`
  }

  private visitStepValues(stepObject: any, parentPath: string[], callback: VisitStepCallback) {
    for (const attrName in stepObject) {
      const child = stepObject[attrName]
      const childPath = parentPath.concat([attrName])
      if (typeof child === 'object') {
        this.visitStepValues(child, childPath, callback)
      } else {
        callback(child, childPath)
      }
    }
  }

  async dereferenceAsset(assetRef: AssetReference, chain: Chain): Promise<Asset> {
    assert(typeof assetRef !== 'string')
    if (assetRef.type === 'native') {
      const nativeAsset = NATIVE_ASSETS[chain]
      if (!nativeAsset) {
        throw new AssetNotFoundError([new AssetNotFoundProblem(null, chain)])
      }
      return nativeAsset
    }
    const token = await this.getFungibleToken(assetRef.symbol)
    if (!token) {
      throw new AssetNotFoundError([new AssetNotFoundProblem(assetRef.symbol, null)])
    }
    if (!token.chains[chain]) {
      throw new AssetNotFoundError([new AssetNotFoundProblem(assetRef.symbol, chain)])
    }
    return token
  }

  @Memoize()
  private async getFungibleToken(symbol: string): Promise<FungibleToken | undefined> {
    if (this.workflow.fungibleTokens) {
      for (const asset of this.workflow.fungibleTokens) {
        if (asset.symbol === symbol) {
          return asset
        }
      }
    }
    const defaultTokens = await WorkflowRunner.getDefaultFungibleTokens()
    return defaultTokens[symbol]
  }

  @Memoize()
  private static async getDefaultFungibleTokens(): Promise<Record<string, FungibleToken>> {
    const response = await axios.get('https://metadata.fmprotocol.com/tokens.json')
    const tokenSchema = z.record(z.string(), fungibleTokenSchema)
    const parsed = tokenSchema.parse(response.data)
    return parsed
  }

  @Memoize()
  private getStepMap(): Map<string, StepNode> {
    const mapStepIdToStep = new Map<string, StepNode>()
    for (const step of this.steps) {
      mapStepIdToStep.set(step.stepId, step)
    }
    return mapStepIdToStep
  }

  @Memoize()
  private getStep(stepId: string): StepNode {
    const step = this.getStepMap().get(stepId)
    assert(step)
    return step
  }

  private static getZodChild(obj: ZodObject<any>, path: string[]): ZodType<any> {
    assert(path.length > 0)
    const shape = obj._def.shape()
    let child = shape[path[0]]
    if (child._def.innerType) {
      child = child._def.innerType
    }
    if (path.length === 1) {
      return child
    }
    return this.getZodChild(child, path.slice(1))
  }

  private getStepHelper(chainOrStart: ChainOrStart, type: string): IStepHelper<any> {
    const chainMap = this.stepHelpers.getWithDefault(chainOrStart)
    let helper = chainMap.get(type)
    if (!helper) {
      helper = createStepHelper(type, this)
      const provider = this.providers.get(chainOrStart)
      if (provider) {
        helper.setProvider(provider)
      }
      chainMap.set(type, helper)
    }
    return helper
  }
}

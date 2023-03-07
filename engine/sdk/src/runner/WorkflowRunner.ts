import { EIP1193Provider } from 'eip1193-provider'
import { Arguments, StepBase, stepSchema, Workflow, workflowSchema } from '../model'
import { StepNode } from './StepNode'
import { MapWithDefault } from '../utils/MapWithDefault'
import { getParameterSchema, PARAMETER_REFERENCE_REGEXP } from '../model/Parameter'
import { Memoize } from 'typescript-memoize'
import { WorkflowValidationError, WorkflowValidationProblem, WorkflowValidationProblemType } from './WorkflowValidationError'
import assert from '../utils/assert'
import { ZodObject, ZodType } from 'zod'
import { WorkflowArgumentError, WorkflowArgumentProblem, WorkflowArgumentProblemType } from './WorkflowArgumentError'
import cloneDeep from 'lodash.clonedeep'
import { DeepReadonly } from '../utils/DeepReadonly'

export const WORKFLOW_END_STEP_ID = '__end__'
type ParameterPath = string[]
type VisitStepCallback = (stepObject: any, path: string[]) => void

export default class WorkflowRunner {
  private workflow: Workflow
  private providers = new Map<string, EIP1193Provider>()
  private steps: StepNode[]

  constructor(workflow: Workflow | string) {
    const unparsedWorkflow = typeof workflow === 'string' ? JSON.parse(workflow) : workflow
    this.workflow = workflowSchema.parse(unparsedWorkflow)
    this.steps = this.addMissingStepIds(this.workflow.steps)
    this.validateWorkflowSteps()
a    this.validateParameters()
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
    const mapStepIdToStep = this.getStepMap()

    const problems = [] as WorkflowValidationProblem[]

    const mapDeclaredParamNameToType = new Map<string, string>()
    if (this.workflow.parameters) {
      for (const param of this.workflow.parameters) {
        mapDeclaredParamNameToType.set(param.name, param.type)
      }
    }

    // get all parameter references in the steps
    const mapNameToPaths = this.findAllParameterReferences()
    for (const [paramName, valuePaths] of mapNameToPaths) {
      const declaredParamType = mapDeclaredParamNameToType.get(paramName)
      for (const valuePath of valuePaths) {
        const stepId = valuePath[0]
        const step = mapStepIdToStep.get(stepId)
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
  validateArguments(args?: Arguments) {
    const params = this.workflow.parameters
    // if (args && args.length > 0 && !params) {
    //   const problem: WorkflowArgumentProblem = {
    //     type: WorkflowArgumentProblemType.NoParameters,
    //     message: 'A non-empty list of arguments was given but no workflow parameters have been declared',
    //   }
    //   throw new WorkflowArgumentError([problem])
    // }
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

  applyArguments(args: Arguments): WorkflowRunner {
    const rv = new WorkflowRunner(cloneDeep(this.workflow))
    const mapStepIdToStep = rv.getStepMap()
    const allParams = rv.findAllParameterReferences()
    for (const [paramName, paths] of allParams) {
      const argValue = args[paramName]
      for (const path of paths) {
        assert(path.length > 0)
        const step = mapStepIdToStep.get(path[0])
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

  @Memoize()
  private getStepMap(): Map<string, StepNode> {
    const mapStepIdToStep = new Map<string, StepNode>()
    for (const step of this.steps) {
      mapStepIdToStep.set(step.stepId, step)
    }
    return mapStepIdToStep
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
}

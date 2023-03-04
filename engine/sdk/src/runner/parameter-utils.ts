import { ZodObject, ZodType } from 'zod'
import assert from '../utils/assert'
import { stepSchema, Workflow } from '../model'
import { PARAMETER_REFERENCE_REGEXP } from '../model/Parameter'
import { MapWithDefault } from '../utils/MapWithDefault'
import { StepNode } from './StepNode'
import z from 'zod'
import { WorkflowValidationError, WorkflowValidationErrorType, WorkflowValidationProblem } from './WorkflowValidationError'

type ZodVisitorCallback = (zodObject: ZodType<any>, parentPath: string[]) => boolean

export function visitZodObjects(zodObject: ZodObject<any>, parentPath: string[], callback: ZodVisitorCallback) {
  const shape = zodObject._def.shape()
  for (const attrName in shape) {
    let child = shape[attrName]
    if (child._def.innerType) {
      child = child._def.innerType
    }
    const childPath = parentPath.concat(attrName)
    const keepGoing = callback(child, childPath)
    if (keepGoing) {
      if (child._def.typeName === 'ZodObject') {
        visitZodObjects(child, childPath, callback)
      }
    }
  }
}

type VisitStepCallback = (stepObject: any, path: string[]) => void

export function visitStepValues(stepObject: any, parentPath: string[], callback: VisitStepCallback) {
  for (const attrName in stepObject) {
    const child = stepObject[attrName]
    const childPath = parentPath.concat([attrName])
    if (typeof child === 'object') {
      visitStepValues(child, childPath, callback)
    } else {
      callback(child, childPath)
    }
  }
}

export function findAllParameterReferences(steps: StepNode[]): Map<string, string[][]> {
  const mapParamNameToPaths = new MapWithDefault<string, string[][]>(() => [])
  for (const step of steps) {
    visitStepValues(step, [step.stepId], (obj, path) => {
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

export function getZodChild(obj: ZodObject<any>, path: string[]): ZodType<any> {
  assert(path.length > 0)
  const shape = obj._def.shape()
  let child = shape[path[0]]
  if (child._def.innerType) {
    child = child._def.innerType
  }
  if (path.length === 1) {
    return child
  }
  return getZodChild(child, path.slice(1))
}

export function findAllArgumentPaths(value: Record<string, any>): Map<string, string[][]> {
  const map = new MapWithDefault<string, string[][]>(() => [])
  function getArgs(value: Record<string, any>, currentPath: string[]) {
    for (const attrName in value) {
      const attrValue = value[attrName]
      if (typeof attrValue === 'object') {
        getArgs(attrValue, currentPath.concat([attrName]))
      } else if (typeof attrValue === 'string') {
        const matchResult = PARAMETER_REFERENCE_REGEXP.exec(attrValue)
        if (matchResult) {
          const paramName = matchResult[1]
          const path = currentPath.concat([attrName])
          map.getWithDefault(paramName).push(path)
        }
      }
    }
  }
  getArgs(value, [])

  return map
}

export function validateWorkflowParameters(workflow: Workflow) {
  const steps = workflow.steps as StepNode[]

  const mapStepIdToStep = new Map<string, StepNode>()
  for (const step of steps) {
    mapStepIdToStep.set(step.stepId, step)
  }

  const problems = [] as WorkflowValidationProblem[]

  const mapDeclaredParamNameToType = new Map<string, string>()
  if (workflow.parameters) {
    for (const param of workflow.parameters) {
      mapDeclaredParamNameToType.set(param.name, param.type)
    }
  }

  // get all params mentioned in the steps
  const mapNameToPaths = findAllParameterReferences(steps)
  for (const [paramName, valuePaths] of mapNameToPaths) {
    const declaredParamType = mapDeclaredParamNameToType.get(paramName)
    for (const valuePath of valuePaths) {
      const stepId = valuePath[0]
      const step = mapStepIdToStep.get(stepId)
      assert(step)
      if (!declaredParamType) {
        problems.push({
          type: WorkflowValidationErrorType.UndeclaredParameter,
          stepId,
          step,
          // prettier-ignore
          message: `Parameter '${paramName}' at path '${valuePath.join('.')}' was not declared in workflow.parameters`,
        })
        continue
      }
      const schema = stepSchema._def.optionsMap.get(step.type)
      assert(schema)
      const property = getZodChild(schema, valuePath.slice(1)) as any
      assert(property._parameterTypeName)

      if (declaredParamType !== property._parameterTypeName) {
        problems.push({
          type: WorkflowValidationErrorType.NonUniqueStepId,
          stepId,
          step,
          // prettier-ignore
          message: `expected type of parameter named ${paramName} at path ${valuePath.join('.')} does not match declared type '${declaredParamType}'`,
        })
      }
    }
  }

  if (problems.length > 0) {
    throw new WorkflowValidationError(problems)
  }
}

import { ReactNode } from 'react'

export const NODE_TYPES = ['stepNode', 'branchNode', 'triggerNode'] as const
export type NodeType = (typeof NODE_TYPES)[number]

export interface IconProps {
  dark: boolean
}

export interface PlatformInfo {
  name: string
  description: string
  icon?: (props: IconProps) => ReactNode
  categories: string[]
  stepInfos: StepInfo[]
}

export interface StepInfo {
  name: string
  // engine step type
  stepType: string
  stepTypeId: number
  // UI node shape type
  nodeType: NodeType
  description: string
  operation?: string
  icon?: (props: IconProps) => ReactNode
  summary?: (props: any) => ReactNode
  comingSoon?: boolean
  platformName?: string
}

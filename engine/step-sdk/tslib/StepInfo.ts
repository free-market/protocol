import { ReactNode } from 'react'

export const NODE_TYPES = ['stepNode', 'branchNode'] as const
export type NodeType = (typeof NODE_TYPES)[number]

export interface IconProps {
  dark: boolean
}

export interface StepInfo {
  stepType: string
  nodeType: NodeType
  name: string
  description: string
  platform: string
  categories: string[]
  icon?: (props: IconProps) => ReactNode
  summary?: (props: any) => ReactNode
  comingSoon?: boolean
}

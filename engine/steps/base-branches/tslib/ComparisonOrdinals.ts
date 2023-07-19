import { ComparisonOperator } from './model'

export const ComparisonOrdinals: Record<ComparisonOperator, number> = {
  equal: 0,
  'not-equal': 1,
  'less-than': 2,
  'less-than-equal': 3,
  'greater-than': 4,
  'greater-than-equal': 5,
}

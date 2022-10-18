type TriggerCondition = () => Promise<boolean> | boolean

export interface Trigger {
  name: string
  triggerCondition: TriggerCondition
  cronExpression: string
}

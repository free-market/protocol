import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Workflow as Component } from './Workflow';

export const story = {
  title: 'Example/Workflow',
  component: Component,
}

export default story as ComponentMeta<typeof Component>;

export const Workflow: ComponentStory<typeof Component> = (/* TODO: args */) => (
  /* TODO: {...args} */
  <Component />
);
Workflow.args = {};

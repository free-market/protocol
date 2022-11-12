import { ComponentStory, ComponentMeta } from '@storybook/react';

import { StepCatalog as Component } from './StepCatalog';

export const story = {
  title: 'Example/StepCatalog',
  component: Component,
}

export default story as ComponentMeta<typeof Component>;

export const StepCatalog: ComponentStory<typeof Component> = () => (
  <Component />
);
StepCatalog.args = {};

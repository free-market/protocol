import { ComponentStory, ComponentMeta } from '@storybook/react';

import { WorkflowProvider } from '../WorkflowProvider'

import { GenericSelector as Component } from './GenericSelector';

export default {
  title: 'Example/GenericSelector',
  component: Component,
  decorators: [
    (Story) => (
      <WorkflowProvider>
        <Story />
      </WorkflowProvider>
    ),
  ],
  parameters: {
    backgrounds: {
      default:
        window &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light',
      values: [
        { name: 'dark', value: '#002b36' },
        { name: 'light', value: '#fdf6e3' },
        { name: 'poppy', value: 'black' },
      ],
    },
  },
} as ComponentMeta<typeof Component>;

export const GenericSelector: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
);
GenericSelector.args = {
  heading: 'Choose your workflow:',
  choices: [{name: 'foo', label: 'Foo'}, {name: 'bar', label: 'Bar'}],
  choiceName: 'foo',
  oneline: false
};

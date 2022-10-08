import { ComponentStory, ComponentMeta } from '@storybook/react';

import { WorkflowProvider } from '../WorkflowProvider'
import ThemeSelector from '../ThemeSelector'

import { WorkflowPresetSelector as Component } from './WorkflowPresetSelector';

export default {
  title: 'Example/WorkflowPresetSelector',
  component: Component,
  decorators: [
    (Story) => (
      <WorkflowProvider>
        <ThemeSelector />
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

export const WorkflowPresetSelector: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
);
WorkflowPresetSelector.args = {};

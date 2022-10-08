import { ComponentStory, ComponentMeta } from '@storybook/react';

import { WorkflowProvider } from '../WorkflowProvider'

import { ThemeSelector as Component } from './ThemeSelector';

export default {
  title: 'Example/ThemeSelector',
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

export const ThemeSelector: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
);
ThemeSelector.args = {};

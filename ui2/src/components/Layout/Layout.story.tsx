import { ComponentStory, ComponentMeta } from '@storybook/react';

import CoreProvider from '../CoreProvider';
import { Layout as Component } from './Layout';

export default {
  title: 'Example/Layout',
  component: Component,
  decorators: [
    (Story) => (
      <CoreProvider>
        <Story />
      </CoreProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#18181b' },
        { name: 'light', value: '#fdf6e3' },
      ],
    },
  },
} as ComponentMeta<typeof Component>

export const Layout: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
);
Layout.args = {};

import { ComponentStory, ComponentMeta } from '@storybook/react';

import { Layout as Component } from './Layout';

export const story = {
  title: 'Example/Layout',
  component: Component,
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
}

export default story as ComponentMeta<typeof Component>;

export const Layout: ComponentStory<typeof Component> = (args) => (
  <Component {...args} />
);
Layout.args = {};

/* eslint-disable import/no-extraneous-dependencies */
import { action } from '@storybook/addon-actions';
import { linkTo } from '@storybook/addon-links';

import { text } from '@storybook/addon-knobs';

import MyButton from '../components/MyButton.vue';

export default {
  title: 'Button',
  component: MyButton,
};

export const withText = () => ({
  components: { MyButton },
  props: {
    buttonText: {
      default: text('Button text', 'Button'),
    },
  },
  template: '<my-button @click="action">{{ buttonText }}</my-button>',
  methods: { action: action('clicked') },
});

export const withJSX = () => ({
  props: {
    buttonText: {
      default: text('Button text', 'With JSX'),
    },
  },
  render() {
    return <MyButton onClick={linkTo('Button', 'With Some Emoji')}>{ this.buttonText }</MyButton>;
  },
});

export const withSomeEmoji = () => ({
  components: { MyButton },
  template: '<my-button>😀 😎 👍 💯</my-button>',
});

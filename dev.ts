import { Component, State, Schema } from '@boardgamelab/components';

import Sandbox from './src/Sandbox.svelte';
import { writable } from 'svelte/store';

const schema: Schema = {
  assets: {},

  templates: {
    card: {
      type: Component.CARD,
      id: 'card',
      geometry: {
        width: 500,
        height: 650,
      },
    },
  },

  objects: {
    'card-1': { id: 'card-1', templateID: 'card' },
    'card-2': { id: 'card-2', templateID: 'card' },
    'card-3': { id: 'card-3', templateID: 'card' },
  },
};

const state: State = {
  objects: {
    'card-1': {},
    'card-2': {},
    'card-3': {},
  },
};

new Sandbox({
  target: document.getElementById('root'),
  props: {
    schema: writable(schema),
    state: writable(state),
  },
});

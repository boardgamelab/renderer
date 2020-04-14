import { Component, State, Schema } from '@boardgamelab/components';

import Canvas from './src/Canvas.svelte';

const schema: Schema = {
  objects: {
    'card-O1': { type: Component.CARD, opts: { draggable: true, text: 'O' } },
    'card-O2': { type: Component.CARD, opts: { draggable: true, text: 'O' } },
    'card-O3': { type: Component.CARD, opts: { draggable: true, text: 'O' } },
    'card-O4': { type: Component.CARD, opts: { draggable: true, text: 'O' } },
    'card-O5': { type: Component.CARD, opts: { draggable: true, text: 'O' } },
    'card-O6': { type: Component.CARD, opts: { draggable: true, text: 'O' } },
    'card-O7': { type: Component.CARD, opts: { draggable: true, text: 'O' } },
    'card-O8': { type: Component.CARD, opts: { draggable: true, text: 'O' } },
    'card-O9': { type: Component.CARD, opts: { draggable: true, text: 'O' } },

    'card-X1': { type: Component.CARD, opts: { draggable: true, text: 'X' } },
    'card-X2': { type: Component.CARD, opts: { draggable: true, text: 'X' } },
    'card-X3': { type: Component.CARD, opts: { draggable: true, text: 'X' } },
    'card-X4': { type: Component.CARD, opts: { draggable: true, text: 'X' } },
    'card-X5': { type: Component.CARD, opts: { draggable: true, text: 'X' } },
    'card-X6': { type: Component.CARD, opts: { draggable: true, text: 'X' } },
    'card-X7': { type: Component.CARD, opts: { draggable: true, text: 'X' } },
    'card-X8': { type: Component.CARD, opts: { draggable: true, text: 'X' } },
    'card-X9': { type: Component.CARD, opts: { draggable: true, text: 'X' } },

    'point-O': {
      type: Component.SNAP_POINT,
      opts: { x: 800, y: 300 },
    },

    'point-X': {
      type: Component.SNAP_POINT,
      opts: { x: 1000, y: 300 },
    },

    'point-1': {
      type: Component.CARD_HOLDER,
      data: { id: 1 },
      opts: { x: 100, y: 100, onClick: 'move' },
    },

    'point-2': {
      type: Component.CARD_HOLDER,
      data: { id: 2 },
      opts: { x: 300, y: 100, onClick: 'move' },
    },

    'point-3': {
      type: Component.CARD_HOLDER,
      data: { id: 3 },
      opts: { x: 500, y: 100, onClick: 'move' },
    },

    'point-4': {
      type: Component.CARD_HOLDER,
      data: { id: 4 },
      opts: { x: 100, y: 300, onClick: 'move' },
    },

    'point-5': {
      type: Component.CARD_HOLDER,
      data: { id: 5 },
      opts: { x: 300, y: 300, onClick: 'move' },
    },

    'point-6': {
      type: Component.CARD_HOLDER,
      data: { id: 6 },
      opts: { x: 500, y: 300, onClick: 'move' },
    },

    'point-7': {
      type: Component.CARD_HOLDER,
      data: { id: 7 },
      opts: { x: 100, y: 500, onClick: 'move' },
    },

    'point-8': {
      type: Component.CARD_HOLDER,
      data: { id: 8 },
      opts: { x: 300, y: 500, onClick: 'move' },
    },

    'point-9': {
      type: Component.CARD_HOLDER,
      data: { id: 9 },
      opts: { x: 500, y: 500, onClick: 'move' },
    },
  },
};

const state: State = {
  objects: {
    'card-O1': { parent: 'point-O' },
    'card-O2': { parent: 'point-O' },
    'card-O3': { parent: 'point-O' },
    // 'card-O4': { parent: 'point-O' },
    // 'card-O5': { parent: 'point-O' },
    // 'card-O6': { parent: 'point-O' },
    // 'card-O7': { parent: 'point-O' },
    // 'card-O8': { parent: 'point-O' },
    // 'card-O9': { parent: 'point-O' },
    // 'card-X1': { parent: 'point-X' },
    // 'card-X2': { parent: 'point-X' },
    // 'card-X3': { parent: 'point-X' },
    // 'card-X4': { parent: 'point-X' },
    // 'card-X5': { parent: 'point-X' },
    // 'card-X6': { parent: 'point-X' },
    // 'card-X7': { parent: 'point-X' },
    // 'card-X8': { parent: 'point-X' },
    // 'card-X9': { parent: 'point-X' },
    // 'point-1': {},
    // 'point-2': {},
    // 'point-3': {},
    // 'point-4': {},
    // 'point-5': {},
    // 'point-6': {},
    // 'point-7': {},
    // 'point-8': {},
    // 'point-9': {},
    // 'point-O': {
    //   children: [
    //     'card-O1',
    //     'card-O2',
    //     'card-O3',
    //     'card-O4',
    //     'card-O5',
    //     'card-O6',
    //     'card-O7',
    //     'card-O8',
    //     'card-O9',
    //   ],
    // },
    // 'point-X': {
    //   children: [
    //     'card-X1',
    //     'card-X2',
    //     'card-X3',
    //     'card-X4',
    //     'card-X5',
    //     'card-X6',
    //     'card-X7',
    //     'card-X8',
    //     'card-X9',
    //   ],
    // },
  },
};

new Canvas({
  target: document.getElementById('root'),
  props: {
    schema,
    state,
  },
});

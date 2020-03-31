/*
 * Copyright 2020 Nicolo John Davis
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { SVG, Svg } from '@svgdotjs/svg.js';
import { Context } from '../context';
import {
  SchemaEntry,
  StateEntry,
  Schema,
  State,
  Component,
  Action,
} from '@boardgamelab/components';

import { CardRow } from '../card-row';
import { Card } from '../card';
import { SnapPoint } from '../snap-point';
import { CardHolder } from '../card-holder';

function _CreateObject(
  id: string,
  def: SchemaEntry,
  value: StateEntry,
  ctx: Context
) {
  // Merge opts from state and schema.
  def = {
    ...def,
    opts: { ...def.opts, ...value.opts },
    data: { ...def.data, ...value.data },
  };

  switch (def.type) {
    case Component.CARD_ROW:
      return new CardRow({ ...def, id, ctx });

    case Component.SNAP_POINT:
      return new SnapPoint({ ...def, id, ctx });

    case Component.CARD:
      return new Card({ ...def, id, ctx });

    case Component.CARD_HOLDER:
      return new CardHolder({ ...def, id, ctx });

    default:
      return null;
  }
}

function CreateObject(
  id: string,
  def: SchemaEntry,
  value: StateEntry,
  ctx: Context
) {
  const obj = _CreateObject(id, def, value, ctx);

  if (!obj) {
    throw new Error(`could not create object: ${id}`);
  }

  return obj;
}

export interface InitArgs {
  schema: Schema;
  state: State;
  eventHandler?: (eventName: string, args: object) => void;
  actionHandler?: (action: Action) => void;
  target?: string;
}

// schema:
// {
//   "card-row-1": { type: "card-row", x: 10, y: 10 },
//   ...
// }
//
// state:
// {
//   "card-1": {},
//   "card-row-1": {
//     "children": ["card-2", "card-3"],
//   }
// }
export function Init({
  schema,
  state,
  eventHandler,
  actionHandler,
}: InitArgs): Svg {
  const svg = SVG().size('100%', '100vh');

  const dispatchEvent = (eventName: string, args: object) => {
    if (eventHandler) {
      eventHandler(eventName, args);
    }
  };

  const dispatchAction = (action: Action) => {
    if (actionHandler) {
      actionHandler(action);
    }
  };

  const ctx = {
    dispatchAction,
    dispatchEvent,
    svg,
  };

  for (const id of Object.keys(state)) {
    const value = state[id];
    const def = schema[id];
    if (!def) {
      throw new Error(`${id} not found in schema`);
    }

    if (value.parent) {
      continue;
    }

    const obj = CreateObject(id, def, value, ctx);

    if (value.children) {
      value.children.forEach(childID => {
        const childDef = schema[childID];
        if (!childDef) {
          throw new Error(`${childID} not found in schema`);
        }
        const childObj = CreateObject(childID, childDef, {}, ctx);
        (obj as CardHolder).add(childObj);
      });
    }

    obj.addTo(svg);
  }

  return svg;
}

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

import { Svg } from '@svgdotjs/svg.js';
import { GameObject } from '../base';
import { Dom } from '@svgdotjs/svg.js';
import { Action } from '@boardgamelab/components';

function assertNever(action: any): never {
  throw new Error(`unexpected action: ${JSON.stringify(action)}`);
}

export function ApplyActions(svg: Svg, actions: Array<Action>) {
  actions.forEach(action => _ApplyAction(svg, action));
}

function _ApplyAction(svg: Svg, action: Action) {
  switch (action.kind) {
    case 'add-to': {
      const el: Dom = svg.findOne('#' + action.id);
      const obj: GameObject = el.remember('instance');
      const parent = svg.findOne('#' + action.parent);
      obj.toParent(parent, true);
      break;
    }

    case 'opts': {
      const el: Dom = svg.findOne('#' + action.id);
      const obj: GameObject = el.remember('instance');

      if (action.key === 'highlight' && action.value === true) {
        obj.highlight();
      }

      if (action.key === 'fade') {
        if (action.value === true) {
          obj.fade();
        } else {
          obj.unfade();
        }
      }

      break;
    }

    case 'data':
      break;

    default:
      return assertNever(action);
  }
}

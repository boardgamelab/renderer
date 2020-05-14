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

import type { Writable } from 'svelte/store';
import { ToSVGPoint } from '../utils/svg';
import { FindIntersectingObjects } from '../geometry';
import { Schema, State } from '@boardgamelab/components';

interface Opts {
  activeObjects: Writable<object>;
  selectBox: Writable<object | null>;
  schema: Schema;
  state: State;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Svelte directive that allows elements to be selected.
 */
export function select(svg: SVGSVGElement, opts: Opts) {
  let o = opts;
  let selectBoxAnchor: Point | null = null;
  let rect = svg.createSVGRect();

  function Drag(e: MouseEvent) {
    const point = ToSVGPoint(e as MouseEvent, svg);

    const x1 = Math.min(selectBoxAnchor!.x, point.x);
    const x2 = Math.max(selectBoxAnchor!.x, point.x);
    const y1 = Math.min(selectBoxAnchor!.y, point.y);
    const y2 = Math.max(selectBoxAnchor!.y, point.y);

    const box = {
      x: x1,
      y: y1,
      width: x2 - x1,
      height: y2 - y1,
    };

    o.selectBox.set(box);

    const selectedObjects = FindIntersectingObjects(box, o.schema, o.state);

    let selected: any = {};
    selectedObjects.forEach((id) => {
      selected[id] = true;
    });
    o.activeObjects.set(selected);
  }

  function Select(e: MouseEvent | Touch) {
    const target = (e.target as Element).closest('[data-selectable=true]');

    if (target) {
      target.dispatchEvent(new CustomEvent('select'));
      const id = (target as HTMLElement).dataset.id as string;
      o.activeObjects.set({ [id]: true });
    } else {
      selectBoxAnchor = ToSVGPoint(e as MouseEvent, svg);
      svg.addEventListener('mousemove', Drag);
    }
  }

  function TouchStart(e: TouchEvent) {
    if (e.touches.length) {
      Select(e.touches[0]);
    }
  }

  function Cancel() {
    selectBoxAnchor = null;
    o.selectBox.set(null);
    svg.removeEventListener('mousemove', Drag);
  }

  svg.addEventListener('touchstart', TouchStart);
  svg.addEventListener('mousedown', Select);
  svg.addEventListener('mouseup', Cancel);

  return {
    destroy() {
      if (selectBoxAnchor) {
        Cancel();
      }
      svg.removeEventListener('mousedown', Select);
      svg.removeEventListener('touchstart', TouchStart);
    },

    update(opts: Opts) {
      o = opts;
    },
  };
}

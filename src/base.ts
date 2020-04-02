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

import { Context } from './context';
import { Dom, G } from '@svgdotjs/svg.js';
import compose from 'lodash/fp/compose';
import { Behavior } from './behaviors/types';

export class GameObject {
  id: string;
  ctx: Context;
  el: G;

  constructor({
    id,
    ctx,
    opts,
    data,
  }: {
    id: string;
    ctx: Context;
    opts: any;
    data: object;
  }) {
    this.ctx = ctx;
    this.id = id;
    this.el = this.ctx.svg.group();
    this.el.remember('instance', this);
    this.el.data('id', id);
    this.el.data('opts', opts);
    this.el.data('data', data);
    this.el.id(id);

    this.el.click((e: MouseEvent) => {
      e.stopPropagation();

      if (opts.onClick) {
        this.ctx.dispatchEvent(opts.onClick, { obj: id });
      }
    });
  }

  static augment(...args: Behavior[]): typeof GameObject {
    return compose(...args)(GameObject);
  }

  container() {
    const container = this.el.remember('container');
    if (container && container.data('isContainer') === true) {
      return container;
    }
    return null;
  }

  addTo(container: Dom) {
    this.el.addTo(container);
    this.el.data('parent', container.data('id'));
    this.el.remember('container', container);
    return this;
  }

  toParent(container: Dom, move?: boolean) {
    const parentID = container.data('id');

    // The object has already been added to this parent.
    if (this.el.data('parent') === parentID) {
      return;
    }

    this.el.toParent(container);
    this.el.data('parent', parentID);
    this.el.remember('container', container);

    if (move) {
      this.el
        .animate({ duration: 200 })
        .center(0, 0)
        .transform({ translateX: 0, translateY: 0 });
    }

    return this;
  }
}

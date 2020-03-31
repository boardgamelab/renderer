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

import { Text } from '@svgdotjs/svg.js';
import Drag from './behaviors/drag';
import Fade from './behaviors/fade';
import { GameObject } from './base';
import { Rect, Gradient } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.filter.js';
import { Context } from './context';

interface CardArgs {
  id: string;
  ctx: Context;
  opts?: { x?: number; y?: number; text?: string };
}

export class Card extends GameObject.augment(Fade, Drag) {
  rect: Rect;

  constructor(args: CardArgs) {
    super(args);

    const { opts } = args;

    this.el.transform({
      translateX: opts?.x || 0,
      translateY: opts?.y || 0,
    });

    this.el.data('type', 'card');

    this.rect = this.el.rect(100, 120);

    const gradient = this.ctx.svg.gradient('linear', (s: Gradient) => {
      s.stop(0, '#f5f5f5');
      s.stop(1, '#fff');
    });

    this.rect
      .stroke('#ccc')
      .fill(gradient)
      .radius(8)
      .attr({ 'stroke-width': '1px', cursor: 'pointer' });

    if (opts?.text) {
      const text = new Text();
      text.attr({
        cursor: 'pointer',
        stroke: '#888',
        fill: '#888',
      });
      text.font({
        family: 'monospace',
        size: 40,
      });
      text.center(this.el.cx() - 11, this.el.cy() + 12);
      text.plain(opts.text);
      text.addTo(this.el);
    }
  }

  highlight() {
    this.rect.attr({ 'stroke-width': '3px', stroke: '#aea' });
    this.rect.filterWith((add: any) => {
      const blur = add.gaussianBlur(5, 5);
      add.blend(add.$source, blur, 'multiply');
    });
  }
}

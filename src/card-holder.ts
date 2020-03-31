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

import Container from './behaviors/container';
import { Context } from './context';
import { GameObject } from './base';
import { Rect } from '@svgdotjs/svg.js';

interface CardHolderArgs {
  id: string;
  ctx: Context;
  opts?: { x?: number; y?: number; onClick?: string };
}

interface MergedOpts {
  enabled: boolean;
  width: number;
  height: number;
}

export class CardHolder extends GameObject.augment(Container) {
  rect: Rect;

  constructor(args: CardHolderArgs) {
    super(args);

    let { opts } = args;

    const defaultOpts = {
      enabled: true,
      width: 100,
      height: 120,
    };

    const mergedOpts: MergedOpts = { ...defaultOpts, ...opts };

    this.el.transform({ translateX: opts?.x, translateY: opts?.y });
    this.el.data('type', 'card-holder');
    this.el.data('opts', mergedOpts);

    this.rect = this.el
      .rect(mergedOpts.width, mergedOpts.height)
      .center(0, 0)
      .stroke('#ddd')
      .fill('#fafafa')
      .radius(5)
      .attr({ cursor: 'pointer' });

    this.rect.filterWith((add: any) => {
      const blur = add.gaussianBlur(5, 5);
      add.blend(add.$source, blur, 'color-dodge');
    });

    if (opts?.onClick) {
      this.rect.mouseover(() => this.highlight());
      this.rect.mouseout(() => this.unhighlight());
    }
  }

  highlight() {
    this.rect.stroke('#aaa');
  }

  unhighlight() {
    this.rect.stroke('#ddd');
  }

  add(obj: GameObject) {
    obj.el.center(0, 0);
    obj.addTo(this.el);
    return this;
  }
}

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
import { GameObject } from './base';
import { Context } from './context';
import { Circle } from '@svgdotjs/svg.js';

interface SnapPointArgs {
  id: string;
  ctx: Context;
  opts?: { x?: number; y?: number };
}

export class SnapPoint extends GameObject.augment(Container) {
  circle: Circle;

  constructor(args: SnapPointArgs) {
    super(args);

    const { opts } = args;

    const defaultOpts = {
      enabled: true,
    };

    this.el.transform({ translateX: opts?.x, translateY: opts?.y });
    this.el.data('type', 'snap-point');
    this.el.data('opts', { ...defaultOpts, ...opts });

    this.circle = this.el.circle(8);
    this.circle.attr({ fill: '#888' }).stroke('#eee');
  }

  highlight() {
    this.circle
      .fill('#f00')
      .size(10)
      .animate({ duration: 100 });
  }

  unhighlight() {
    this.circle
      .stroke('#eee')
      .fill('#888')
      .size(8)
      .animate();
  }

  add(obj: GameObject) {
    obj.el.center(0, 0);
    obj.addTo(this.el);
    return this;
  }
}

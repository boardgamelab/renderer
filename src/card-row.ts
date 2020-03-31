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

import { GameObject } from './base';
import { Context } from './context';
import Container from './behaviors/container';
import { Card } from './card';

interface CardRowArgs {
  id: string;
  ctx: Context;
  opts?: { x?: number; y?: number };
}

export class CardRow extends GameObject.augment(Container) {
  constructor(args: CardRowArgs) {
    super(args);

    const { opts } = args;

    this.el.data('type', 'card-row');

    this.el
      .rect(1000, 120)
      .attr({ fill: '#fff' })
      .stroke('#eee');

    if (opts?.x || opts?.y) {
      this.el.transform({ translateX: opts.x, translateY: opts.y });
    }
  }

  add(card: Card) {
    const n = this.el.node.childNodes.length - 1;
    card.el.y(0);
    card.el.x(120 * n);
    card.addTo(this.el);
    return this;
  }
}

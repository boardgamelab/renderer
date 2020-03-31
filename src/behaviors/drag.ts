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

import '@svgdotjs/svg.draggable.js';
import { IsPointInsideBox, IsOverlap } from '../geometry';
import { Dom, G } from '@svgdotjs/svg.js';
import { SnapPoint } from '../snap-point';
import { Behavior } from './types';
import { Action } from '@boardgamelab/components';

const ANIMATION_DURATION = 200;

interface SnapPointOpts {
  x: number;
  y: number;
  enabled?: boolean;
  onDrop?: string;
}

const Drag: Behavior = superclass =>
  class extends superclass {
    constructor(args: any) {
      super(args);

      this._setupDragDropHandlers();
    }

    _setupDragDropHandlers() {
      // We make a copy of the card (or container that it is a part of)
      // so that it appears at the top of the paint order.
      let use: Dom | null = null;
      const el = this.el;

      let origX = el.x();
      let origY = el.y();

      function EachDropZone(fn: (value: any) => void) {
        el.root()
          .children()
          .filter(
            (child: Dom) =>
              (child.data('type') === 'snap-point' ||
                child.data('type') === 'card-holder') &&
              (child.data('opts') as SnapPointOpts).enabled === true
          )
          .map((c: Dom) => c.remember('instance'))
          .forEach(fn);
      }

      el.draggable()
        .on('dragstart.draghandlers', () => {
          el.front();

          origX = el.x();
          origY = el.y();

          const container = this.container();
          if (container) {
            use = el.root().use(container);
          } else {
            use = el.root().use(el);
          }

          EachDropZone((c: SnapPoint) => c.highlight());
        })
        .on('dragend.draghandlers', (e: any) => {
          EachDropZone((c: SnapPoint) => c.unhighlight());

          if (use) {
            if (!this.container()) {
              // If the card has no container, we delete the drag copy immediately
              // to avoid it showing up in the top left corner of the screen.
              use.remove();
            } else {
              setTimeout(() => use!.remove(), ANIMATION_DURATION);
            }
          }

          if (this.checkCollisionsWithSnapPoints()) {
            return;
          }

          if (this.checkCollisionsWithCardHolders()) {
            return;
          }

          if (this.container()) {
            el.animate({ duration: ANIMATION_DURATION }).move(origX, origY);
          }
        });

      if (el.data('opts').draggable !== true) {
        el.draggable(false);
      }
    }

    _onCollision(target: Dom) {
      this.toParent(target, true);

      const opts = target.data('opts') as SnapPointOpts;
      if (opts.onDrop) {
        this.ctx.dispatchEvent(opts.onDrop, {
          target: target.data('id'),
          obj: this.el.data('id'),
        });
      }

      const action: Action = {
        kind: 'add-to',
        id: this.id,
        parent: target.data('id') as string,
      };
      this.ctx.dispatchAction(action);
    }

    checkCollisionsWithCardHolders() {
      // We need to avoid looking at the current parent because
      // it stretches depending on where the child is dragged.
      const ignoreParent = (target: Dom) =>
        this.el.data('parent') && target.data('id') !== this.el.data('parent');

      return this.el
        .root()
        .children()
        .filter(
          (child: Dom) =>
            child.data('type') === 'card-holder' &&
            (child.data('opts') as SnapPointOpts).enabled !== false
        )
        .filter(ignoreParent)
        .some((child: G) => {
          const containerBox = child.rbox(child.root());
          const box = this.el.rbox(this.el.root());

          if (IsOverlap(box, containerBox)) {
            this._onCollision(child);
            return true;
          }
        });
    }

    checkCollisionsWithSnapPoints() {
      return this.el
        .root()
        .children()
        .filter(
          (child: Dom) =>
            child.data('type') === 'snap-point' &&
            (child.data('opts') as SnapPointOpts).enabled === true
        )
        .some((child: Dom) => {
          const opts = child.data('opts') as SnapPointOpts;
          const { x, y } = opts;
          const box = this.el.rbox(this.el.root());

          if (IsPointInsideBox(x, y, box)) {
            this._onCollision(child);
            return true;
          }
        });
    }
  };

export default Drag;

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

import { ToSVGPoint } from '../utils/svg';

export interface DragEvent {
  // ID of the object being dragged.
  id: string;

  dropID: string | null;

  target: Element;

  // Coordinates relative to the SVG viewport.
  svg: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };

  // Coordinates relative to the client viewport.
  client: {
    x: number;
    y: number;
    dx: number;
    dy: number;
  };
}

interface DragOpts {
  svg: { el: SVGGraphicsElement };
  panX: number;
  panY: number;
  dispatchActions: Function;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Svelte directive that allows elements to be dragged.
 */
export function drag(node: Element, opts: DragOpts) {
  let target: any = null;
  let dropTarget: any = null;
  let anchorScreen: Point | null = null;
  let anchorSVG: Point | null = null;
  let pointScreen: Point | null = null;
  let pointSVG: Point | null = null;

  function CreateCustomEvent(name: string, target: HTMLElement) {
    const id = target.dataset.id;

    let dropID = dropTarget?.dataset.id || null;
    if (dropID === id) {
      dropID = null;
    }

    return new CustomEvent(name, {
      detail: {
        id,
        dropID,
        target,
        svg: {
          x: pointSVG!.x,
          y: pointSVG!.y,
          dx: pointSVG!.x - anchorSVG!.x,
          dy: pointSVG!.y - anchorSVG!.y,
        },
        client: {
          x: pointScreen!.x,
          y: pointScreen!.y,
          dx: pointScreen!.x - anchorScreen!.x,
          dy: pointScreen!.y - anchorScreen!.y,
        },
      },
    });
  }

  let pointsToCheck: Point[] = [];

  function CheckDrop(e: MouseEvent | Touch) {
    dropTarget = null;

    // const component = (target as SVGGraphicsElement).dataset.component;

    pointsToCheck.forEach(point => {
      // const t = document
      //   .elementFromPoint(point.x + e.clientX, point.y + e.clientY)
      //   ?.closest(`[data-droppable=true][data-component=${component}]`);

      const t = document
        .elementFromPoint(point.x + e.clientX, point.y + e.clientY)
        ?.closest(`[data-droppable=true]`);

      if (t) {
        dropTarget = t;
      }
    });
  }

  function Drag(e: MouseEvent | Touch) {
    // Update the current drag point.
    pointSVG = ToSVGPoint(e, opts.svg.el, opts.panX, opts.panY);
    pointScreen = { x: e.clientX, y: e.clientY };
    CheckDrop(e);
    target!.dispatchEvent(CreateCustomEvent('move', target));
  }

  function MouseMove(e: Event) {
    Drag(e as MouseEvent);
  }

  function TouchMove(e: Event) {
    const touchEvent = e as TouchEvent;
    Drag(touchEvent.touches[0]);
    e.preventDefault();
  }

  function Cancel() {
    target?.dispatchEvent(CreateCustomEvent('moveend', target));

    anchorSVG = null;
    anchorScreen = null;
    target = null;
    dropTarget = null;

    window.removeEventListener('mousemove', MouseMove);
    window.removeEventListener('touchmove', TouchMove);
    window.removeEventListener('mouseup', Cancel);
    window.removeEventListener('touchend', Cancel);
    window.removeEventListener('touchcancel', Cancel);
    window.removeEventListener('touchleave', Cancel);
  }

  function Start(e: MouseEvent | Touch) {
    pointSVG = anchorSVG = ToSVGPoint(e, opts.svg.el, opts.panX, opts.panY);

    pointScreen = anchorScreen = {
      x: e.clientX,
      y: e.clientY,
    };

    const targetRect = target!.getBoundingClientRect();

    pointsToCheck = [
      {
        x: 0,
        y: 0,
      },
      {
        x: targetRect!.left - e.clientX,
        y: targetRect!.top - e.clientY,
      },
      {
        x: targetRect!.left + targetRect!.width - e.clientX,
        y: targetRect!.top - e.clientY,
      },
      {
        x: targetRect!.left + targetRect!.width - e.clientX,
        y: targetRect!.top + targetRect!.height - e.clientY,
      },
      {
        x: targetRect!.left - e.clientX,
        y: targetRect!.top + targetRect!.height - e.clientY,
      },
    ];

    CheckDrop(e);
    target!.dispatchEvent(CreateCustomEvent('movestart', target));
  }

  function MouseDown(e: Event) {
    const mouseEvent = e as MouseEvent;

    // Ignore right click.
    if (mouseEvent.button !== 0) {
      return;
    }

    target = (e.target as Element).closest('[data-draggable=true]');

    if (target) {
      Start(mouseEvent);
      window.addEventListener('mousemove', MouseMove);
      window.addEventListener('mouseup', Cancel);
    }
  }

  function TouchStart(e: Event) {
    const touchEvent = e as TouchEvent;

    if (touchEvent.touches.length !== 1) {
      Cancel();
      return;
    }

    if (anchorScreen) {
      Cancel();
      return;
    }

    target = (e.target as Element).closest('[data-draggable=true]');

    if (target) {
      const touch = touchEvent.touches[0];
      Start(touch);
      window.addEventListener('touchmove', TouchMove, { passive: false });
      window.addEventListener('touchend', Cancel);
      window.addEventListener('touchcancel', Cancel);
      window.addEventListener('touchleave', Cancel);
    }
  }

  node.addEventListener('touchstart', TouchStart);
  node.addEventListener('mousedown', MouseDown);

  return {
    destroy() {
      if (anchorSVG) {
        Cancel();
      }
      node.removeEventListener('mousedown', MouseDown);
      node.removeEventListener('touchstart', TouchStart);
    },

    update(newOpts: DragOpts) {
      opts = newOpts;
    },
  };
}

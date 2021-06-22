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

import { ToSVGPoint } from "../utils/svg";
import type { Writable } from "svelte/store";

export interface DragEvent {
  // ID of the object being dragged.
  id: string;

  dropID: string | null;

  dropAt: string | null;

  target: Element;

  // Coordinates relative to the SVG viewport.
  svg: {
    x: number;
    y: number;
    dx: number;
    dy: number;
    targetX: number;
    targetY: number;
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
  isDragging: Writable<boolean>;
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
  let targetSVG: Point | null = null;

  function CreateCustomEvent(name: string, target: HTMLElement) {
    const id = target.dataset.id;

    let dropID = dropTarget?.dataset.id || null;
    if (dropID === id) {
      dropID = null;
    }

    let dropAt = dropTarget?.dataset.at || null;

    return new CustomEvent(name, {
      detail: {
        id,
        dropID,
        dropAt,
        target,
        svg: {
          x: pointSVG!.x,
          y: pointSVG!.y,
          dx: pointSVG!.x - anchorSVG!.x,
          dy: pointSVG!.y - anchorSVG!.y,
          targetX: targetSVG!.x + pointSVG!.x - anchorSVG!.x,
          targetY: targetSVG!.y + pointSVG!.y - anchorSVG!.y,
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

    const candidates: any[] = [];

    pointsToCheck.forEach(point => {
      // const t = document
      //   .elementFromPoint(point.x + e.clientX, point.y + e.clientY)
      //   ?.closest(`[data-droppable=true][data-component=${component}]`);

      const t = document
        .elementFromPoint(point.x + e.clientX, point.y + e.clientY)
        ?.closest(`[data-droppable=true]`);

      if (t) {
        if (CheckTypeCompatibility(target, t)) {
          candidates.push(t);
        }
      }
    });

    const center = {
      x: pointsToCheck[0].x + e.clientX,
      y: pointsToCheck[0].y + e.clientY,
    };

    if (candidates.length === 1) {
      dropTarget = candidates[0];
    }

    // TODO: If there is a data-at candidate, discard the parent.

    // Sort candidates by distance and pick the closest one.
    if (candidates.length > 1) {
      const rects = candidates.map((t) => ({ target: t, rect: t.getBoundingClientRect() }));

      rects.sort(({ rect: a }, { rect: b }) => {
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;
        const bx = b.x + b.width / 2;
        const by = b.y + b.height / 2;
        const tx = center.x;
        const ty = center.y;

        const da = (tx - ax) * (tx - ax) + (ty - ay) * (ty - ay);
        const db = (tx - bx) * (tx - bx) + (ty - by) * (ty - by);

        return da <= db ? -1 : 1;
      });

      dropTarget = rects[0].target;
    }
  }

  function Drag(e: MouseEvent | Touch) {
    opts.isDragging.set(true);
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

    opts.isDragging.set(false);

    anchorSVG = null;
    anchorScreen = null;
    target = null;
    dropTarget = null;
    targetSVG = null;

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
    targetSVG = ToSVGPoint(
      { clientX: targetRect.x, clientY: targetRect.y } as MouseEvent,
      opts.svg.el,
      opts.panX,
      opts.panY
    );

    pointsToCheck = [
      {
        x: targetRect!.left + targetRect!.width / 2 - e.clientX,
        y: targetRect!.top + targetRect!.height / 2 - e.clientY,
      },
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

function CheckTypeCompatibility(source: Element, dest: Element) {
  const sourceTypes = new Set((source as HTMLElement).dataset.types?.split(' ').filter(i => i) || []);
  const destTypes = (dest as HTMLElement).dataset.types?.split(' ').filter(i => i) || [];
  return destTypes.length === 0 || destTypes.every(t => sourceTypes.has(t));
}

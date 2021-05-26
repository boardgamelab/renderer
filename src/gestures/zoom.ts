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

interface Opts {
  zoomLevel: Writable<number>;
}

const ZOOM_IN_MULTIPLIER = 1.3;
const ZOOM_OUT_MULTIPLIER = 0.7;

/**
 * Svelte directive that allows the viewport to be zoomed.
 */
export function zoom(node: HTMLElement, opts: Opts) {
  function MouseWheel(e: WheelEvent) {
    if (e.ctrlKey) {
      e.preventDefault();

      if (e.deltaY > 0) {
        opts.zoomLevel.update((v) => v * ZOOM_IN_MULTIPLIER);
      } else {
        opts.zoomLevel.update((v) => v * ZOOM_OUT_MULTIPLIER);
      }
    }
  }

  node.addEventListener('wheel', MouseWheel);

  return {
    destroy() {
      node.removeEventListener('wheel', MouseWheel);
    },

    update(newOpts: Opts) {
      opts = newOpts;
    },
  };
}

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

/**
 * Svelte directive that allows elements to be selected.
 */
export function select(node: Element) {
  function Select(e: Event) {
    const event = new CustomEvent('select');
    const target = (e.target as Element).closest('[data-selectable=true]');
    if (target) {
      target.dispatchEvent(event);
    }
  }

  node.addEventListener('touchstart', Select);
  node.addEventListener('mousedown', Select);

  return {
    destroy() {
      node.removeEventListener('mousedown', Select);
      node.removeEventListener('touchstart', Select);
    },
  };
}

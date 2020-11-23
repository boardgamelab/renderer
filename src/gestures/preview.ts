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

interface Opts {
  api: Preview;
  onTable?: boolean;
}

interface Preview {
  show: (e: Element, opts?: object) => void;
  hide: () => void;
}

export function preview(_: Element, opts: Opts) {
  let enable = false;
  let target: Element | null = null;
  let visible = true;

  function Show() {
    if (enable && target) {
      opts.api.show(target, { onTable: true });
      visible = true;
    } else if (visible) {
      visible = false;
      opts.api.hide();
    }
  }

  function MouseMove(e: MouseEvent) {
    target = (e.target as HTMLElement)?.closest('[data-preview=true]');
    Show();
  }

  function FindPreviewableElement() {
    let t = document.querySelector(':hover');
    while (t) {
      target = t;
      t = t.querySelector(':hover');
    }
    return target?.closest('[data-preview=true]') || null;
  }

  function IsKey(e: KeyboardEvent) {
    return e.keyCode === 32; // spacebar
  }

  function KeyDown(e: KeyboardEvent) {
    if (IsKey(e)) {
      enable = true;
      window.addEventListener('mousemove', MouseMove);
      target = FindPreviewableElement();
      Show();
    }
  }

  function KeyUp() {
    window.removeEventListener('mousemove', MouseMove);
    target = null;
    enable = false;
    Show();
  }

  // @ts-ignore
  window.addEventListener('keydown', KeyDown);
  // @ts-ignore
  window.addEventListener('keyup', KeyUp);

  return {
    destroy() {
      // @ts-ignore
      window.removeEventListener('mousemove', MouseMove);
      // @ts-ignore
      window.removeEventListener('keydown', KeyDown);
      // @ts-ignore
      window.removeEventListener('keyup', KeyUp);
    },

    update(newOpts: Opts) {
      opts = newOpts;
    },
  };
}

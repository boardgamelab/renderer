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

import type { Container, Schema, State } from '@boardgamelab/components';
import { GetComponent } from './utils/template';

const HAND = 1;

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function IsPointInsideBox(x: number, y: number, box: Box) {
  return (
    x >= box.x &&
    x <= box.x + box.width &&
    y >= box.y &&
    y <= box.y + box.height
  );
}

export function IsOverlap(a: Box, b: Box): boolean {
  if (IsPointInsideBox(a.x, a.y, b)) return true;
  if (IsPointInsideBox(a.x + a.width, a.y, b)) return true;
  if (IsPointInsideBox(a.x, a.y + a.height, b)) return true;
  if (IsPointInsideBox(a.x + a.width, a.y + a.height, b)) return true;
  if (IsPointInsideBox(b.x, b.y, a)) return true;
  if (IsPointInsideBox(b.x + b.width, b.y, a)) return true;
  if (IsPointInsideBox(b.x, b.y + b.height, a)) return true;
  if (IsPointInsideBox(b.x + b.width, b.y + b.height, a)) return true;
  return false;
}

export function FindIntersectingObjects(
  box: Box,
  schema: Schema,
  state: State
): string[] {
  let result = [];
  for (const id in state.objects) {
    const obj = state.objects[id];

    // Ignore objects in containers.
    if (obj.parent) {
      continue;
    }

    // Ignore snap zones.
    if ((obj as Container).isSnap) {
      continue;
    }

    const template = GetComponent(schema, state, id);
    if (!template) {
      continue;
    }

    if (template.type === 3) {
      continue;
    }

    const x = obj.x || 0;
    const y = obj.y || 0;
    const { width, height } = template.layout.geometry;
    if (IsOverlap(box, { x, y, width, height })) {
      result.push(id);
    }
  }
  return result;
}

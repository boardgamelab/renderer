import { cubicOut } from 'svelte/easing';

interface Point {
  x: number;
  y: number;
}

interface Params {
  key: string;
  toSVGPoint: (point: Point) => Point;
  parentID: string;
  ghost?: boolean;
  disable?: boolean;
  hand?: boolean;
  animate?: boolean;
  delay?: number;
  duration?: number;
  easing?: (t: number) => number;
}

type NodeInfo = Params & {
  rect: DOMRect;
};

export const senders = new Map();

function crossfade(from: NodeInfo, node: Element, params: Params) {
  const { delay = 0, duration = 250, easing = cubicOut } = params;

  const rect = node.getBoundingClientRect();

  let a = { x: rect.left, y: rect.top };
  let b = { x: from.rect.left, y: from.rect.top };

  if (!params.hand && !params.ghost) {
    a = params.toSVGPoint(a);
    b = params.toSVGPoint(b);
  }

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dw = from.rect.width / rect.width;
  const dh = from.rect.height / rect.height;

  let transform: string | null = null;

  if (params.hand || params.ghost) {
    const style = getComputedStyle(node);
    if (style.transform !== 'none') {
      transform = style.transform;
    }
  } else {
    transform = node.getAttribute('transform');
  }

  return {
    delay,
    duration,
    easing,
    tick: (t: number, u: number) => {
      const ux = u * dx;
      const uy = u * dy;
      let uw = t + u * dw;
      let uh = t + u * dh;

      if (isNaN(uw)) uw = 1;
      if (isNaN(uh)) uh = 1;

      if (params.ghost || params.hand) {
        let value = `translate3d(${ux}px, ${uy}px, 0) scale(${uw}, ${uh})`;
        value = transform ? `${transform} ${value}` : value;
        (node as HTMLElement).style.transform = value;
      } else {
        let value = `translate(${ux} ${uy}) scale(${uw} ${uh})`;
        value = transform ? `${transform} ${value}` : value;
        node.setAttribute('transform', value);
      }
    },
  };
}

export function send(node: Element, params: Params) {
  if (!params.disable) {
    const value = senders.get(params.key);

    if (!value || !value.ghost) {
      senders.set(params.key, {
        rect: node.getBoundingClientRect(),
        ...params,
      });
    }

    setTimeout(() => {
      senders.delete(params.key);
    }, 50);
  }

  return { duration: 0 };
}

export function receive(node: Element, params: Params) {
  return () => {
    let animation = {
      duration: 0,
    };

    if (senders.has(params.key)) {
      let other = senders.get(params.key);

      if (senders.has(other.parentID)) {
        other = senders.get(other.parentID);
      }

      // If the object has the same parent before and after,
      // then it's likely that the container was moved (and
      // we needn't transition the children).
      if (params.parentID !== other.parentID) {
        animation = crossfade(other, node, params);
      }
    }

    return animation;
  };
}

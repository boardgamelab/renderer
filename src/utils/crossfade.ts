import { cubicOut } from 'svelte/easing';

interface Point {
  x: number;
  y: number;
}

interface Params {
  key: string;
  toSVGPoint: (point: Point) => Point;
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

export function crossfade() {
  const receivers = new Map();
  const senders = new Map();

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
        const uw = t + u * dw;
        const uh = t + u * dh;

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

  function transition(items: typeof senders, counterparts: typeof receivers) {
    return (node: Element, params: Params) => {
      if (params.disable) {
        return { duration: 0 };
      }

      items.set(params.key, {
        rect: node.getBoundingClientRect(),
        ...params,
      });

      return () => {
        if (params.animate === false) {
          return { duration: 0 };
        }

        if (counterparts.has(params.key)) {
          const from = counterparts.get(params.key);
          counterparts.delete(params.key);
          items.delete(params.key);
          return crossfade(from, node, params);
        }

        if (!params.ghost) {
          items.delete(params.key);
        }

        return {
          duration: 0,
        };
      };
    };
  }

  return [transition(senders, receivers), transition(receivers, senders)];
}

const [send, receive] = crossfade();

export { send, receive };

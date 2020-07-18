import { cubicOut } from 'svelte/easing';

export function crossfade({ fallback, ...defaults }) {
  const to_receive = new Map();
  const to_send = new Map();

  function crossfade(from, node, params) {
    const { delay = 0, easing = cubicOut } = { ...defaults, ...params };

    const duration = params.animate ? 150 : 0;

    const rect = node.getBoundingClientRect();

    const a = params.toSVGPoint({ x: rect.left, y: rect.top });
    const b = params.toSVGPoint({ x: from.rect.left, y: from.rect.top });

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
      delay,
      duration,
      easing,
      tick: (t, u) => {
        const value = `${transform} translate(${u * dx},${u * dy})`;

        if (params.animate) {
          if (params.hand) {
            node.style.opacity = t < 1 ? 0 : 1;
          } else {
            node.setAttribute('transform', value);
          }
        }
      },
    };
  }

  function transition(items, counterparts) {
    return (node, params) => {
      items.set(params.key, {
        rect: node.getBoundingClientRect(),
      });

      return () => {
        if (counterparts.has(params.key)) {
          const from = counterparts.get(params.key);
          counterparts.delete(params.key);

          return crossfade(from, node, params);
        }

        items.delete(params.key);
      };
    };
  }

  return [transition(to_send, to_receive), transition(to_receive, to_send)];
}

const [send, receive] = crossfade({
  fallback: null,
});

export { send, receive };

import { cubicOut } from 'svelte/easing';

export function crossfade() {
  const receivers = new Map();
  const senders = new Map();

  function crossfade(from, node, params) {
    const { delay = 0, easing = cubicOut } = params;

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
        return null;
      };
    };
  }

  return [transition(senders, receivers), transition(receivers, senders)];
}

const [send, receive] = crossfade();

export { send, receive };

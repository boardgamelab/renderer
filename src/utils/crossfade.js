import { cubicOut } from 'svelte/easing';

export function crossfade() {
  const receivers = new Map();
  const senders = new Map();

  function crossfade(from, node, params) {
    const { delay = 0, duration = 250, easing = cubicOut } = params;

    const rect = node.getBoundingClientRect();

    const a = params.toSVGPoint({ x: rect.left, y: rect.top });
    const b = params.toSVGPoint({ x: from.rect.left, y: from.rect.top });

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dw = from.rect.width / rect.width;
    const dh = from.rect.height / rect.height;

    const transform = node.getAttribute('transform');

    return {
      delay,
      duration,
      easing,
      tick: (t, u) => {
        const ux = u * dx;
        const uy = u * dy;
        const uw = t + u * dw;
        const uh = t + u * dh;

        let value = `translate(${ux} ${uy}) scale(${uw} ${uh})`;
        value = transform ? `${transform} ${value}` : value;

        if (params.hand) {
          node.style.opacity = t < 1 ? 0 : 1;
        } else {
          node.setAttribute('transform', value);
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
        if (params.disable) {
          return;
        }

        if (counterparts.has(params.key)) {
          const from = counterparts.get(params.key);
          counterparts.delete(params.key);

          return crossfade(from, node, params);
        }

        items.delete(params.key);

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

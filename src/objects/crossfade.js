import { cubicOut } from 'svelte/easing';

export function crossfade({ fallback, ...defaults }) {
  const to_receive = new Map();
  const to_send = new Map();

  function crossfade(from, node, params) {
    const { delay = 0, easing = cubicOut } = { ...defaults, ...params };

    const duration = params.animate ? 150 : 0;

    const x = params.x;
    const y = params.y;

    const dx = from.x - x;
    const dy = from.y - y;

    const style = getComputedStyle(node);
    const transform = style.transform === 'none' ? '' : style.transform;

    return {
      delay,
      duration,
      easing,
      tick: (t, u) => {
        const value = `${transform} translate(${u * dx},${u * dy})`;
        if (params.animate) {
          node.setAttribute('transform', value);
        }
      },
    };
  }

  function transition(items, counterparts, intro) {
    return (node, params) => {
      items.set(params.key, {
        x: params.x,
        y: params.y,
      });

      return () => {
        if (counterparts.has(params.key)) {
          const { x, y } = counterparts.get(params.key);
          counterparts.delete(params.key);

          return crossfade({ x, y }, node, params);
        }

        // if the node is disappearing altogether
        // (i.e. wasn't claimed by the other list)
        // then we need to supply an outro
        items.delete(params.key);
        return fallback && fallback(node, params, intro);
      };
    };
  }

  return [
    transition(to_send, to_receive, false),
    transition(to_receive, to_send, true),
  ];
}

const [send, receive] = crossfade({
  fallback: null,
});

export { send, receive };

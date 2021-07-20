<script>
  export let kind;
  export let obj;
  export let id;
  export let center = false;
  export let scale = 1.0;
  export let gap = 'small';
  export let forceFaceDown = false;

  import GameObject from '../GameObject.svelte';
  import { flip } from 'svelte/animate';
</script>

<div
  class:snap-row={kind === 'row'}
  class:snap-col={kind === 'column'}
  class="w-full h-full flex items-end justify-center"
  class:center
>
  {#each obj.children as child, index (child.id)}
    <div
      class:snap-row={kind === 'row'}
      class:snap-col={kind === 'column'}
      data-droppable="true"
      data-id={id}
      data-at={index}
      class="flex"
      animate:flip={{ duration: 100 }}
    >
      <div
        class:gap-small={gap === 'small'}
        class:gap-large={gap === 'large'}
        class:gap-splay={gap === 'splay'}
      >
        <svg
          class="overflow-visible"
          viewBox="0 0 {child.component.layout.geometry.width.value} {child
            .component.layout.geometry.height.value}"
          width={child.component.layout.geometry.width.value * scale}
          height={child.component.layout.geometry.height.value * scale}
        >
          <GameObject
            id={child.id}
            obj={child}
            parentID={id}
            selectable={true}
            droppable={true}
            {forceFaceDown}
          />
        </svg>
      </div>
    </div>
  {/each}
</div>

<style>
  .snap-col .gap-small {
    @apply my-1;
  }

  .snap-col .gap-large {
    @apply my-8;
  }

  .snap-row .gap-small {
    @apply mx-1;
  }

  .snap-row .gap-large {
    @apply mx-8;
  }

  .snap-row .gap-splay {
    margin-left: -2rem;
  }

  .center {
    @apply items-center;
  }

  .at-slot {
    @apply w-32 h-32 items-stretch;
  }

  .at-end {
    @apply flex-grow;
  }

  .snap-row {
    @apply flex-row;
  }

  .snap-col {
    @apply flex-col;
  }
</style>

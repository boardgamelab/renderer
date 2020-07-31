<script>
  export let id;
  export let width;
  export let height;

  const stroke = '#111';
</script>

<rect
  data-id={id}
  x="50"
  y="50"
  rx="10"
  width={width - 100}
  height={height - 100}
  fill="#ddd"
  {stroke} />

<svg
  xmlns="http://www.w3.org/2000/svg"
  x={width / 2 - 150}
  y={height / 2 - 150}
  width="300"
  height="300"
  viewBox="0 0 136 136">
  <g transform="translate(0 -160)">
    <path
      d="M42 167l-1 1v17h8v25a41 41 0 00-23 37 41 41 0 0042 41 41 41 0 0041-41
      41 41 0 00-23-37v-25h8s0 0 0 0v-17-1z"
      opacity=".9"
      fill="#fff"
      stroke="#555"
      stroke-width="9.8"
      stroke-linejoin="round" />
    <circle cx="67.8" cy="248.3" r="27.8" opacity=".9" fill="#ff8700" />
    <circle cx="61.6" cy="254.6" r="2.2" opacity=".9" fill="none" />
    <rect
      width="19.1"
      height="19.1"
      x="143"
      y="203"
      ry="4.2"
      transform="rotate(23)"
      opacity=".9"
      fill="#fff" />
    <circle cx="148.1" cy="208.3" transform="rotate(23)" r="2.2" opacity=".9" />
    <circle cx="157.3" cy="216.7" transform="rotate(23)" r="2.2" opacity=".9" />
    <rect
      width="19.1"
      height="19.1"
      x="16"
      y="240"
      ry="4.2"
      transform="rotate(-12)"
      opacity=".9"
      fill="#fff" />
    <circle cx="25.2" cy="249.9" transform="rotate(-12)" r="2.2" opacity=".9" />
  </g>
</svg>

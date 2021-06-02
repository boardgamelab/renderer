<defs>
  <filter id="blur" x="0" y="0">
    <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
  </filter>

  <filter id="shadow" x="0" y="0" width="200%" height="200%">
    <feOffset result="offOut" in="SourceGraphic" dx="20" dy="20" />
    <feColorMatrix
      result="matrixOut"
      in="offOut"
      type="matrix"
      values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0" />
    <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="10" />
    <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
  </filter>

  <filter id="glow" x="-5000%" y="-5000%" width="10000%" height="10000%">
    <feFlood result="flood" flood-color="#ff8700" flood-opacity="1"></feFlood>
    <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>
    <feMorphology in="mask" result="dilated" operator="dilate" radius="10"></feMorphology>
    <feGaussianBlur in="dilated" result="blurred" stdDeviation="40"></feGaussianBlur>
    <feComposite in="blurred" in2="SourceGraphic" operator="arithmetic" k2="1" k3="-1" result="nocombine"></feComposite>
    <feMerge>
      <feMergeNode in="nocombine"></feMergeNode>
      <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  </filter>
</defs>

export function ToSVGPoint(e: MouseEvent | Touch, svg: SVGGraphicsElement) {
  if (!svg) {
    return { x: e.clientX, y: e.clientY };
  }
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return { x: e.clientX, y: e.clientY };
  }

  const x = (e.clientX - ctm.e) / ctm.a;
  const y = (e.clientY - ctm.f) / ctm.d;

  return { x, y };
}

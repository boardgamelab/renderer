export function ToSVGPoint(
  e: MouseEvent | Touch,
  svg: SVGGraphicsElement,
  panX?: number,
  panY?: number
) {
  if (!svg) {
    return { x: e.clientX, y: e.clientY };
  }
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return { x: e.clientX, y: e.clientY };
  }

  let x = (e.clientX - ctm.e) / ctm.a;
  let y = (e.clientY - ctm.f) / ctm.d;

  x -= panX || 0;
  y -= panY || 0;

  return { x, y };
}

export function ToSVGPointWithPan(
  point: { x: number; y: number },
  panX: number,
  panY: number,
  svg: SVGGraphicsElement
) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return point;
  }

  let x = (point.x - ctm.e) / ctm.a;
  let y = (point.y - ctm.f) / ctm.d;

  x -= panX;
  y -= panY;

  return { x, y };
}

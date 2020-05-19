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
  svg: SVGGraphicsElement,
  panX?: number,
  panY?: number
) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return point;
  }

  let x = (point.x - ctm.e) / ctm.a;
  let y = (point.y - ctm.f) / ctm.d;

  x -= panX || 0;
  y -= panY || 0;

  return { x, y };
}

export function ToClientPoint(
  point: { x: number; y: number },
  svg: SVGSVGElement
) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return point;
  }

  let p = svg.createSVGPoint();
  p.x = point.x;
  p.y = point.y;

  return p.matrixTransform(ctm);
}

export function ToClientLength(length: number, svg: SVGSVGElement) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return null;
  }

  const a = svg.createSVGPoint();
  const b = svg.createSVGPoint();
  a.x = 0;
  a.y = 0;
  b.x = length;
  b.y = 0;

  const ca = a.matrixTransform(ctm);
  const cb = b.matrixTransform(ctm);

  return cb.x - ca.x;
}

export function ToSVGLength(length: number, svg: SVGSVGElement) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return null;
  }

  const a = svg.createSVGPoint();
  const b = svg.createSVGPoint();
  a.x = 0;
  a.y = 0;
  b.x = length;
  b.y = 0;

  const inverse = ctm.inverse();
  const ca = a.matrixTransform(inverse);
  const cb = b.matrixTransform(inverse);

  return cb.x - ca.x;
}

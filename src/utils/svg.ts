interface Point {
  x: number;
  y: number;
}

export function ToSVGPoint(
  e: MouseEvent | Touch,
  svg: SVGGraphicsElement,
  panX?: number,
  panY?: number
) {
  const point = { x: e.clientX, y: e.clientY };
  if (!svg) {
    return point;
  }
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return point;
  }

  let { x, y } = ApplyCTMInverse(point, ctm);

  x -= panX || 0;
  y -= panY || 0;

  return { x, y };
}

export function ToSVGPointWithPan(
  point: Point,
  svg: SVGGraphicsElement,
  panX?: number,
  panY?: number
) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return point;
  }

  let { x, y } = ApplyCTMInverse(point, ctm);

  x -= panX || 0;
  y -= panY || 0;

  return { x, y };
}

export function ToClientPoint(point: Point, svg: SVGSVGElement) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return point;
  }
  return ApplyCTM(point, ctm);
}

export function ToClientLength(length: number, svg: SVGSVGElement) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return null;
  }
  const ca = ApplyCTM({ x: 0, y: 0 }, ctm);
  const cb = ApplyCTM({ x: length, y: 0 }, ctm);
  return cb.x - ca.x;
}

export function ToSVGLength(length: number, svg: SVGSVGElement) {
  const ctm = svg.getScreenCTM();
  if (!ctm) {
    return null;
  }
  const ca = ApplyCTMInverse({ x: 0, y: 0 }, ctm);
  const cb = ApplyCTMInverse({ x: length, y: 0 }, ctm);
  return cb.x - ca.x;
}

function ApplyCTM(point: Point, ctm: any): Point {
  const x = point.x * ctm.a + ctm.e;
  const y = point.y * ctm.d + ctm.f;
  return { x, y };
}

function ApplyCTMInverse(point: Point, ctm: any): Point {
  const x = ctm.a ? (point.x - ctm.e) / ctm.a : 0;
  const y = ctm.d ? (point.y - ctm.f) / ctm.d : 0;
  return { x, y };
}


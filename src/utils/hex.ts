export function FlatTopHexPoints(width: number, height: number): any[] {
  const h = (Math.sqrt(3) * height) / 2;

  const x1 = 0;
  const x2 = width / 4;
  const x3 = (3 * width) / 4;
  const x4 = width;
  const y1 = (height - h) / 2;
  const y2 = height / 2;
  const y3 = y1 + h;

  return [
    [x1, y2],
    [x2, y1],
    [x3, y1],
    [x4, y2],
    [x3, y3],
    [x2, y3],
  ];
}

export function FlatTopHexPointsStr(width: number, height: number): string {
  const points = FlatTopHexPoints(width, height);

  let str = '';
  points.forEach(p => {
    str = str + `${p[0]},${p[1]} `;
  });
  return str;
}

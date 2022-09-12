const RAD_DEG = Math.PI / 180.0;
const PI2 = 2 * Math.PI;

const pointOnArc = (center: [number, number], R: number, deg: number) => {
  const radians = (deg - 90) * RAD_DEG;

  return [center[0] + R * Math.cos(radians), center[1] + R * Math.sin(radians)];
};

const drawCircle = (center: [number, number], R: number, width: number) => {
  const innerR = R - width;
  const [x, y] = center;

  return [
    "M",
    x - R,
    y,
    "A",
    R,
    R,
    0,
    1,
    0,
    x + R,
    y,
    "A",
    R,
    R,
    0,
    1,
    0,
    x - R,
    y,

    "M",
    x - innerR,
    y,
    "A",
    innerR,
    innerR,
    0,
    1,
    0,
    x + innerR,
    y,
    "A",
    innerR,
    innerR,
    0,
    1,
    0,
    x - innerR,
    y,
    "Z",
  ];
};

/**
 * Generates arc path
 *
 * @param  {Array.<Number>} center
 * @param  {Number}         R
 * @param  {Number}         start
 * @param  {Number}         end
 * @param  {Number}         w
 * @param  {Number}         corner Corner radius
 *
 * @return {String|Array.<Number|String>}
 */

type PieParams = {
  center: [number, number];
  radius: number;
  angle: {
    start_deg: number;
    end_deg: number;
  };
  thickness: number;
  corner_radius: {
    start: number;
    end: number;
  };
};

export const pie = ({
  center,
  radius,
  angle: { start_deg, end_deg },
  thickness,
  corner_radius: _corner_radius,
}: PieParams) => {
  if (Math.abs(end_deg - start_deg) === 360) {
    return drawCircle(center, radius, thickness).join(" ");
  }

  const innerR = radius - thickness;
  const circumference = Math.abs(end_deg - start_deg);
  const corner_radius_start = Math.min(thickness / 2, _corner_radius.start);
  const corner_radius_end = Math.min(thickness / 2, _corner_radius.end);

  // inner and outer radiuses
  const innerR2 = innerR + corner_radius_start;
  const outerRadius = radius - corner_radius_start;

  // butts corner points
  const oStart = pointOnArc(center, outerRadius, start_deg);
  const oEnd = pointOnArc(center, outerRadius, end_deg);

  const iStart = pointOnArc(center, innerR2, start_deg);
  const iEnd = pointOnArc(center, innerR2, end_deg);

  const iSection = 360 * (corner_radius_start / (PI2 * innerR));
  const oSection = 360 * (corner_radius_start / (PI2 * radius));

  // arcs endpoints
  const iArcStart = pointOnArc(center, 0, start_deg + iSection);
  const iArcEnd = pointOnArc(center, 0, end_deg - iSection);

  const oArcStart = pointOnArc(
    center,
    radius,
    start_deg + (corner_radius_start === 0 ? 0 : oSection)
  );
  const oArcEnd = pointOnArc(
    center,
    radius,
    end_deg - (corner_radius_end === 0 ? 0 : oSection)
  );

  const arcSweep1 = circumference > 180 + 2 * oSection ? 1 : 0;
  const arcSweep2 = circumference > 180 + 2 * iSection ? 1 : 0;

  return [
    // begin path
    "M",
    oStart[0],
    oStart[1],
    // outer start corner
    "A",
    corner_radius_start,
    corner_radius_start,
    0,
    0,
    1,
    oArcStart[0],
    oArcStart[1],
    // outer main arc
    "A",
    radius,
    radius,
    0,
    arcSweep1,
    1,
    oArcEnd[0],
    oArcEnd[1],
    // outer end corner
    "A",
    corner_radius_end,
    corner_radius_end,
    0,
    0,
    1,
    oEnd[0],
    oEnd[1],
    // end butt
    "L",
    iEnd[0],
    iEnd[1],
    // inner end corner
    "A",
    corner_radius_start,
    corner_radius_start,
    0,
    0,
    1,
    iArcEnd[0],
    iArcEnd[1],
    // inner arc
    "A",
    innerR,
    innerR,
    0,
    arcSweep2,
    0,
    iArcStart[0],
    iArcStart[1],
    // inner start corner
    "A",
    corner_radius_start,
    corner_radius_start,
    0,
    0,
    1,
    iStart[0],
    iStart[1],
    "Z", // end path
  ].join(" ");
};

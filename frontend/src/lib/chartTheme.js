/**
 * Chart palette. Recharts writes SVG attributes, which cannot resolve CSS
 * variables, so the token values are mirrored here as literals.
 */
export const CHART_COLORS = {
  primary: '#6366f1',
  info: '#3b82f6',
  success: '#16a34a',
  warning: '#d97706',
  grid: '#e2e8f0',
  axis: '#64748b'
};

export const AXIS_PROPS = {
  stroke: CHART_COLORS.axis,
  fontSize: 12,
  tickLine: false,
  axisLine: false
};
/** Date range presets shared by the dashboard and the payments screens. */

export const DATE_RANGE_PRESETS = [
{ value: '7d', label: 'Last 7 days', days: 7, comparison: 'vs previous 7 days' },
{ value: '30d', label: 'Last 30 days', days: 30, comparison: 'vs previous month' },
{ value: '3m', label: 'Last 3 months', days: 90, comparison: 'vs previous 3 months' },
{ value: '6m', label: 'Last 6 months', days: 180, comparison: 'vs previous 6 months' },
{ value: '12m', label: 'Last 12 months', days: 365, comparison: 'vs previous year' },
{ value: 'all', label: 'All times', days: 0, comparison: null },
];


export const DEFAULT_RANGE_PRESET = '30d';

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

export function getPreset(value) {
  return (
    DATE_RANGE_PRESETS.find((preset) => preset.value === value) ||
    DATE_RANGE_PRESETS[1]);

}

/** Resolves a preset (or custom from/to) into the params the API expects. */
export function resolveRange({ preset = DEFAULT_RANGE_PRESET} = {}) {
  // if (preset === 'custom' && from && to) {
  //   return { preset, from, to, comparison: 'vs previous period' };
  // }
  const { days, comparison } = getPreset(preset);
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days || 30));
  return {
    preset: preset === 'custom' ? DEFAULT_RANGE_PRESET : preset,
    from: toDateInput(start),
    to: toDateInput(end),
    comparison
  };
}

export function todayInput() {
  return toDateInput(new Date());
}
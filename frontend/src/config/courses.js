/**
 * Course option lists.
 * TODO(api): categories should come from GET /api/categories once available.
 */
export const COURSE_CATEGORIES = [
{ value: 'development', label: 'Development' },
{ value: 'design', label: 'Design' },
{ value: 'data-science', label: 'Data Science' },
{ value: 'marketing', label: 'Marketing' },
{ value: 'business', label: 'Business' }];


export const COURSE_LEVELS = [
{ value: 'beginner', label: 'Beginner' },
{ value: 'intermediate', label: 'Intermediate' },
{ value: 'advanced', label: 'Advanced' }];


export const COURSE_SORT_OPTIONS = [
{ value: 'newest', label: 'Recently updated' },
{ value: 'most_revenue', label: 'Highest revenue' },
{ value: 'most_students', label: 'Most students' },
]


export const CURRENCIES = [
{ value: 'USD', label: 'USD — US Dollar' },
{ value: 'EUR', label: 'EUR — Euro' },
{ value: 'GBP', label: 'GBP — British Pound' }];


export function categoryLabel(value) {
  return COURSE_CATEGORIES.find((item) => item.value === value)?.label || '—';
}

export function levelLabel(value) {
  return COURSE_LEVELS.find((item) => item.value === value)?.label || '—';
}
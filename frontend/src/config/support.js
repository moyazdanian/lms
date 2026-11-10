/** Support ticket categories offered in the create-ticket form. */
export const TICKET_CATEGORIES = [
{ value: 'payments', label: 'Payments & payouts' },
{ value: 'billing', label: 'Billing & invoices' },
{ value: 'courses', label: 'Courses & content' },
{ value: 'technical', label: 'Technical issue' },
{ value: 'other', label: 'Something else' }];


export function ticketCategoryLabel(value) {
  return TICKET_CATEGORIES.find((category) => category.value === value)?.label || '—';
}
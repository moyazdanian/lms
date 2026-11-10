import {
  AlertTriangleIcon,
  ArchiveIcon,
  BanIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileEditIcon,
  GlobeIcon,
  InfoIcon,
  LoaderIcon,
  RotateCcwIcon,
  XCircleIcon } from
'lucide-react';

/**
 * One place for every status label, badge variant and icon in the app, so the
 * same state never renders two different ways — and status is never
 * communicated by color alone.
 */
const STATUS_MAP = {
  payment: {
    paid: { label: 'Paid', variant: 'success', icon: CheckCircle2Icon },
    pending: { label: 'Pending', variant: 'warning', icon: ClockIcon },
    failed: { label: 'Failed', variant: 'danger', icon: XCircleIcon },
    canceled: { label: 'Canceled', variant: 'muted', icon: RotateCcwIcon }
  },
  course: {
    // Display status derived from is_active — 'draft' here means "not
    // published yet" (private draft or awaiting review), not the DB enum.
    draft: { label: 'Not published', variant: 'secondary', icon: ClockIcon },
    published: { label: 'Published', variant: 'default', icon: GlobeIcon },
    // Lifecycle values of the DB status column (ongoing/completed).
    ongoing: { label: 'Ongoing', variant: 'outline', icon: LoaderIcon },
    completed: { label: 'Completed', variant: 'default', icon: CheckCircle2Icon },
  },
  approval: {
    // approval_status drives the admin workflow: a draft is the instructor's
    // private workspace and never needs admin approval.
    draft: { label: 'Draft', variant: 'muted', icon: FileEditIcon },
    pending_approval: { label: 'In review', variant: 'secondary', icon: ClockIcon },
    approved: { label: 'Approved', variant: 'default', icon: CheckCircle2Icon },
    rejected: { label: 'Rejected by admin', variant: 'destructive', icon: XCircleIcon },
  },
  editRequest: {
    pending: { label: 'Changes in review', variant: 'secondary', icon: ClockIcon },
    approved: { label: 'Changes approved', variant: 'default', icon: CheckCircle2Icon },
    rejected: { label: 'Changes rejected', variant: 'destructive', icon: XCircleIcon },
  },
  payout: {
    pending: { label: 'Pending', variant: 'default', icon: ClockIcon , className: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
    approved: { label: 'Approved', variant: 'default', icon: CheckCircle2Icon , className: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'},
    paid: { label: 'Paid', variant: 'default', icon: CheckCircle2Icon , className: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' },
    rejected: { label: 'Rejected', variant: 'default', icon: BanIcon , className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' }
  },
  ticket: {
    open: { label: 'Open', variant: 'info', icon: InfoIcon },
    pending: { label: 'Pending', variant: 'warning', icon: ClockIcon },
    resolved: { label: 'Resolved', variant: 'success', icon: CheckCircle2Icon },
    closed: { label: 'Closed', variant: 'muted', icon: XCircleIcon }
  },
  notification: {
    info: { label: 'Info', variant: 'info', icon: InfoIcon },
    success: { label: 'Success', variant: 'success', icon: CheckCircle2Icon },
    warning: { label: 'Warning', variant: 'warning', icon: AlertTriangleIcon },
    danger: { label: 'Alert', variant: 'danger', icon: AlertTriangleIcon }
  }
};

const FALLBACK = { label: 'Unknown', variant: 'outline', icon: InfoIcon };

export function getStatusMeta(domain, value) {
  const group = STATUS_MAP[domain] || {};
  return group[value] || { ...FALLBACK, label: value ? String(value) : FALLBACK.label };
}

export function getStatusOptions(domain, { includeAll = true } = {}) {
  const group = STATUS_MAP[domain] || {};
  const options = Object.entries(group).map(([value, meta]) => ({
    value,
    label: meta.label
  }));
  return includeAll ? [{ value: 'all', label: 'All statuses' }, ...options] : options;
}
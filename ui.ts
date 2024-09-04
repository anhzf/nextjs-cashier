import type { TRANSACTION_STATUSES } from '@/constants';

export const TRANSACTION_STATUSES_UI = {
  pending: {
    title: 'Hutang',
    classes: 'bg-red-100 text-red-500',
  },
  completed: {
    title: 'Lunas',
    classes: 'bg-green-100 text-green-500',
  },
  canceled: {
    title: 'Batal',
    classes: 'bg-gray-100 text-gray-500',
  },
} satisfies Record<typeof TRANSACTION_STATUSES[number], Record<string, unknown>>;
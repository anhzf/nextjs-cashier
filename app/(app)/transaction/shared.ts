import { LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY } from '@/calls/transactions';
import { TRANSACTION_STATUSES } from '@/constants';
import { DateQuerySchema } from '@/utils/validation';
import * as v from 'valibot';

export const QuerySchema = v.object({
  sortBy: v.optional(v.picklist(LIST_TRANSACTION_QUERY_SUPPORTED_SORT_BY)),
  status: v.optional(v.union([
    v.pipe(v.literal('all'), v.transform(() => undefined)),
    v.picklist(TRANSACTION_STATUSES),
  ])),
  from: v.optional(DateQuerySchema),
  to: v.optional(DateQuerySchema),
});
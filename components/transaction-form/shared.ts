import { TRANSACTION_STATUSES } from '@/constants';
import { DateQuerySchemaOptional } from '@/utils/validation';
import * as v from 'valibot';

export const TransactionFieldValuesSchema = v.object({
  customerId: v.optional(v.number()),
  status: v.optional(v.picklist(TRANSACTION_STATUSES), 'pending'),
  items: v.pipe(
    v.array(v.object({
      productId: v.string(),
      variant: v.string(),
      qty: v.number(),
    })),
    v.minLength(1),
  ),
  dueDate: v.optional(DateQuerySchemaOptional),
  paid: v.optional(v.number(), 0),
});

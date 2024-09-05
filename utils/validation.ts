import * as v from 'valibot';

export const NumberQuerySchema = v.pipe(v.string(), v.regex(/\d+/, 'Should be number'), v.transform(parseInt));

export const BooleanQuerySchema = v.pipe(v.string(), v.regex(/true|false/, 'Should be exactly true/false value'), v.transform((x) => x === 'true'));

export const DateQuerySchema = v.pipe(
  v.string(),
  v.check(v => String(new Date(v)) !== 'Invalid Date', 'Should be a valid date'),
  v.transform((v) => new Date(v)),
);

export const DateQuerySchemaOptional = v.pipe(
  v.string(),
  v.check((v) => v ? String(new Date(v)) !== 'Invalid Date' : true, 'Should be a valid date'),
  v.transform((v) => v ? new Date(v) : undefined),
);
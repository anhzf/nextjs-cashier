import * as v from 'valibot';

export const NumberQuerySchema = v.pipe(v.string(), v.regex(/\d+/, 'Should be number'), v.transform(parseInt));

export const BooleanQuerySchema = v.pipe(v.string(), v.regex(/true|false/, 'Should be exactly true/false value'), v.transform((x) => x === 'true'));

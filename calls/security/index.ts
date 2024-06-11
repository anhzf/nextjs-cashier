import * as bcrypt from 'bcrypt';

if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET not configured');
}

interface Hash {
  (value: string): string;
}

interface Compare {
  (a: string, b: string): boolean;
}

export const hash: Hash = (value) => bcrypt.hashSync(value, 10);

export const compare: Compare = (a, b) => bcrypt.compareSync(a, b);

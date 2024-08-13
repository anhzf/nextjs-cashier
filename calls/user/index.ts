import { compare, hash } from '@/calls/security';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * TODO: Move compare logic into security concern
 */
export const getUserByEmailAndPassword = async (email: string, password: string) => {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (result) {
    if (compare(password, result.password)) return result;
    else {
      throw new Error('Invalid password');
    }
  }
};

export const createUser = async (name: string, email: string, password: string) => {
  const [result] = await db.insert(users).values({
    name,
    email,
    password: hash(password),
  }).returning({
    id: users.id,
  });

  return result.id;
};
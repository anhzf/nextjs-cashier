import type { Session } from 'next-auth';

declare global {
  interface Request {
    auth: Session | null;
  }
}

export { };
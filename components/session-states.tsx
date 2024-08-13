'use client';

import { useSession } from 'next-auth/react';

export default function SessionStates() {
  const session = useSession();

  return (
    <pre className="whitespace-pre">{JSON.stringify(session, null, 2)}</pre>
  );
}
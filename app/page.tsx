import { AppBar } from '@/components/app-bar';

export default async function HomePage() {
  return (
    <div className="relative h-screen flex flex-col">
      <AppBar className="lg:hidden" />

      <main className="container relative flex flex-col p-0">
        Welcome!
      </main>
    </div>
  );
}
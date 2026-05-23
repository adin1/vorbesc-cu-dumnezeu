import { AppNav } from '@/components/ui/AppNav';
import { AuthGate } from '@/components/ui/AuthGate';
import { Disclaimer } from '@/components/ui/Disclaimer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-grid">
      <AppNav />
      <AuthGate>{children}</AuthGate>
      <Disclaimer />
    </main>
  );
}

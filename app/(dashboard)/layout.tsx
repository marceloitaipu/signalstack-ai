import { Sidebar } from '@/components/sidebar';
import { requireSession } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  return (
    <div className="flex">
      <Sidebar />
      <main className="min-h-screen flex-1 p-8">{children}</main>
    </div>
  );
}

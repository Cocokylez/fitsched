import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <DashboardShell>
      <main className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {children}
      </main>
      <DashboardNav />
    </DashboardShell>
  );
}

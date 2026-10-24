import { redirect } from "next/navigation";
import { isPlatformAdmin } from "@/lib/data/platform";
import { logout } from "@/app/admin/login/actions";
import { SuperAdminSidebar, SuperAdminTopBar } from "./super-admin-nav";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isPlatformAdmin())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-neutral-100 lg:flex">
      <SuperAdminSidebar onLogout={logout} />
      <div className="min-w-0 flex-1">
        <SuperAdminTopBar onLogout={logout} />
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

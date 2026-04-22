import { cookies } from "next/headers";
import AdminLogin from "@/app/admin/AdminLogin";
import AtlasApp from "@/app/components/AtlasApp";
import { ADMIN_COOKIE_NAME, isValidAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!isValidAdminSession(session)) {
    return <AdminLogin />;
  }

  return <AtlasApp adminMode />;
}

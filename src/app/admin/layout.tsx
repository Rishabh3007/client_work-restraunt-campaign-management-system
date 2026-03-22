import { cookies } from "next/headers";
import { verifyAdminJWT } from "@/lib/auth";
import { type Metadata } from "next";
import AdminShell from "./AdminShell";

export const metadata: Metadata = {
  title: "One Bite | Admin",
  description: "Administrative dashboard for One Bite (Kiyu Foods). Manage campaigns, track registrations, and monitor store performance.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get handler name from JWT for display (middleware already validated)
  let handlerName = "Admin";
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (token) {
      const payload = await verifyAdminJWT(token);
      if (payload) {
        handlerName = payload.handlerName;
      }
    }
  } catch {
    // Middleware handles unauthorized access
  }

  return <AdminShell handlerName={handlerName}>{children}</AdminShell>;
}

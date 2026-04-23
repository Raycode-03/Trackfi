import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { UserProvider } from "@/context/UserContext";
import { Metadata } from "next";
import { Providers } from "@/provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/common/sidebar";
import NavbarDashboard from "@/components/common/navbarDashboard";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    title: user ? `${user.email} — Trackfi alerts` : "Trackfi alerts",
    description: "Track your crypto portfolio in real time",
  };
}
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const supabase = await createClient();

  // const { data: { user }, error } = await supabase.auth.getUser();

  // if (!user || error) {
  //   redirect("/login");
  // }

  const user = {
    id: "123",
    email: "akerel@gmail.com",
    name: "ray",
    packageType: "Premium",
    image: "/images/person1.jpg",
  };
  const NAVBAR_HEIGHT = 20;

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar user={user} />
      <SidebarInset>
        <div style={{ paddingTop: NAVBAR_HEIGHT }}>
          <Providers>{children}</Providers>
        </div>
        <NavbarDashboard pageTitle="Alerts" />
        {/* <UserProvider user={user} staff={staff}>
          
          
        </UserProvider> */}
      </SidebarInset>
    </SidebarProvider>
  );
}

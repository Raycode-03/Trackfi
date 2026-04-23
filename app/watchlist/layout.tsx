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
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user?.id)
    .maybeSingle();
    
  return {
    title: user 
    ? `${profile?.name || user.email} — Trackfi Watchlist` : "Trackfi Watchlist",
    description: "Track your crypto portfolio in real time",
  };
}
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (!user || error) {
    redirect("/login");
  }

const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const NAVBAR_HEIGHT = 20;
  const mergedUser = {
  ...user,
  name: profile?.name,
  image: profile?.image,
  package_type: profile?.package_type,
}

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar user={mergedUser} />
      <SidebarInset>
        <NavbarDashboard pageTitle="Watchlist" />
        <UserProvider user={mergedUser}>
          <Providers>
              <div style={{ paddingTop: NAVBAR_HEIGHT }}>{children}</div>
          </Providers>

        </UserProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}

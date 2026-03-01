// app/menu/[table]/layout.tsx
import SessionProvider from '@/hooks/SessionProvider';
import { Providers } from "@/provider";
import NavbarDashboard from '@/components/users/navbarDashboard';
interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ table: string }>;
}

export default async function MenuLayout({ children, params }: LayoutProps) {
  const { table } = await params;
  const tableNumber = Number(table);

  if (isNaN(tableNumber)) {
    throw new Error('Invalid table number');
  }

  return (
    
    <Providers>
      <SessionProvider tableNumber={tableNumber}>
        <div>
          <NavbarDashboard tableNumber={tableNumber}/>
            {children}
        </div>
      </SessionProvider>
    </Providers>

  );
}
// app/menu/[table]/layout.tsx
import { Providers } from "@/provider";
interface LayoutProps {
  children: React.ReactNode;
}

export default async function Layout({ children }: LayoutProps) {

  return (
    
    <Providers>
        <div>
            {children}
        </div>
    </Providers>

  );
}
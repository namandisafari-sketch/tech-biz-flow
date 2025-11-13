import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Wrench,
  Package,
  Users,
  Receipt,
  ShoppingCart,
  Barcode,
  Settings,
  Info,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Wrench, label: "Jobs", path: "/jobs" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: Receipt, label: "Sales History", path: "/sales-history" },
  { icon: ShoppingCart, label: "POS", path: "/pos" },
  { icon: Barcode, label: "Barcode", path: "/barcode" },
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: Info, label: "About", path: "/about" },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-muted/30 flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-2xl font-bold text-sidebar-foreground">
              Tech<span className="text-sidebar-primary">Biz</span> Track
            </h1>
            <p className="text-xs text-sidebar-foreground/60 mt-1">
              Repair Shop Management
            </p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-sm font-semibold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  Admin User
                </p>
                <p className="text-xs text-sidebar-foreground/60">Administrator</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/login";
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card py-4 px-6 text-center text-sm text-muted-foreground">
        Made with hope for Ugandan Technicians By Frank
      </footer>
    </div>
  );
}

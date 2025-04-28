
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Box, 
  Truck, 
  Map, 
  Trash2, 
  Award, 
  ShoppingBag, 
  Bell, 
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const navigationItems = [
    { name: "Inicio", path: "/", icon: <Home size={20} /> },
    { name: "Usuarios", path: "/usuarios", icon: <Users size={20} /> },
    { name: "Empresas", path: "/empresas", icon: <Box size={20} /> },
    { name: "Recolecciones", path: "/recolecciones", icon: <Truck size={20} /> },
    { name: "Localidades", path: "/localidades", icon: <Map size={20} /> },
    { name: "Residuos", path: "/residuos", icon: <Trash2 size={20} /> },
    { name: "Puntos", path: "/puntos", icon: <Award size={20} /> },
    { name: "Canjes", path: "/canjes", icon: <ShoppingBag size={20} /> },
    // { name: "Notificaciones", path: "/notificaciones", icon: <Bell size={20} /> },
    // { name: "Configuración", path: "/configuracion", icon: <Settings size={20} /> },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar}
          className="bg-card shadow-md"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card shadow-md transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-eco-green">Eco-Puntos</h1>
            <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium",
                  location.pathname === item.path 
                    ? "bg-primary text-primary-foreground" 
                    : "text-foreground hover:bg-secondary"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t">
            <p className="text-xs text-muted-foreground">© 2025 Eco-Puntos</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "md:ml-64"
      )}>
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

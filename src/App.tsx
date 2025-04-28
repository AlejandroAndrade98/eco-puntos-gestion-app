
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Usuarios from "./pages/Usuarios";
import Empresas from "./pages/Empresas";
import Recolecciones from "./pages/Recolecciones";
import Localidades from "./pages/Localidades";
import Canjes from "./pages/Canjes";
import NotFound from "./pages/NotFound";
import Residuos from "./pages/Residuos";
import Puntos from "./pages/Puntos";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/recolecciones" element={<Recolecciones />} />
          <Route path="/residuos" element={<Residuos />} />
          <Route path="/puntos" element={<Puntos />} />
          <Route path="/localidades" element={<Localidades />} />
          <Route path="/canjes" element={<Canjes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

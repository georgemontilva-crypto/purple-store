import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

// Public pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQs from "./pages/FAQs";
import Checkout from "./pages/Checkout";

// Auth pages
import Register from "./pages/Register";
import VerifyPin from "./pages/VerifyPin";
import Login from "./pages/Login";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminContent from "./pages/admin/AdminContent";
import AdminFAQs from "./pages/admin/AdminFAQs";
import AdminMessages from "./pages/admin/AdminMessages";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/tienda" component={Shop} />
      <Route path="/producto/:slug">
        {(params) => <ProductDetail slug={params.slug} />}
      </Route>
      <Route path="/sobre-nosotros" component={About} />
      <Route path="/contacto" component={Contact} />
      <Route path="/faqs" component={FAQs} />
      <Route path="/checkout" component={Checkout} />

      {/* Auth routes */}
      <Route path="/registro" component={Register} />
      <Route path="/verificar" component={VerifyPin} />
      <Route path="/login" component={Login} />

      {/* Admin routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/productos" component={AdminProducts} />
      <Route path="/admin/productos/nuevo" component={AdminProducts} />
      <Route path="/admin/categorias" component={AdminCategories} />
      <Route path="/admin/categorias/nueva" component={AdminCategories} />
      <Route path="/admin/pedidos" component={AdminOrders} />
      <Route path="/admin/pedidos/:id">
        {() => <AdminOrders />}
      </Route>
      <Route path="/admin/clientes" component={AdminCustomers} />
      <Route path="/admin/contenido" component={AdminContent} />
      <Route path="/admin/faqs" component={AdminFAQs} />
      <Route path="/admin/mensajes" component={AdminMessages} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster richColors position="top-right" />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

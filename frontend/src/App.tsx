import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuditProvider } from "@/contexts/AuditContext";
import { ModulesProvider } from "@/contexts/ModulesContext";
import { TenantModulesProvider } from "@/contexts/TenantModulesContext";
import { AddonsCartProvider } from "@/contexts/AddonsCartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Tenants from "./pages/Tenants";
import TenantDetail from "./pages/TenantDetail";
import Usuarios from "./pages/Usuarios";
import Roles from "./pages/Roles";
import Logs from "./pages/Logs";
import Notificacoes from "./pages/Notificacoes";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Upgrade from "./pages/Upgrade";
import Profile from "./pages/Profile";
import Onboarding from "./pages/Onboarding";
import NicheTemplates from "./pages/NicheTemplates";
import AIOverview from "./pages/AIOverview";
import AuditLog from "./pages/AuditLog";
import Instagram from "./pages/Instagram";
import ModuleOperations from "./pages/ModuleOperations";
import PlanComparison from "./pages/PlanComparison";

// Tenant Social pages
import TenantInstagram from "./pages/tenant/TenantInstagram";

// Tenant pages (Admin/Operador)
import TenantDashboard from "./pages/tenant/TenantDashboard";
import TenantConfig from "./pages/tenant/TenantConfig";
import TenantAIConfig from "./pages/tenant/TenantAIConfig";
import TenantAIDashboard from "./pages/tenant/TenantAIDashboard";
import TenantChat from "./pages/tenant/TenantChat";
import TenantCalendar from "./pages/tenant/TenantCalendar";
import TenantAutomations from "./pages/tenant/TenantAutomations";
import TenantSupport from "./pages/tenant/TenantSupport";

// Tenant Billing pages
import TenantBilling from "./pages/tenant/TenantBilling";
import TenantPlans from "./pages/tenant/TenantPlans";
import TenantModules from "./pages/tenant/TenantModules";
import TenantInvoices from "./pages/tenant/TenantInvoices";
import TenantPayment from "./pages/tenant/TenantPayment";
import TenantBillingHistory from "./pages/tenant/TenantBillingHistory";

// SuperAdmin Billing pages
import FinancialDashboard from "./pages/billing/FinancialDashboard";
import AllSubscriptions from "./pages/billing/AllSubscriptions";
import AllInvoices from "./pages/billing/AllInvoices";
import ManagePlans from "./pages/billing/ManagePlans";
import ManageModules from "./pages/billing/ManageModules";
import ManageCoupons from "./pages/billing/ManageCoupons";
import BillingHistory from "./pages/billing/BillingHistory";

// SuperAdmin Support pages
import SupportDashboard from "./pages/support/SupportDashboard";
import ManageSLAs from "./pages/support/ManageSLAs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AuditProvider>
        <ModulesProvider>
          <TenantModulesProvider>
            <AddonsCartProvider>
              <NotificationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Onboarding />
                </ProtectedRoute>
              } />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/upgrade" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Upgrade />
                </ProtectedRoute>
              } />
              
              {/* SuperAdmin Routes - Only SuperAdmin can access */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/tenants" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Tenants />
                </ProtectedRoute>
              } />
              <Route path="/tenants/:id" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <TenantDetail />
                </ProtectedRoute>
              } />
              <Route path="/niche-templates" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <NicheTemplates />
                </ProtectedRoute>
              } />
              <Route path="/ai-overview" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <AIOverview />
                </ProtectedRoute>
              } />
              <Route path="/usuarios" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Usuarios />
                </ProtectedRoute>
              } />
              <Route path="/roles" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Roles />
                </ProtectedRoute>
              } />
              <Route path="/logs" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Logs />
                </ProtectedRoute>
              } />
              <Route path="/audit" element={
                <ProtectedRoute allowedRoles={['superadmin']} requiredPermissions={['system:full']}>
                  <AuditLog />
                </ProtectedRoute>
              } />
              <Route path="/notificacoes" element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'operador', 'visualizador']}>
                  <Notificacoes />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin', 'operador', 'visualizador']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/relatorios" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Relatorios />
                </ProtectedRoute>
              } />
              <Route path="/configuracoes" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Configuracoes />
                </ProtectedRoute>
              } />
              <Route path="/instagram" element={
                <ProtectedRoute allowedRoles={['superadmin']} requiredPermissions={['instagram:view']}>
                  <Instagram />
                </ProtectedRoute>
              } />
              <Route path="/module-operations" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <ModuleOperations />
                </ProtectedRoute>
              } />
              
              {/* SuperAdmin Billing Routes */}
              <Route path="/billing" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <FinancialDashboard />
                </ProtectedRoute>
              } />
              <Route path="/billing/subscriptions" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <AllSubscriptions />
                </ProtectedRoute>
              } />
              <Route path="/billing/invoices" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <AllInvoices />
                </ProtectedRoute>
              } />
              <Route path="/billing/plans" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <ManagePlans />
                </ProtectedRoute>
              } />
              <Route path="/billing/modules" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <ManageModules />
                </ProtectedRoute>
              } />
              <Route path="/billing/coupons" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <ManageCoupons />
                </ProtectedRoute>
              } />
              <Route path="/billing/history" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <BillingHistory />
                </ProtectedRoute>
              } />
              <Route path="/plan-comparison" element={
                <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
                  <PlanComparison />
                </ProtectedRoute>
              } />

              {/* SuperAdmin Support Routes */}
              <Route path="/support" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SupportDashboard />
                </ProtectedRoute>
              } />
              <Route path="/support/slas" element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <ManageSLAs />
                </ProtectedRoute>
              } />
              
              {/* Tenant Routes - Admin, Operador, Visualizador can access based on their permissions */}
              <Route path="/tenant/dashboard" element={
                <ProtectedRoute allowedRoles={['admin', 'operador']}>
                  <TenantDashboard />
                </ProtectedRoute>
              } />
              <Route path="/tenant/config" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantConfig />
                </ProtectedRoute>
              } />
              <Route path="/tenant/ai/config" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantAIConfig />
                </ProtectedRoute>
              } />
              <Route path="/tenant/ai/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantAIDashboard />
                </ProtectedRoute>
              } />
              <Route path="/tenant/chat" element={
                <ProtectedRoute allowedRoles={['admin', 'operador', 'visualizador']}>
                  <TenantChat />
                </ProtectedRoute>
              } />
              <Route path="/tenant/calendar" element={
                <ProtectedRoute allowedRoles={['admin', 'operador']}>
                  <TenantCalendar />
                </ProtectedRoute>
              } />
              <Route path="/tenant/automations" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantAutomations />
                </ProtectedRoute>
              } />
              <Route path="/tenant/support" element={
                <ProtectedRoute allowedRoles={['admin', 'operador']}>
                  <TenantSupport />
                </ProtectedRoute>
              } />
              
              {/* Tenant Billing Routes - Admin only */}
              <Route path="/tenant/billing" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantBilling />
                </ProtectedRoute>
              } />
              <Route path="/tenant/billing/plans" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantPlans />
                </ProtectedRoute>
              } />
              <Route path="/tenant/billing/modules" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantModules />
                </ProtectedRoute>
              } />
              <Route path="/tenant/billing/invoices" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantInvoices />
                </ProtectedRoute>
              } />
              <Route path="/tenant/billing/payment" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantPayment />
                </ProtectedRoute>
              } />
              <Route path="/tenant/billing/history" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TenantBillingHistory />
                </ProtectedRoute>
              } />
              
              {/* Tenant Social Routes */}
              <Route path="/tenant/instagram" element={
                <ProtectedRoute allowedRoles={['admin', 'operador']}>
                  <TenantInstagram />
                </ProtectedRoute>
              } />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
              </TooltipProvider>
            </NotificationProvider>
          </AddonsCartProvider>
          </TenantModulesProvider>
        </ModulesProvider>
      </AuditProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

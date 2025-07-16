import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { AdminLayout } from "@/components/AdminLayout";
import Login from "@/pages/auth/Login";
import Dashboard from "@/pages/Dashboard";
import ClientsList from "@/pages/clients/ClientsList";
import ClientDetails from "@/pages/clients/ClientDetails";
import ClientForm from "@/pages/clients/ClientForm";
import ProductsList from "@/pages/products/ProductsList";
import ProductDetails from "@/pages/products/ProductDetails";
import ProductForm from "@/pages/products/ProductForm";
import ProductCategories from "@/pages/products/ProductCategories";
import ProductBrands from "@/pages/products/ProductBrands";
import ProductKitsPage from "@/pages/products/ProductKitsPage";
import Stock from "@/pages/stock/Stock";
import StockEntry from "@/pages/stock/StockEntry";
import StockMovements from "@/pages/stock/StockMovements";
import OrdersList from "@/pages/orders/OrdersList";
import OrderDetails from "@/pages/orders/OrderDetails";
import OrderForm from "@/pages/orders/OrderForm";
import Cashier from "@/pages/cashier/Cashier";
import CashierOpen from "@/pages/cashier/CashierOpen";
import CashierClose from "@/pages/cashier/CashierClose";
import CashierHistory from "@/pages/cashier/CashierHistory";
import AppointmentsList from "@/pages/appointments/AppointmentsList";
import AppointmentsCalendar from "@/pages/appointments/AppointmentsCalendar";
import AppointmentForm from "@/pages/appointments/AppointmentForm";
import AutomationPage from "@/pages/automation/AutomationPage";
import CRMEnhanced from "@/pages/crm/CRMEnhanced";
import CRMClient from "@/pages/crm/CRMClient";
import FinanceReceivables from "@/pages/finance/FinanceReceivables";
import FinancePayables from "@/pages/finance/FinancePayables";
import FinanceReports from "@/pages/finance/FinanceReports";
import FinanceBanks from "@/pages/finance/FinanceBanks";
import FinanceInvoices from "@/pages/finance/FinanceInvoices";
import Employees from "@/pages/employees/Employees";
import UserProfile from "@/pages/users/UserProfile";
import UserSettings from "@/pages/users/UserSettings";
import UserActivityLog from "@/pages/users/UserActivityLog";
import SupportTickets from "@/pages/support/SupportTickets";
import FranchiseChat from "@/pages/chat/FranchiseChat";
import Integrations from "@/pages/integrations/Integrations";
import SettingsProfile from "@/pages/settings/SettingsProfile";
import SettingsInvoices from "@/pages/settings/SettingsInvoices";
import SettingsPermissions from "@/pages/settings/SettingsPermissions";
import SettingsConventions from "@/pages/settings/SettingsConventions";
import NFeTemplatesPage from "@/pages/settings/NFeTemplatesPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTenants from "@/pages/admin/AdminTenants";
import AdminTenantDetails from "@/pages/admin/AdminTenantDetails";
import AdminSubscriptions from "@/pages/admin/AdminSubscriptions";
import AdminUsage from "@/pages/admin/AdminUsage";
import AdminSettings from "@/pages/admin/AdminSettings";
import NotFound from "@/pages/NotFound";
//import AdminSupport from "@/pages/admin/AdminSupport";
import NewRule from "@/pages/crm/NewRule";
import AdminFinance from "@/pages/admin/AdminFinance";
import UsersAdmin from "@/pages/admin/UsersAdmin";
import FranchisesAdmin from "@/pages/admin/FranchisesAdmin";
import AdminProducts from "@/pages/admin/AdminProducts";
import { RequireAuth } from "@/contexts/RequireAuth";
import Subscription from "@/pages/Subscription/Subscription";
import AdminSupport from "@/pages/admin/AdminSupportTickets";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/forgot-password" element={<Login />} />
          <Route path="/reset-password" element={<Login />} />
          <Route path="/verify-email" element={<Login />} />

          
          {/* Main Application Routes */}
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            
            {/* Clients routes */}
            <Route path="clients" element={<RequireAuth><ClientsList /></RequireAuth>} />
            <Route path="clients/new" element={<RequireAuth><ClientForm /></RequireAuth>} />
            <Route path="clients/:id" element={<RequireAuth><ClientDetails /></RequireAuth>} />
            <Route path="clients/:id/edit" element={<RequireAuth><ClientForm /></RequireAuth>} />
            
            {/* Products routes */}
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/categories" element={<ProductCategories />} />
            <Route path="products/brands" element={<ProductBrands />} />
            <Route path="products/kits" element={<ProductKitsPage />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="products/:id/edit" element={<ProductForm />} />
            
            {/* Stock routes */}
            <Route path="stock" element={<Stock />} />
            <Route path="stock/entry" element={<StockEntry />} />
            <Route path="stock/movements" element={<StockMovements />} />
            
            {/* Orders routes */}
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/new" element={<OrderForm />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="orders/:id/edit" element={<OrderForm />} />
            
            {/* Cashier routes */}
            <Route path="cashier" element={<Cashier />} />
            <Route path="cashier/open" element={<CashierOpen />} />
            <Route path="cashier/close" element={<CashierClose />} />
            <Route path="cashier/history" element={<CashierHistory />} />
            
            {/* Appointments routes */}
            <Route path="appointments" element={<AppointmentsList />} />
            <Route path="appointments/calendar" element={<AppointmentsCalendar />} />
            <Route path="appointments/new" element={<AppointmentForm />} />
            <Route path="appointments/:id" element={<AppointmentForm />} />
            <Route path="appointments/:id/edit" element={<AppointmentForm />} />
            
            {/* Automation routes */}
            <Route path="automation" element={<AutomationPage />} />
            
            {/* CRM routes */}
            <Route path="crm" element={<CRMEnhanced />} />
            <Route path="crm/new-rule" element={<NewRule />} />
            <Route path="crm/:clientId" element={<CRMClient />} />
            
            {/* Finance routes */}
            <Route path="finance/receivables" element={<FinanceReceivables />} />
            <Route path="finance/payables" element={<FinancePayables />} />
            <Route path="finance/reports" element={<FinanceReports />} />
            <Route path="finance/banks" element={<FinanceBanks />} />
            <Route path="finance/invoices" element={<FinanceInvoices />} />
            
            {/* Employees routes */}
            <Route path="employees" element={<Employees />} />
            
            {/* User routes */}
            <Route path="user/profile" element={<UserProfile />} />
            <Route path="user/settings" element={<UserSettings />} />
            <Route path="chat/internal" element={<FranchiseChat />} />
            
            {/* Settings routes */}
            <Route path="settings/profile" element={<SettingsProfile />} />
            <Route path="settings/invoices" element={<SettingsInvoices />} />
            <Route path="settings/permissions" element={<SettingsPermissions />} />
            <Route path="settings/conventions" element={<SettingsConventions />} />
            <Route path="settings/nfe-templates" element={<NFeTemplatesPage />} />
            <Route path="settings/tickets" element={<SupportTickets />} />
            <Route path="settings/integrations" element={<Integrations />} />
            <Route path="settings/activity-log" element={<UserActivityLog />} />
            <Route path="subscription" element={<Subscription />} />
          </Route>

          {/* Admin Area Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<RequireAuth><AdminDashboard /></RequireAuth>} />
            <Route path="tenants" element={<RequireAuth><AdminTenants /></RequireAuth>} />
            <Route path="tenants/:id" element={<RequireAuth><AdminTenantDetails /></RequireAuth>} />
            <Route path="subscriptions" element={<RequireAuth><AdminSubscriptions /></RequireAuth>} />
            <Route path="support" element={<RequireAuth><AdminSupport /></RequireAuth>} />
            <Route path="usage" element={<RequireAuth><AdminUsage /></RequireAuth>} />
            <Route path="settings" element={<RequireAuth><AdminSettings /></RequireAuth>} />
            <Route path="finance" element={<RequireAuth><AdminFinance /></RequireAuth>} />
            <Route path="users" element={<RequireAuth><UsersAdmin /></RequireAuth>} />
            <Route path="franchises" element={<RequireAuth><FranchisesAdmin /></RequireAuth>} />
            <Route path="products" element={<RequireAuth><AdminProducts /></RequireAuth>} />
            <Route path="user/profile" element={<UserProfile />} />
            <Route path="user/settings" element={<UserSettings />} />

          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

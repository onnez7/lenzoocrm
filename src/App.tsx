
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import InternalChat from "@/pages/chat/InternalChat";
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
import AdminSupport from "@/pages/admin/AdminSupport";
import NewRule from "@/pages/crm/NewRule";
import AdminFinance from "@/pages/admin/AdminFinance";



const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Main Application Routes */}
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Clients routes */}
            <Route path="clients" element={<ClientsList />} />
            <Route path="clients/new" element={<ClientForm />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="clients/:id/edit" element={<ClientForm />} />
            
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
            <Route path="chat/internal" element={<InternalChat />} />
            
            {/* Settings routes */}
            <Route path="settings/profile" element={<SettingsProfile />} />
            <Route path="settings/invoices" element={<SettingsInvoices />} />
            <Route path="settings/permissions" element={<SettingsPermissions />} />
            <Route path="settings/conventions" element={<SettingsConventions />} />
            <Route path="settings/nfe-templates" element={<NFeTemplatesPage />} />
            <Route path="settings/tickets" element={<SupportTickets />} />
            <Route path="settings/integrations" element={<Integrations />} />
            <Route path="settings/activity-log" element={<UserActivityLog />} />
          </Route>

          {/* Admin Area Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tenants" element={<AdminTenants />} />
            <Route path="tenants/:id" element={<AdminTenantDetails />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route path="support" element={<AdminSupport />} />
            <Route path="usage" element={<AdminUsage />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="finance" element={<AdminFinance />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

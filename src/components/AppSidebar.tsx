import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  IconCalendarEventFilled, 
  IconChevronDown, 
  IconCurrencyDollar, 
  IconMessageCircle, 
  IconPackage, 
  IconShoppingCart, 
  IconSettings, 
  IconUser, 
  IconClipboardList, 
  IconSitemap, 
  IconTablePlus, 
  IconUsers, 
  IconFileDollar, 
  IconLayoutDashboard,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NavUser } from "@/components/nav-user";
import Logo  from "@/components/logo";


const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    title: "Clientes",
    url: "/clients",
    icon: IconUser,
    subItems: [
      { title: "Listar Clientes", url: "/clients" },
      { title: "Novo Cliente", url: "/clients/new" },
    ],
  },
  {
    title: "Produtos",
    url: "/products",
    icon: IconShoppingCart,
    subItems: [
      { title: "Listar Produtos", url: "/products" },
      { title: "Novo Produto", url: "/products/new" },
      { title: "Categorias", url: "/products/categories" },
    ],
  },
  {
    title: "Estoque",
    url: "/stock",
    icon: IconPackage,
    subItems: [
      { title: "Controle", url: "/stock" },
      { title: "Entrada", url: "/stock/entry" },
      { title: "Movimentações", url: "/stock/movements" },
    ],
  },
  {
    title: "Ordens de Serviço",
    url: "/orders",
    icon: IconClipboardList,
    subItems: [
      { title: "Listar OS", url: "/orders" },
      { title: "Nova OS", url: "/orders/new" },
    ],
  },
  {
    title: "Caixa",
    url: "/cashier",
    icon: IconCurrencyDollar,
    subItems: [
      { title: "Controle", url: "/cashier" },
      { title: "Abrir Caixa", url: "/cashier/open" },
      { title: "Fechar Caixa", url: "/cashier/close" },
      { title: "Histórico", url: "/cashier/history" },
    ],
  },
  {
    title: "Agendamentos",
    url: "/appointments",
    icon: IconCalendarEventFilled,
    subItems: [
      { title: "Listar", url: "/appointments" },
      { title: "Calendário", url: "/appointments/calendar" },
      { title: "Novo", url: "/appointments/new" },
    ],
  },
  {
    title: "Mensagem",
    url: "/chat/internal",
    icon: IconMessageCircle,
  },
  {
    title: "Automação",
    url: "/automation",
    icon: IconSitemap,
  },
  {
    title: "CRM",
    url: "/crm",
    icon: IconUsers,
  },
  {
    title: "Financeiro",
    url: "/finance",
    icon: IconFileDollar,
    subItems: [
      { title: "Contas a Receber", url: "/finance/receivables" },
      { title: "Contas a Pagar", url: "/finance/payables" },
      { title: "Relatórios", url: "/finance/reports" },
      { title: "Bancos", url: "/finance/banks" },
      { title: "Faturas", url: "/finance/invoices" },
    ],
  },
  {
    title: "Funcionários",
    url: "/employees",
    icon: IconUsers,
  },
  {
    title: "Usuário",
    url: "/user",
    icon: IconUser,
    subItems: [
      { title: "Meu Perfil", url: "/user/profile" },
      { title: "Configurações", url: "/user/settings" },
    ],
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: IconSettings,
    subItems: [
      { title: "Perfil da Ótica", url: "/settings/profile" },
      { title: "Notas Fiscais", url: "/settings/invoices" },
      { title: "Permissões", url: "/settings/permissions" },
      { title: "Convênios", url: "/settings/conventions" },
      { title: "Integraçao", url: "/settings/integrations" },
      { title: "Tickets de suporte", url: "/settings/tickets" },
      { title: "Log de Atividade", url: "/settings/activity-log" },
    ],
  },
  {
    title: "adiministraçao matriz",
    url: "/admin",
    icon: IconTablePlus,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (item: any) => {
    if (isActive(item.url)) return true;
    if (item.subItems) {
      return item.subItems.some((subItem: any) => isActive(subItem.url));
    }
    return false;
  };

  const toggleGroup = (title: string) => {
    setOpenGroups(prev =>
      prev.includes(title)
        ? prev.filter(group => group !== title)
        : [...prev, title]
    );
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `w-full justify-start transition-colors ${
      isActive
        ? "bg-primary text-primary-foreground font-medium"
        : "hover:bg-muted/50"
    }`;

    return (
      <Sidebar className={(collapsed ? "w-14" : "w-64") + " bg-white md:bg-background z-50"}>
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <div className="h-auto w-[120px]">
            <Logo />
            </div>
          )}
        </div>
  
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.subItems ? (
                      <Collapsible
                        open={openGroups.includes(item.title)}
                        onOpenChange={() => toggleGroup(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            className={getNavClassName({
                              isActive: isGroupActive(item),
                            })}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            {!collapsed && (
                              <>
                                <span className="flex-1">{item.title}</span>
                                <IconChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent className="ml-6 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuButton key={subItem.url} asChild>
                                <NavLink
                                  to={subItem.url}
                                  className={getNavClassName({
                                    isActive: isActive(subItem.url),
                                  })}
                                >
                                  <span className="text-sm">{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuButton>
                            ))}
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavClassName({
                            isActive: isActive(item.url),
                          })}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
      </Sidebar>
    );
  }  

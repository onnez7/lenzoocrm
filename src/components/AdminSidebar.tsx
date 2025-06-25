
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Layout,
  Users,
  FileText,
  Settings,
  DollarSign,
  BarChart3,
  CreditCard,
  ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NavUser } from "@/components/nav-user";
import Logo from "@/components/logo";
import { IconChevronDown } from "@tabler/icons-react";

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
    url: "/admin",
    icon: Layout,
  },
  {
    title: "Franqueandos",
    url: "/admin/tenants",
    icon: Users,
  },
  {
    title: "Assinaturas",
    url: "/admin/subscriptions",
    icon: FileText,
  },
  {
    title: "Suporte",
    url: "/admin/support",
    icon: CreditCard,
  },
  {
    title: "Pagamentos",
    url: "/admin/payments",
    icon: DollarSign,
  },
  {
    title: "Uso & Métricas",
    url: "/admin/usage",
    icon: BarChart3,
  },
  {
    title: "Configurações",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
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
      <Sidebar className={collapsed ? "w-14" : "w-64"}>
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
                {navigationItems.map((item: any) => (
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

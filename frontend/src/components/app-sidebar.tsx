"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Users,
  Smartphone,
  ShoppingCart,
  Wrench,
  DollarSign,
  UserCog,
  BarChart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/logo";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const getDynamicData = (user: User | null) => ({
  user: {
    name: user?.username || "Guest",
    email: user?.role || "N/A",
    avatar: "",
  },
  navGroups: [
    {
      label: "Dashboard",
      items: [
        {
          title: "POS Dashboard",
          url: "/pos-dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: "Inventory",
      items: [
        {
          title: "Phones",
          url: "/phones",
          icon: Smartphone,
        },
        {
          title: "Purchases",
          url: "/purchases",
          icon: ShoppingCart,
        },
        {
          title: "Repairs",
          url: "/repairs",
          icon: Wrench,
        },
      ],
    },
    {
      label: "Transactions",
      items: [
        {
          title: "Sales",
          url: "/sales",
          icon: DollarSign,
        },
        {
          title: "Customers",
          url: "/customers",
          icon: Users,
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "Workers",
          url: "/workers",
          icon: UserCog,
        },
        {
          title: "Reports",
          url: "/reports/financial",
          icon: BarChart,
        },
      ],
    },
  ],
})

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  const data = getDynamicData(user)
  
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/pos-dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">TechNova</span>
                  <span className="truncate text-xs">Phone Shop POS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

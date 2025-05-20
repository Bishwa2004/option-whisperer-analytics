
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  TrendingUp, 
  BarChart, 
  Download, 
  Activity,
  Users,
  Star,
  FileText,
  Search,
  PieChart,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel,
  SidebarHeader, 
  SidebarInput,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem
} from "@/components/ui/sidebar";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/analysis", label: "Analysis", icon: TrendingUp },
  { path: "/news", label: "News", icon: FileText },
  { path: "/market-data", label: "Market Data", icon: BarChart },
  { path: "/portfolio", label: "Portfolio Manager", icon: PieChart },
  { path: "/options-calculator", label: "Options Calculator", icon: Activity },
  { path: "/data-management", label: "Data Management", icon: Download },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="text-finance-lightBlue h-6 w-6" />
          <span className="font-bold text-xl">OptionsAnalyzer</span>
        </div>
        <div className="mt-2">
          <SidebarInput placeholder="Search symbols..." />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    isActive={location.pathname === item.path}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Portfolios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="All Portfolios">
                  <PieChart className="h-4 w-4" />
                  <span>All Portfolios</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Growth Strategy">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span>Growth Strategy</span>
                  <span className="ml-auto text-xs bg-green-100 text-green-800 px-1.5 rounded">+2.4%</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Income Portfolio">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span>Income Portfolio</span>
                  <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-1.5 rounded">+0.8%</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link to="/portfolio">
                  <SidebarMenuButton tooltip="Create Portfolio" variant="outline" size="sm">
                    <span>+ Create Portfolio</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Watchlists</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Technology">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Technology</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Blue Chip">
                  <Star className="h-4 w-4 text-blue-500" />
                  <span>Blue Chip</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-4 w-4 mr-2 text-finance-lightBlue" />
            <span className="text-sm">Alerts</span>
          </div>
          <span className="bg-finance-lightBlue text-xs px-1.5 py-0.5 rounded-full text-white">3</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

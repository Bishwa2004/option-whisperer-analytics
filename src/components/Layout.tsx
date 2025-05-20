
import React from "react";
import { Outlet } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger, SidebarRail } from "@/components/ui/sidebar";
import AppSidebar from "./Sidebar";

const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b flex items-center justify-between p-4">
            <div className="flex items-center">
              <SidebarTrigger />
              <h2 className="ml-4 font-medium">Options Analysis Dashboard</h2>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-muted-foreground">Premium Trial: 14 days left</span>
            </div>
          </div>
          <SidebarRail />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;


import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Separator } from "@/components/ui/separator";

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Separator />
      <main className="container mx-auto p-4 mb-16">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

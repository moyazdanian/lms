"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SidebarContext = React.createContext(null);

export function SidebarProvider({ children, className }) {
  const [openMobile, setOpenMobile] = React.useState(false);
  return (
    <SidebarContext.Provider value={{ openMobile, setOpenMobile }}>
      <div className={cn("flex min-h-screen w-full", className)}>{children}</div>
    </SidebarContext.Provider>
  );
}

export function SidebarTrigger({ className, ...props }) {
  const { setOpenMobile } = React.useContext(SidebarContext);
  return (
    <Button variant="outline" size="icon" className={cn("lg:hidden", className)} onClick={() => setOpenMobile(true)} {...props}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open sidebar</span>
    </Button>
  );
}

export function Sidebar({ children, className }) {
  const { openMobile, setOpenMobile } = React.useContext(SidebarContext);
  return (
    <>
      <aside className={cn("hidden w-72 shrink-0 lg:block", className)}>{children}</aside>
      {openMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close sidebar" className="absolute inset-0 bg-black/50" onClick={() => setOpenMobile(false)} />
          <aside className="relative h-full w-80 max-w-[85vw] animate-in slide-in-from-left duration-300 bg-background shadow-xl">
            {children}
            <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={() => setOpenMobile(false)}>
              <X className="h-5 w-5" />
            </Button>
          </aside>
        </div>
      )}
    </>
  );
}

export function SidebarContent({ children, className }) {
  return <div className={cn("flex h-full min-h-0 flex-col overflow-y-auto", className)}>{children}</div>;
}

export function SidebarHeader({ children, className }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function SidebarGroup({ children, className }) {
  return <div className={cn("px-3 py-2", className)}>{children}</div>;
}

export function SidebarGroupLabel({ children, className }) {
  return <div className={cn("px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}>{children}</div>;
}

export function SidebarGroupContent({ children, className }) {
  return <div className={cn("space-y-1", className)}>{children}</div>;
}

export function SidebarMenu({ children, className }) {
  return <nav className={cn("space-y-1", className)}>{children}</nav>;
}

export function SidebarMenuItem({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children, active, className, asChild, ...props }) {
  const classes = cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted", active && "bg-primary text-primary-foreground hover:bg-primary/90", className);
  if (asChild) return React.cloneElement(children, { className: cn(classes, children.props.className), ...props });
  return <button className={classes} {...props}>{children}</button>;
}

export function SidebarFooter({ children, className }) {
  return <div className={cn("mt-auto p-3", className)}>{children}</div>;
}

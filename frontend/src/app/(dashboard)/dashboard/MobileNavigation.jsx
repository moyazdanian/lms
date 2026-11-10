"use client";
import React from 'react';
import { MenuIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SidebarNav } from './SidebarNav';
import { BrandMark } from './BrandMark';

export function MobileNavigation({ role, pathname, open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu">
          
          <MenuIcon aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pt-0">
        <div className="flex h-16 items-center border-b border-border px-4">
          <SheetTitle asChild>
            <span>
              <BrandMark />
            </span>
          </SheetTitle>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-6">
          <SidebarNav
            role={role}
            pathname={pathname}
            onNavigate={() => onOpenChange(false)} />
          
        </div>
      </SheetContent>
    </Sheet>);

}
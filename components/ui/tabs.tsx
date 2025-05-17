"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-auto rounded-md p-1 dark:text-white text-gray-800",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center w-full cursor-pointer justify-center whitespace-nowrap rounded-lg p-3 text-balance font-medium ring-offset-white transition-all disabled:pointer-events-none disabled:opacity-50 duration-300",
        // حالت پیش‌فرض لایت
        "bg-white text-gray-800 hover:bg-gray-100",
        // حالت دارک
        "dark:bg-[#27272c] dark:text-white dark:hover:bg-gray-700",
        // وقتی تب فعال است
        "data-[state=active]:bg-blue-500 bg-gray-200 data-[state=active]:text-white data-[state=active]:font-bold data-[state=active]:shadow-md",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

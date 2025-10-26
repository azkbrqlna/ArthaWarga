import React from "react";
import {
    Calendar,
    Home,
    Inbox,
    SquareCheckBig,
    LayoutTemplate,
} from "lucide-react";

import {
    Sidebar,
    SidebarProvider,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items
const items = [
    {
        title: "Ringkasan",
        url: "ringkasan/pemasukan-bop",
        icon: LayoutTemplate,
    },
    { title: "Approval", url: "#", icon: SquareCheckBig },
];

export default function Dashboard() {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel classname="font-bold text-red-50">
                            ArthaWarga
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a
                                                href={item.url}
                                                className="flex items-center gap-2 hover:underline"
                                            >
                                                <item.icon className="w-4 h-4" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </SidebarProvider>
    );
}

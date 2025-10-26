import React from "react";
import { SquareCheckBig, LayoutTemplate } from "lucide-react";

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
        url: "/ringkasan/pemasukan-bop",
        icon: LayoutTemplate,
    },
    { title: "Approval", url: "#", icon: SquareCheckBig },
];

export default function AppLayout({ children }) {
    return (
        <SidebarProvider>
            {/* Gunakan flex dan pastikan sidebar tidak mengecil */}
            <div className="flex min-h-screen w-full overflow-hidden">
                {/* Sidebar */}
                <Sidebar className="w-[260px] flex-shrink-0">
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className="font-bold text-lg px-2 py-3">
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

                {/* Area Konten */}
                <main className="flex-1 h-screen bg-white overflow-y-auto overflow-x-hidden">
                    {/* Jangan kasih max-width di sini */}
                    <div className="w-full h-full px-6 py-10 md:px-10 md:py-12">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}

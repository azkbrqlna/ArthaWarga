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
            {/* Bungkus sidebar agar background hijau tampil penuh */}
            <div className="w-[260px] min-h-screen bg-[#A1FFC2] border-r border-black/10">
                <Sidebar className="bg-transparent">
                    <SidebarContent>
                        <SidebarGroup>
                            {/* perbaiki huruf className */}
                            <SidebarGroupLabel className="font-bold text-black px-4 py-3">
                                ArthaWarga
                            </SidebarGroupLabel>

                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <a
                                                    href={item.url}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[#EEF2FF]/70 text-gray-800 transition-colors"
                                                >
                                                    <item.icon className="w-4 h-4 text-gray-600" />
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
            </div>
        </SidebarProvider>
    );
}

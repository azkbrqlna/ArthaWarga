import React from "react";
import { SquareCheckBig, LayoutTemplate, Menu } from "lucide-react";
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
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePage } from "@inertiajs/react";

const items = [
    {
        title: "Ringkasan Keuangan",
        url: "/ringkasan/pemasukan",
        icon: LayoutTemplate,
    },
    { title: "Approval", url: "/approval", icon: SquareCheckBig },
];

export default function AppLayout({ children }) {
    const { url } = usePage();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full overflow-hidden">
                <div className="fixed top-4 left-4 z-50 md:hidden">
                    <SidebarTrigger className="bg-white rounded-md shadow p-2">
                        <Menu className="w-5 h-5 text-gray-700" />
                    </SidebarTrigger>
                </div>

                <div className="hidden md:block w-[260px] flex-shrink-0 bg-[#A1FFC2] border-r border-black/10">
                    <Sidebar>
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupLabel className="font-bold text-lg px-4 py-4 text-black">
                                    ArthaWarga
                                </SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {items.map((item) => {
                                            const isActive = url.startsWith(
                                                item.url
                                            );
                                            return (
                                                <SidebarMenuItem
                                                    key={item.title}
                                                >
                                                    <SidebarMenuButton asChild>
                                                        <a
                                                            href={item.url}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                                                                isActive
                                                                    ? "bg-[#EEF2FF] text-[#4F46E5] font-medium"
                                                                    : "text-gray-700 hover:bg-[#EEF2FF]/70"
                                                            }`}
                                                        >
                                                            <item.icon
                                                                className={`w-4 h-4 ${
                                                                    isActive
                                                                        ? "text-[#4F46E5]"
                                                                        : "text-gray-600"
                                                                }`}
                                                            />
                                                            <span>
                                                                {item.title}
                                                            </span>
                                                        </a>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>
                </div>

                {/* Area Konten */}
                <main className="flex-1 h-screen bg-white overflow-y-auto overflow-x-hidden">
                    <div className="w-full h-full px-6 py-10 md:px-10 md:py-12">
                        {children}
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}

import React from "react";
import { Inbox, Menu, Grid2x2Plus, ChevronRight } from "lucide-react";
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
        title: "Dashboard",
        url: "/superadmin",
        icon: Grid2x2Plus,
    },
    { title: "Manajemen Data", url: "/approval", icon: Inbox },
];

export default function AppLayoutSuperadmin({ children }) {
    const { url } = usePage();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full overflow-hidden">
                <div className="fixed top-4 left-4 z-50 md:hidden">
                    <SidebarTrigger className="bg-white rounded-md shadow p-2">
                        <Menu className="w-5 h-5 text-gray-700" />
                    </SidebarTrigger>
                </div>

                <div className="hidden md:flex flex-col justify-between w-[240px] flex-shrink-0 bg-[#A1FFC2] border-r border-black/10">

                    <Sidebar>
                        <SidebarContent>
                            <SidebarGroup>
                                <SidebarGroupLabel className="text-2xl font-bold px-4 pt-30 text-black pb-10">
                                    Selamat Datang, Admin!
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
                                                            className={`relative flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${
                                                            isActive
                                                                ? "text-[#4F46E5] font-medium"
                                                                : "text-gray-700 hover:text-[#4F46E5]"
                                                            }`}
                                                        >
                                                            {/* Highlight custom */}
                                                            {isActive && (
                                                            <span
                                                                className="absolute top-0 bottom-0 -left-2 right-1 bg-[#EEF2FF] rounded-full shadow-md scale-x-90 transition-all duration-300"
                                                            ></span>
                                                            )}

                                                            {/* Konten teks + ikon di atas highlight */}
                                                            <span className="relative z-10 flex items-center gap-2">
                                                            <item.icon
                                                                className={`w-4 h-4 ${
                                                                isActive ? "text-[#4F46E5]" : "text-gray-600"
                                                                }`}
                                                            />
                                                            <span>{item.title}</span>
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

                    {/* ✅ Bagian Profil */}
                    <div className="border-t border-black/100 p-3">
                        <a
                            href="/profil"
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#EEF2FF]/70 transition"
                        >
                            <img
                                src="https://i.pravatar.cc/40"
                                alt="Profile"
                                className="w-10 h-10 rounded-full border"
                            />
                            <div className="flex flex-col text-sm">
                                <span className="text-gray-600">Welcome back 👋</span>
                                <span className="font-semibold text-black">Johnathan</span>
                            </div>
                            <ChevronRight className="ml-auto w-4 h-4 text-gray-500" />
                        </a>
                    </div>
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

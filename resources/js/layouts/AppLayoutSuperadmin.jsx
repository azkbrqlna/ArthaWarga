import React from "react";
import { Inbox, Menu, Grid2x2Plus } from "lucide-react";
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
import { WelcomeCard } from "@/components/ui/welcome-card";
import { usePage, Link } from "@inertiajs/react";
import { Toaster } from "sonner";
import AIChat from "@/components/AIChat";

const items = [
    {
        title: "Dashboard",
        url: "/superadmin",
        icon: Grid2x2Plus,
    },
    {
        title: "Manajemen Data",
        url: "/manajemen_data",
        icon: Inbox,
    },
];

export default function AppLayoutSuperadmin({ children }) {
    const { url } = usePage();
    const isProfilActive = url.startsWith("/superadmin/profil");

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                {/* Tombol Sidebar (Mobile) */}
                <div className="fixed top-4 left-4 z-50 md:hidden">
                    <SidebarTrigger className="bg-white rounded-md shadow p-2">
                        <Menu className="w-5 h-5 text-gray-700" />
                    </SidebarTrigger>
                </div>

                {/* Sidebar */}
                <Sidebar className="hidden md:flex flex-col  bg-[#59B5F7] border-r border-black/10 rounded-tr-[48px] justify-between h-full">
                    <SidebarContent className="flex flex-col justify-between h-full">
                        <div>
                            {/* Header Sidebar */}
                            <SidebarGroup>
                                <SidebarGroupLabel className="font-bold text-lg px-4 pt-4 text-black">
                                    ArthaWarga
                                </SidebarGroupLabel>

                                {/* Say Welcome */}
                                <WelcomeCard name="Superadmin" lastUpdate="11/12/2025" />
                                
                                {/* Menu Navigasi */}
                                <SidebarGroupContent>
                                    <SidebarMenu className="mt-6 flex flex-col gap-3 px-4">
                                        {items.map((item) => {
                                            const isActive =
                                                item.url === "/superadmin"
                                                    ? url === "/superadmin"
                                                    : url.startsWith(item.url);

                                            return (
                                                <SidebarMenuItem
                                                    key={item.title}
                                                >
                                                    <SidebarMenuButton asChild>
                                                        <Link
                                                            href={item.url}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors  ${
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
                                                            <span className="text-sm">
                                                                {item.title}
                                                            </span>
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        </div>

                        {/* Profil */}
                        <Link
                            href="/superadmin/profil"
                            className={`border-t border-black/80 p-3 flex items-center gap-2 transition-colors ${
                                isProfilActive
                                    ? "bg-[#59B5F7]/90 font-semibold text-gray-800"
                                    : "text-gray-700 hover:bg-[#59B5F7]/70"
                            }`}
                        >
                            <img
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Johnathan"
                                alt="avatar"
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                                <p className="text-xs text-gray-600">
                                    Welcome back 👋
                                </p>
                                <p className="font-medium text-sm">Johnathan</p>
                            </div>
                            <span className="text-lg text-gray-600">›</span>
                        </Link>
                    </SidebarContent>
                </Sidebar>

                {/* Konten Utama */}
                <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
                    <div className="w-full h-full p-0 bg-white">{children}</div>
                </main>
            </div>

            <Toaster position="top-right" richColors closeButton />
            <AIChat />
        </SidebarProvider>
    );
}
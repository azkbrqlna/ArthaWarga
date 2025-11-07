import React from "react";
import {
    SquareCheckBig,
    LayoutTemplate,
    Menu,
    LogOut,
    Database,
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
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { usePage, useForm } from "@inertiajs/react";
import { Toaster } from "sonner";
import AIChat from "@/components/AIChat";

export default function AppLayout({ children }) {
    const { url, props } = usePage();
    const { auth } = props;
    const { post } = useForm();

    const handleLogout = (e) => {
        e.preventDefault();
        post(route("logout"));
    };

    const displayName = auth?.user?.nm_lengkap
        ? auth.user.nm_lengkap.split(" ").slice(0, 2).join(" ")
        : "Guest";

    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        displayName
    )}`;

    // 🔹 menu normal untuk non-admin
    const defaultItems = [
        {
            title: "Ringkasan Keuangan",
            url: "/dashboard",
            icon: LayoutTemplate,
        },
        { title: "Approval", url: "/approval", icon: SquareCheckBig },
    ];

    // 🔹 menu khusus admin
    const adminItems = [
        { title: "Dashboard", url: "/dashboard", icon: LayoutTemplate },
        { title: "Manajemen Data", url: "/manajemen-data", icon: Database },
    ];

    // 🔹 pilih menu berdasarkan role
    const items = auth?.user?.role_id === 1 ? adminItems : defaultItems;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-white">
                {/* Sidebar Trigger Mobile */}
                <div className="fixed top-4 left-4 z-50 md:hidden">
                    <SidebarTrigger className="bg-white rounded-md shadow p-2">
                        <Menu className="w-5 h-5 text-gray-700" />
                    </SidebarTrigger>
                </div>

                {/* Sidebar */}
                <Sidebar className="hidden md:flex flex-col bg-[#59B5F7] border-r border-black/10 rounded-tr-[48px] justify-between h-full">
                    <SidebarContent className="flex flex-col justify-between h-full">
                        <div>
                            <SidebarGroup>
                                <SidebarGroupLabel className="font-bold text-lg px-4 pt-4 text-black">
                                    {auth?.user?.role_id === 1
                                        ? "Selamat Datang Admin"
                                        : "ArthaWarga"}
                                </SidebarGroupLabel>

                                <SidebarGroupContent>
                                    <SidebarMenu className="mt-6 flex flex-col gap-3 px-4">
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
                                                            <span className="text-sm">
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
                        </div>

                        {/* Profil + Logout */}
                        <div className="border-t border-black/10 p-3 flex items-center gap-2 justify-between">
                            <div className="flex items-center gap-2">
                                <img
                                    src={avatarUrl}
                                    alt="avatar"
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <p className="text-xs text-gray-600">
                                        Welcome back 👋
                                    </p>
                                    <p className="font-medium text-sm">
                                        {displayName}
                                    </p>
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleLogout}
                                title="Logout"
                                className="hover:bg-red-100 text-red-600"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </SidebarContent>
                </Sidebar>

                {/* Main Content */}
                <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
                    <div className="w-full h-full px-8 py-10 md:px-12 md:py-12 bg-white">
                        {children}
                    </div>
                </main>
            </div>

            <Toaster position="top-right" richColors closeButton />
            <AIChat />
        </SidebarProvider>
    );
}

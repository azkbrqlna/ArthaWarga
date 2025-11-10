import React from "react";
import { SquareCheckBig, LayoutTemplate, Menu, CandlestickChartIcon, WalletIcon } from "lucide-react";
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
import { Toaster } from "sonner";
import AIChat from "@/components/AIChat";

const items = [
    {
        title: "Ringkasan Keuangan",
        url: "/dashboard",
        icon: LayoutTemplate,
    },
    { title: "Iuran Warga", url: "/masuk-iuran", icon: WalletIcon },
];

export default function AppLayout({ children }) {
    const { url } = usePage();

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-white">
                <div className="fixed top-4 left-4 z-50 md:hidden">
                    <SidebarTrigger className="bg-white rounded-md shadow p-2">
                        <Menu className="w-5 h-5 text-gray-700" />
                    </SidebarTrigger>
                </div>

                <Sidebar className="hidden md:flex flex-col  bg-[#59B5F7] border-r border-black/10 rounded-tr-[48px] justify-between h-full">
                    <SidebarContent className="flex flex-col justify-between h-full">
                        <div>
                            <SidebarGroup>
                                <SidebarGroupLabel className="font-bold text-lg px-4 pt-4 text-black">
                                    ArthaWarga
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

                        <div className="border-t border-black/10 p-3 flex items-center gap-2">
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
                        </div>
                    </SidebarContent>
                </Sidebar>

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
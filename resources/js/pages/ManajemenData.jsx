import React, { useState } from "react";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, usePage } from "@inertiajs/react"; 
import { router } from '@inertiajs/react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ManajemenData() {
    const { props } = usePage(); 
    const users = props.users?.data || []; 
    const roles = props.roles || [];

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const filteredData = users.filter(
        (item) =>
            (item.nm_lengkap.toLowerCase().includes(search.toLowerCase()) ||
                item.no_kk.includes(search)) &&
            (roleFilter === "all" || item.role?.nm_role === roleFilter)
    );

    return (
        <AppLayout>
            <div className="flex flex-col min-h-screen bg-white">
                <main className="flex-1 p-6 md:p-8 w-full">
                    <h1 className="text-2xl md:text-3xl font-bold border-b-2 border-gray-200 py-3 md:py-5">
                        Manajemen Data
                    </h1>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pt-4">
                        <div className="flex items-center w-full sm:w-1/2 relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Cari berdasarkan nama"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-[120px] text-gray-600">
                                    <SelectValue placeholder="Filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.nama_role}>
                                            {r.nama_role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Link href="/tambah-data">
                                <Button className="bg-[#4C6FFF] hover:bg-[#3b5ae0] text-white flex items-center gap-2">
                                    <Plus size={16} /> Tambah Data
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="overflow-x-auto border rounded-xl shadow-sm">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="py-2 px-3 text-left font-medium">No. KK</th>
                                    <th className="py-2 px-3 text-left font-medium">Nama Lengkap</th>
                                    <th className="py-2 px-3 text-left font-medium">Email</th>
                                    <th className="py-2 px-3 text-left font-medium">Role</th>
                                    <th className="py-2 px-3 text-left font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-2 px-3">{item.no_kk}</td>
                                        <td className="py-2 px-3">{item.nm_lengkap}</td>
                                        <td className="py-2 px-3">{item.email}</td>
                                        <td className="py-2 px-3">{item.role?.nm_role}</td>
                                        <td className="py-2 px-3 flex items-center gap-2">
                                            <Link href={`/manajemen-data/${item.id}/edit`}>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="bg-yellow-300 hover:bg-yellow-400"
                                                >
                                                    <Pencil className="w-4 h-4 text-gray-800" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="bg-red-500 hover:bg-red-600"
                                                onClick={() => {
                                                    if (confirm(`Yakin mau hapus data ${item.nm_lengkap}?`)) {
                                                        router.delete(route('superadmin.deleteUser', item.id));
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </AppLayout>
    );
}

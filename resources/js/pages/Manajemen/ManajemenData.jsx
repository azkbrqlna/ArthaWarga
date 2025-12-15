import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import AppLayout from "@/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, usePage, router } from "@inertiajs/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { route } from "ziggy-js";

// <--- BARU: Import hook notifikasi (sesuaikan path foldernya)
import { useNotify } from "@/components/ToastNotification"; 

export default function ManajemenData() {
    const { props } = usePage();
    const users = props.users?.data || [];
    const roles = props.roles || [];
    const filters = props.filters || {};

    // <--- BARU: Panggil hook
    const { notifySuccess, notifyError } = useNotify();

    const [search, setSearch] = useState(filters.search || "");
    const [roleFilter, setRoleFilter] = useState(filters.role || "all");

    const [openDelete, setOpenDelete] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const handleFilter = (newSearch, newRole) => {
        router.get(
            route("superadmin.users"),
            { search: newSearch, role: newRole },
            { preserveState: true, replace: true }
        );
    };

    const onSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        handleFilter(val, roleFilter);
    };

    const onRoleChange = (val) => {
        setRoleFilter(val);
        handleFilter(search, val);
    };

    const resetFilter = () => {
        setSearch("");
        setRoleFilter("all");
        handleFilter("", "all");
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setOpenDelete(true);
    };

    const executeDelete = () => {
        if (userToDelete) {
            router.delete(route("superadmin.deleteUser", userToDelete.id), {
                // <--- BARU: Tambahkan logic onSuccess dan onError
                onSuccess: () => {
                    setOpenDelete(false);
                    notifySuccess("Berhasil", `Data ${userToDelete.nm_lengkap} telah dihapus.`);
                    setUserToDelete(null);
                },
                onError: () => {
                    setOpenDelete(false);
                    notifyError("Gagal", "Terjadi kesalahan saat menghapus data.");
                },
                // Jika ingin loading state manual, bisa pakai onFinish
                // onFinish: () => setOpenDelete(false) 
            });
        }
    };

    return (
        <AppLayout>
            <div className="space-y-10">
                
                {/* MODAL PORTAL */}
                {openDelete && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in zoom-in-95 duration-200">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                                <Trash2 className="h-8 w-8 text-red-600" />
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Hapus Data Pengguna?
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">
                                Apakah Anda yakin ingin menghapus data{" "}
                                <span className="font-bold text-gray-800">
                                    {userToDelete?.nm_lengkap}
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </p>

                            <div className="flex gap-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setOpenDelete(false)}
                                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={executeDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white border-none shadow-md shadow-red-200"
                                >
                                    Ya, Hapus
                                </Button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-white">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        <span className="font-bold text-gray-900 pr-5">
                            MANAJEMEN DATA
                        </span>
                    </h1>

                    <div className="mt-4 md:mt-0">
                        <Link href="/tambah-data">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                <Plus size={16} className="mr-2" />
                                Tambah Data
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* FILTER SECTION */}
                <div className="bg-white w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative w-full md:w-1/3">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Cari berdasarkan nama atau KK"
                                value={search}
                                onChange={onSearchChange}
                                className="pl-9"
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Select value={roleFilter} onValueChange={onRoleChange}>
                                <SelectTrigger className="w-[150px] text-gray-700">
                                    <SelectValue placeholder="Filter Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    {roles.map((r) => (
                                        <SelectItem key={r.id} value={r.nm_role}>
                                            {r.nm_role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {(search || roleFilter !== "all") && (
                                <Button
                                    variant="outline"
                                    onClick={resetFilter}
                                    className="text-gray-700"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="rounded-xl border overflow-hidden shadow-sm bg-white">
                    <table className="min-w-full text-sm text-gray-700">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="py-3 px-4 text-left font-medium">No. KK</th>
                                <th className="py-3 px-4 text-left font-medium">Nama Lengkap</th>
                                <th className="py-3 px-4 text-left font-medium">Domisili</th>
                                <th className="py-3 px-4 text-left font-medium">Role</th>
                                <th className="py-3 px-4 text-left font-medium">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((item, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">{item.no_kk}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-bold">{item.nm_lengkap}</div>
                                        <div className="text-xs text-gray-500">{item.email}</div>
                                    </td>
                                    <td className="py-3 px-4 max-w-xs">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.alamat}</span>
                                            <span className="text-xs text-gray-500">
                                                RT {item.rt}/RW {item.rw}, {item.kelurahan?.nama_kelurahan},{" "}
                                                {item.kecamatan?.nama_kecamatan}, {item.kota?.nama_kota}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <Badge variant="outline">{item.role?.nm_role}</Badge>
                                    </td>
                                    <td className="py-3 px-4 flex items-center gap-2">
                                        <Link href={`/manajemen-data/${item.id}/edit`}>
                                            <Button variant="outline" size="icon" className="bg-yellow-300 hover:bg-yellow-400">
                                                <Pencil className="w-4 h-4 text-gray-800" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="bg-red-500 hover:bg-red-600"
                                            onClick={() => confirmDelete(item)}
                                        >
                                            <Trash2 className="w-4 h-4 text-white" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td className="py-6 text-center text-gray-500" colSpan={5}>
                                        Tidak ada data ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
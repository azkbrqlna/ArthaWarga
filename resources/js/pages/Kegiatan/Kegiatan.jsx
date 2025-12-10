import React, { useState, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Kegiatan() {
    const { kegiatans } = usePage().props;

    const [sortField, setSortField] = useState("tgl_mulai");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);

    // ✅ State untuk Popup Gambar
    const [selectedImage, setSelectedImage] = useState(null);

    const itemsPerPage = 8;

    const toggleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const sortedData = useMemo(() => {
        if (!kegiatans?.data) return [];

        return [...kegiatans.data].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];

            if (!valA || !valB) return 0;
            if (typeof valA === "string") {
                return sortOrder === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            return sortOrder === "asc" ? valA - valB : valB - valA;
        });
    }, [kegiatans, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ✅ Fungsi helper format tarikh (seperti kod rakan anda)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    // Fungsi untuk pindah ke halaman detail saat baris diklik
    const handleRowClick = (id) => {
        router.visit(route("kegiatan.show", id));
    };

    return (
        <AppLayout>
            <div className="space-y-10 relative">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-white">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        <span className="font-bold text-gray-900 pr-5">
                            DAFTAR KEGIATAN
                        </span>
                    </h1>

                    <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-4 py-2 rounded-md"
                        onClick={() => router.visit("/dashboard/kegiatan")}
                    >
                        Tambah Kegiatan
                    </Button>
                </div>

                {/* Table */}
                <div className="pb-10">
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-white">
                                    {[
                                        {
                                            key: "nm_keg",
                                            label: "Nama Kegiatan",
                                        },
                                        {
                                            key: "tgl_mulai",
                                            label: "Tanggal Mulai",
                                        },
                                        {
                                            key: "tgl_selesai",
                                            label: "Tanggal Selesai",
                                        },
                                        {
                                            key: "pj_keg",
                                            label: "Penanggung Jawab",
                                        },
                                        { key: "panitia", label: "Panitia" },
                                        { key: "dok_keg", label: "Dokumen" },
                                    ].map((col) => (
                                        <TableHead
                                            key={col.key}
                                            onClick={() => toggleSort(col.key)}
                                            className="font-semibold cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedData.length ? (
                                    paginatedData.map((keg, i) => (
                                        <TableRow
                                            key={i}
                                            // ✅ 1. Jadikan Baris Bisa Diklik
                                            className="hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() =>
                                                handleRowClick(keg.id)
                                            }
                                        >
                                            <TableCell>{keg.nm_keg}</TableCell>
                                            {/* ✅ Gunakan formatDate di sini */}
                                            <TableCell>
                                                {formatDate(keg.tgl_mulai)}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(keg.tgl_selesai)}
                                            </TableCell>
                                            <TableCell>{keg.pj_keg}</TableCell>
                                            <TableCell>{keg.panitia}</TableCell>

                                            <TableCell>
                                                {keg.dok_keg ? (
                                                    // ✅ 2. Tombol Lihat: Buka Popup & Cegah Pindah Halaman
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // ⛔ PENTING: Agar tidak men-trigger klik baris
                                                            setSelectedImage(
                                                                `/storage/${keg.dok_keg}`
                                                            );
                                                        }}
                                                        className="text-blue-500 flex items-center gap-1 hover:underline hover:text-blue-700 transition z-10 relative"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        Lihat
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-gray-500"
                                        >
                                            Tidak ada data kegiatan
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION — SAMA PERSIS DENGAN DASHBOARD */}
                    {sortedData.length > itemsPerPage && (
                        <div className="flex justify-end items-center gap-2 mt-6 px-2 pb-4">
                            {/* Prev */}
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(p - 1, 1))
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {/* Number buttons */}
                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((num) => (
                                <Button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
                                    className={`${
                                        num === currentPage
                                            ? "bg-blue-500 text-white"
                                            : "bg-white border text-blue-500"
                                    } hover:bg-blue-300 transition`}
                                >
                                    {num}
                                </Button>
                            ))}

                            {/* Next */}
                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(p + 1, totalPages)
                                    )
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* ✅ 3. MODAL POPUP GAMBAR */}
                <Dialog
                    open={!!selectedImage}
                    onOpenChange={(open) => !open && setSelectedImage(null)}
                >
                    <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                        <div className="relative flex justify-center items-center">
                            {/* Tombol Close */}
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-10 right-0 md:-right-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {selectedImage && (
                                <img
                                    src={selectedImage}
                                    alt="Preview Dokumentasi"
                                    className="w-auto h-auto max-h-[80vh] max-w-full rounded-lg shadow-2xl object-contain bg-black"
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

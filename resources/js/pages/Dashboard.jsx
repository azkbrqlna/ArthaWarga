import React, { useState, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";

export default function Dashboard() {
    const { transaksi = [] } = usePage().props;
    const [sortField, setSortField] = useState("tgl");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
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
        return [...transaksi].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (!valA || !valB) return 0;

            if (typeof valA === "string" && typeof valB === "string") {
                return sortOrder === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            return sortOrder === "asc" ? valA - valB : valB - valA;
        });
    }, [transaksi, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    return (
        <AppLayout>
<<<<<<< HEAD
=======
            {/* HEADER DASHBOARD */}
>>>>>>> d8f802bbf360fce6652f460d231ccf9ce73228b0
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-white pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                    <span className="font-bold text-gray-900">ArthaWarga</span>{" "}
                    DASHBOARD
                </h1>

                {/* Tombol Aksi */}
                <div className="flex gap-2 mt-4 md:mt-0">
                    <Button
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                        onClick={() => router.visit("/ringkasan/kegiatan")}
                    >
                        Tambah Kegiatan
                    </Button>
                    <Button
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                        onClick={() => router.visit("/ringkasan/pemasukan")}
                    >
                        Tambah Pemasukan
                    </Button>
                    <Button
                        className="bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                        onClick={() => router.visit("/ringkasan/pengeluaran")}
                    >
                        Tambah Pengeluaran
                    </Button>
                </div>
            </div>

            {/* TABEL TRANSAKSI */}
            <div className="px38 pb-10">
                <div className="rounded-xl border  overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-white">
                                {[
                                    { key: "tgl", label: "Tanggal Transaksi" },
                                    { key: "kategori", label: "Kategori" },
                                    {
                                        key: "jumlah_awal",
                                        label: "Jumlah Awal",
                                    },
                                    {
                                        key: "jumlah_digunakan",
                                        label: "Jumlah Digunakan",
                                    },
                                    {
                                        key: "jumlah_sisa",
                                        label: "Jumlah Sisa",
                                    },
                                    { key: "status", label: "Status" },
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
                                paginatedData.map((t, i) => (
                                    <TableRow
                                        key={i}
                                        onClick={() =>
                                            router.visit(
                                                `/rincian/${t.real_id}`
                                            )
                                        }
                                        className="hover:bg-gray-100 cursor-pointer transition"
                                    >
                                        <TableCell>{t.tgl}</TableCell>
                                        <TableCell>{t.kategori}</TableCell>
                                        <TableCell>
                                            {formatRupiah(t.jumlah_awal)}
                                        </TableCell>
                                        <TableCell>
                                            {formatRupiah(t.jumlah_digunakan)}
                                        </TableCell>
                                        <TableCell>
                                            {formatRupiah(t.jumlah_sisa)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* badge */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-gray-500"
                                    >
                                        Tidak ada data transaksi
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-end items-center gap-2 mt-6">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() =>
                            setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (num) => (
                            <Button
                                key={num}
                                variant={
                                    num === currentPage ? "default" : "outline"
                                }
                                onClick={() => setCurrentPage(num)}
                            >
                                {num}
                            </Button>
                        )
                    )}

                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() =>
                            setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}

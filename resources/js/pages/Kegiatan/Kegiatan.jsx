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
import { Button } from "@/components/ui/button";
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

    // urutkan data
    const sortedData = useMemo(() => {
        if (!kegiatans?.data) return [];
        return [...kegiatans.data].sort((a, b) => {
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
    }, [kegiatans, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
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
                                            className="hover:bg-gray-50 transition"
                                        >
                                            <TableCell>{keg.nm_keg}</TableCell>
                                            <TableCell>
                                                {keg.tgl_mulai}
                                            </TableCell>
                                            <TableCell>
                                                {keg.tgl_selesai}
                                            </TableCell>
                                            <TableCell>{keg.pj_keg}</TableCell>
                                            <TableCell>{keg.panitia}</TableCell>
                                            <TableCell>
                                                {keg.dok_keg ? (
                                                    <button
                                                        onClick={() =>
                                                            setSelectedImage(
                                                                `/storage/${keg.dok_keg}`
                                                            )
                                                        }
                                                        className="text-blue-500 flex items-center gap-1 hover:underline"
                                                    >
                                                        <FileText className="w-4 h-4" />
                                                        Lihat
                                                    </button>
                                                ) : (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-gray-600"
                                                    >
                                                        Tidak ada
                                                    </Badge>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
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

                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((num) => (
                                <Button
                                    key={num}
                                    className={`${
                                        num === currentPage
                                            ? "bg-blue-500 text-white"
                                            : "bg-white border text-blue-500"
                                    } hover:bg-blue-300`}
                                    onClick={() => setCurrentPage(num)}
                                >
                                    {num}
                                </Button>
                            ))}

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

                {/* Popup Image Preview */}
                {selectedImage && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                        <div className="relative">
                            <button
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                                onClick={() => setSelectedImage(null)}
                            >
                                <X className="h-5 w-5 text-gray-700" />
                            </button>
                            <img
                                src={selectedImage}
                                alt="Preview"
                                className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

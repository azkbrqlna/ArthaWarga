import React, { useState, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js"; // Pastikan import ziggy route
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronsUpDown,
    ChevronLeft,
    ChevronRight,
    FileText,
    X,
    MoreVertical,
    Edit,
    Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Swal from "sweetalert2";

export default function Kegiatan() {
    const { kegiatans } = usePage().props;

    const [sortField, setSortField] = useState("tgl_mulai");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedDokuments, setSelectedDokuments] = useState({
        dokumen: null,
        nama: "",
    });

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
        const sorted = [...kegiatans.data].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (sortField === "dok_keg" || sortField === "aksi") return 0;
            if (!valA || !valB) return 0;
            if (typeof valA === "string") {
                return sortOrder === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            return sortOrder === "asc" ? valA - valB : valB - valA;
        });
        return sorted;
    }, [kegiatans, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // ✅ UPDATE: Format Tanggal (Dari Kode Temanmu)
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    // ✅ UPDATE: Fungsi Pindah Halaman saat Klik Baris
    const handleRowClick = (id) => {
        router.visit(route("kegiatan.show", id));
    };

    const openDialog = (dokumenArray, namaKegiatan) => {
        // Pastikan dokumenArray selalu array, jika string ubah jadi array
        const docs = Array.isArray(dokumenArray) ? dokumenArray : [dokumenArray];
        setSelectedDokuments({ dokumen: docs, nama: namaKegiatan });
        setCurrentImageIndex(0);
    };

    const closeDialog = () => {
        setSelectedDokuments({ dokumen: null, nama: "" });
        setCurrentImageIndex(0);
    };

    const totalDokumen = selectedDokuments.dokumen?.length || 0;
    const nextImage = () =>
        setCurrentImageIndex((p) => Math.min(p + 1, totalDokumen - 1));
    const prevImage = () => setCurrentImageIndex((p) => Math.max(p - 1, 0));

    // Handle jika dokumen disimpan sebagai string path di DB, bukan array
    const currentImagePath = selectedDokuments.dokumen
        ? selectedDokuments.dokumen[currentImageIndex]
        : null;

    // FUNGSI DELETE
    const handleDelete = (id) => {
        Swal.fire({
            title: "Yakin ingin menghapus?",
            text: "Data kegiatan ini tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("kegiatan.destroy", id), {
                    onSuccess: () =>
                        Swal.fire(
                            "Terhapus!",
                            "Kegiatan berhasil dihapus.",
                            "success"
                        ),
                    onError: () =>
                        Swal.fire(
                            "Gagal",
                            "Terjadi kesalahan saat menghapus.",
                            "error"
                        ),
                });
            }
        });
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
                        onClick={() => router.visit(route("kegiatan.create"))}
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
                                        { key: "nm_keg", label: "Nama Kegiatan" },
                                        { key: "tgl_mulai", label: "Tanggal Mulai" },
                                        { key: "tgl_selesai", label: "Tanggal Selesai" },
                                        { key: "pj_keg", label: "Penanggung Jawab" },
                                        { key: "panitia", label: "Panitia" },
                                        { key: "dok_keg", label: "Dokumen" },
                                        { key: "aksi", label: "" },
                                    ].map((col) => (
                                        <TableHead
                                            key={col.key}
                                            onClick={() =>
                                                col.key !== "aksi" && toggleSort(col.key)
                                            }
                                            className={`font-semibold select-none ${
                                                col.key !== "aksi" ? "cursor-pointer" : ""
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                {col.key !== "aksi" && (
                                                    <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                                )}
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
                                            // ✅ UPDATE: Klik Row -> Rincian
                                            className="hover:bg-gray-50 transition cursor-pointer"
                                            onClick={() => handleRowClick(keg.id)}
                                        >
                                            <TableCell>{keg.nm_keg}</TableCell>
                                            {/* ✅ UPDATE: Terapkan Format Tanggal */}
                                            <TableCell>{formatDate(keg.tgl_mulai)}</TableCell>
                                            <TableCell>{formatDate(keg.tgl_selesai)}</TableCell>
                                            <TableCell>{keg.pj_keg}</TableCell>
                                            <TableCell>{keg.panitia}</TableCell>
                                            
                                            {/* Kolom Dokumen (Tombol Lihat) */}
                                            <TableCell>
                                                {keg.dok_keg ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // ⛔ PENTING: Agar tidak trigger klik row
                                                            openDialog(keg.dok_keg, keg.nm_keg);
                                                        }}
                                                        className="text-blue-500 flex items-center gap-1 hover:underline z-10 relative"
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

                                            {/* Kolom Aksi (Edit/Hapus) */}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                            // ⛔ PENTING: Stop Propagation di Trigger Menu
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Stop propagation
                                                                router.visit(route("kegiatan.edit", keg.id));
                                                            }}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Stop propagation
                                                                handleDelete(keg.id);
                                                            }}
                                                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-gray-500"
                                        >
                                            Tidak ada data kegiatan
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination (Tidak Berubah) */}
                    {sortedData.length > itemsPerPage && (
                        <div className="flex justify-end items-center gap-2 mt-6 px-2 pb-4">
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (num) => (
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
                                )
                            )}
                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Dialog Popup Gambar (Sesuai Kodemu) */}
                <Dialog
                    open={!!selectedDokuments.dokumen}
                    onOpenChange={closeDialog}
                >
                    <DialogContent className="max-w-4xl p-0 max-h-[90vh] flex flex-col">
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle>
                                Dokumen Kegiatan: {selectedDokuments.nama}
                            </DialogTitle>
                            {totalDokumen > 1 && (
                                <p className="text-sm text-gray-500">
                                    {currentImageIndex + 1} dari {totalDokumen}
                                </p>
                            )}
                        </DialogHeader>
                        <button
                            onClick={closeDialog}
                            className="absolute top-3 right-3 bg-white rounded-full p-1 shadow z-50 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5 text-gray-700" />
                        </button>
                        <div className="relative flex-grow flex items-center justify-center p-4">
                            {currentImagePath ? (
                                <>
                                    {totalDokumen > 1 && (
                                        <Button
                                            onClick={prevImage}
                                            disabled={currentImageIndex === 0}
                                            className="absolute left-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                            size="icon"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                    )}
                                    <div className="w-full h-full max-h-[70vh] flex justify-center items-center overflow-hidden">
                                        <img
                                            src={`/storage/${currentImagePath}`}
                                            alt="Dokumen"
                                            className="max-w-full max-h-full object-contain"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "https://via.placeholder.com/600x400?text=File+Error";
                                            }}
                                        />
                                    </div>
                                    {totalDokumen > 1 && (
                                        <Button
                                            onClick={nextImage}
                                            disabled={currentImageIndex === totalDokumen - 1}
                                            className="absolute right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                            size="icon"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <p className="text-center text-gray-500 p-4">
                                    Tidak ada dokumen.
                                </p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
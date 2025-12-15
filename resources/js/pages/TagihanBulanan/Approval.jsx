import React, { useState, useMemo, useEffect } from "react";
import AppLayout from "../../Layouts/AppLayout";
import { Head, router } from "@inertiajs/react";
import Swal from "sweetalert2"; // Import SweetAlert2

// --- SHADCN IMPORTS ---
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter, // Ditambahkan untuk footer modal decline
    DialogDescription, // Ditambahkan untuk deskripsi modal decline
} from "@/components/ui/dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea"; // Ditambahkan untuk input alasan

// --- ICONS ---
import {
    Check,
    X,
    Eye,
    ChevronLeft,
    ChevronRight,
    Search,
    RotateCcw,
    Filter,
} from "lucide-react";

export default function IndexRT({
    auth,
    tagihan,
    totalDitagihkan,
    totalLunas,
}) {
    // --- STATE FILTERS & PAGINATION ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    const currentMonth = String(date.getMonth() + 1);
    const currentYear = String(date.getFullYear());

    // State Filter
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterBulan, setFilterBulan] = useState(currentMonth);
    const [filterTahun, setFilterTahun] = useState(currentYear);

    // State Modal Bukti
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProofUrl, setSelectedProofUrl] = useState(null);

    // --- STATE BARU: MODAL DECLINE ---
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
    const [selectedDeclineId, setSelectedDeclineId] = useState(null);
    const [declineReason, setDeclineReason] = useState("");

    // --- HELPER NAMA BULAN ---
    const getNamaBulan = (bulan) => {
        const monthNames = [
            "Januari",
            "Februari",
            "Maret",
            "April",
            "Mei",
            "Juni",
            "Juli",
            "Agustus",
            "September",
            "Oktober",
            "November",
            "Desember",
        ];
        const index = parseInt(bulan) - 1;
        if (index >= 0 && index < 12) return monthNames[index];
        return bulan;
    };

    // --- LOGIKA FILTERING (CLIENT SIDE) ---
    const filteredData = useMemo(() => {
        return tagihan.filter((item) => {
            // 1. Filter Search (Nama Warga)
            const matchSearch = item.user?.nm_lengkap
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            // 2. Filter Status
            let matchStatus = true;
            if (filterStatus !== "all") {
                matchStatus = item.status === filterStatus;
            }

            // 3. Filter Bulan
            let matchBulan = true;
            if (filterBulan !== "all") {
                matchBulan = item.bulan.toString() === filterBulan;
            }

            // 4. Filter Tahun
            let matchTahun = true;
            if (filterTahun !== "all") {
                matchTahun = item.tahun.toString() === filterTahun;
            }

            return matchSearch && matchStatus && matchBulan && matchTahun;
        });
    }, [tagihan, searchQuery, filterStatus, filterBulan, filterTahun]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset halaman ke 1 jika filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus, filterBulan, filterTahun]);

    const uniqueYears = [...new Set(tagihan.map((item) => item.tahun))].sort(
        (a, b) => b - a
    );

    const formatRupiah = (number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number || 0);

    // --- ACTION HANDLERS ---

    const handleApprove = (id) => {
        Swal.fire({
            title: "Setujui Tagihan?",
            text: "Tagihan akan ditandai sebagai lunas.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a", // Green-600
            cancelButtonColor: "#6b7280", // Gray-500
            confirmButtonText: "Ya, Setujui!",
            cancelButtonText: "Batal",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(
                    route("tagihan.approve", id),
                    {},
                    {
                        onSuccess: () => {
                            Swal.fire({
                                title: "Berhasil!",
                                text: "Tagihan berhasil disetujui.",
                                icon: "success",
                                timer: 1500,
                                showConfirmButton: false,
                            });
                        },
                    }
                );
            }
        });
    };

    // --- MODIFIED: HANDLE DECLINE CLICK (BUKA MODAL) ---
    const handleDecline = (id) => {
        // Reset state
        setSelectedDeclineId(id);
        setDeclineReason("");
        // Buka modal
        setIsDeclineModalOpen(true);
    };

    // --- NEW: SUBMIT DECLINE DENGAN ALASAN ---
    const submitDecline = () => {
        if (!declineReason.trim()) {
            Swal.fire("Error", "Harap isi alasan penolakan!", "error");
            return;
        }

        router.patch(
            route("tagihan.decline", selectedDeclineId),
            { alasan: declineReason }, // Kirim alasan ke controller
            {
                onSuccess: () => {
                    setIsDeclineModalOpen(false); // Tutup modal
                    Swal.fire({
                        title: "Ditolak!",
                        text: "Tagihan berhasil ditolak dengan alasan.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                },
                onError: () => {
                    setIsDeclineModalOpen(false);
                    Swal.fire("Gagal", "Terjadi kesalahan.", "error");
                },
            }
        );
    };

    const handleViewProof = (url) => {
        setSelectedProofUrl(url);
        setIsModalOpen(true);
    };

    const handleResetFilter = () => {
        setSearchQuery("");
        setFilterStatus("all");
        setFilterBulan(currentMonth);
        setFilterTahun(currentYear);
    };

    return (
        <AppLayout>
            <Head title="Approval Tagihan" />

            <div className="space-y-6">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-white">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                            <span className="font-bold text-gray-900 pr-5">
                                APPROVAL
                            </span>
                        </h1>
                    </div>
                </div>

                {/* --- TOOLBAR FILTER & SEARCH --- */}
                <div className="space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Cari nama warga..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filters Group */}
                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto items-center">
                        {/* Filter Status */}
                        <Select
                            value={filterStatus}
                            onValueChange={setFilterStatus}
                        >
                            <SelectTrigger className="w-full md:w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Status
                                </SelectItem>
                                <SelectItem value="ditagihkan">
                                    Belum Bayar
                                </SelectItem>
                                <SelectItem value="pending">
                                    Menunggu Konfirmasi
                                </SelectItem>
                                <SelectItem value="approved">
                                    Disetujui
                                </SelectItem>
                                <SelectItem value="declined">
                                    Ditolak
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Filter Bulan */}
                        <Select
                            value={filterBulan}
                            onValueChange={setFilterBulan}
                        >
                            <SelectTrigger className="w-full md:w-[140px]">
                                <SelectValue placeholder="Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Bulan</SelectItem>
                                {Array.from(
                                    { length: 12 },
                                    (_, i) => i + 1
                                ).map((bln) => (
                                    <SelectItem
                                        key={bln}
                                        value={bln.toString()}
                                    >
                                        {getNamaBulan(bln)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Filter Tahun */}
                        <Select
                            value={filterTahun}
                            onValueChange={setFilterTahun}
                        >
                            <SelectTrigger className="w-full md:w-[120px]">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tahun</SelectItem>
                                {uniqueYears.map((thn) => (
                                    <SelectItem
                                        key={thn}
                                        value={thn.toString()}
                                    >
                                        {thn}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Reset Button */}
                        {(searchQuery ||
                            filterStatus !== "all" ||
                            filterBulan !== "all" ||
                            filterTahun !== "all") && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleResetFilter}
                                className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 shrink-0"
                                title="Reset Filter"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* --- TABEL TAGIHAN --- */}
                <div className="pb-10">
                    <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                    <TableHead className="py-4 px-6 font-semibold text-gray-900 w-[200px]">
                                        Warga
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-semibold text-gray-900">
                                        Periode
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-semibold text-gray-900">
                                        Meteran (m³)
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-semibold text-gray-900">
                                        Nominal
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-semibold text-gray-900 text-center">
                                        Bukti
                                    </TableHead>
                                    <TableHead className="py-4 px-6 font-semibold text-gray-900 text-center">
                                        Status / Aksi
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            {/* Kolom Warga */}
                                            <TableCell className="px-6 py-4 align-middle">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {item.user?.nm_lengkap}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {item.user?.alamat ||
                                                            "Tanpa Alamat"}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Kolom Periode */}
                                            <TableCell className="px-6 py-4 align-middle">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {getNamaBulan(
                                                            item.bulan
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {item.tahun}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Kolom Meteran */}
                                            <TableCell className="px-6 py-4 align-middle">
                                                <div className="flex flex-col text-sm gap-1">
                                                    <div className="flex justify-between w-24 text-gray-500 text-xs">
                                                        <span>Lalu:</span>
                                                        <span>
                                                            {item.mtr_bln_lalu}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`flex justify-between w-24 ${
                                                            item.mtr_skrg
                                                                ? "font-semibold text-gray-900"
                                                                : "text-gray-400 italic"
                                                        }`}
                                                    >
                                                        <span>Skrg:</span>
                                                        <span>
                                                            {item.mtr_skrg ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Kolom Nominal */}
                                            <TableCell className="px-6 py-4 align-middle">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {item.nominal
                                                        ? formatRupiah(
                                                              item.nominal
                                                          )
                                                        : "-"}
                                                </div>
                                                {item.harga_sampah > 0 && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] mt-1 border-green-200 text-green-700 bg-green-50"
                                                    >
                                                        +Sampah
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Kolom Bukti */}
                                            <TableCell className="px-6 py-4 align-middle text-center">
                                                {item.bkt_byr ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleViewProof(
                                                                `/storage/${item.bkt_byr}`
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
                                                    >
                                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                        Lihat
                                                    </Button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">
                                                        Belum upload
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Kolom Aksi */}
                                            <TableCell className="px-6 py-4 align-middle text-center">
                                                {item.status === "pending" ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() =>
                                                                handleDecline(
                                                                    item.id
                                                                )
                                                            }
                                                            title="Tolak"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white border-green-600"
                                                            onClick={() =>
                                                                handleApprove(
                                                                    item.id
                                                                )
                                                            }
                                                            title="Setujui"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : item.status ===
                                                  "approved" ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-50 text-green-700 border-green-200 gap-1 pr-3"
                                                    >
                                                        <Check className="w-3 h-3" />{" "}
                                                        Disetujui
                                                    </Badge>
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge
                                                            variant="outline"
                                                            // GANTI DENGAN LOGIKA INI:
                                                            className={
                                                                item.status ===
                                                                "ditagihkan"
                                                                    ? "bg-gray-100 text-gray-600 border-gray-200"
                                                                    : "bg-red-50 text-red-600 border-red-200"
                                                            }
                                                        >
                                                            {item.status ===
                                                            "ditagihkan"
                                                                ? "Belum Bayar"
                                                                : "Ditolak"}
                                                        </Badge>
                                                        {item.status ===
                                                            "ditagihkan" &&
                                                            item.bkt_byr && (
                                                                <span className="text-[10px] text-red-500">
                                                                    (Bukti
                                                                    ditolak)
                                                                </span>
                                                            )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-48 text-center text-gray-500"
                                        >
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Filter className="w-10 h-10 text-gray-300 mb-2" />
                                                <p className="font-medium">
                                                    Tidak ada data ditemukan
                                                </p>
                                                <p className="text-xs mt-1">
                                                    Coba ubah filter atau kata
                                                    kunci pencarian Anda.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* --- PAGINATION CONTROLS (SHADCN) --- */}
                    <div className="flex flex-col md:flex-row justify-between items-center mt-4 text-sm text-gray-500">
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2 mt-2 md:mt-0 ml-auto">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(p - 1, 1)
                                        )
                                    }
                                    className="h-8 w-8"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="text-xs mx-2">
                                    Hal {currentPage} dari {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(p + 1, totalPages)
                                        )
                                    }
                                    className="h-8 w-8"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- MODAL POPUP BUKTI PEMBAYARAN --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Bukti Pembayaran</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border border-dashed">
                        {selectedProofUrl ? (
                            <img
                                src={selectedProofUrl}
                                alt="Bukti Transfer"
                                className="rounded-md max-h-[500px] w-auto object-contain shadow-sm"
                            />
                        ) : (
                            <p className="text-gray-500 italic">
                                Gambar tidak ditemukan.
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end mt-2">
                        <Button
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Tutup
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* --- MODAL DECLINE DENGAN ALASAN --- */}
            <Dialog
                open={isDeclineModalOpen}
                onOpenChange={setIsDeclineModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <X className="w-5 h-5" /> Tolak Pembayaran
                        </DialogTitle>
                        <DialogDescription>
                            Mohon berikan alasan penolakan agar warga dapat
                            memperbaikinya.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Textarea
                            placeholder="Contoh: Foto bukti buram, nominal tidak sesuai, atau salah bulan..."
                            value={declineReason}
                            onChange={(e) => setDeclineReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeclineModalOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button variant="destructive" onClick={submitDecline}>
                            Kirim Penolakan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

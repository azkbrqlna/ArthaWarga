import React, { useState } from "react";
import AppLayout from "../../Layouts/AppLayout";
import { Head, router } from "@inertiajs/react";

// Import komponen UI Table
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
} from "@/components/ui/dialog";

import {
    Clock,
    CheckCircle,
    Check,
    X,
    ChevronsUpDown,
    Eye,
} from "lucide-react";

export default function IndexRT({
    auth,
    tagihan,
    totalDitagihkan,
    totalLunas,
}) {
    // State untuk mengontrol Modal Bukti Pembayaran
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProofUrl, setSelectedProofUrl] = useState(null);

    const formatRupiah = (number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number || 0);

    const handleApprove = (id) => {
        router.patch(route("tagihan.approve", id));
    };

    const handleDecline = (id) => {
        router.patch(route("tagihan.decline", id));
    };

    const handleViewProof = (url) => {
        setSelectedProofUrl(url);
        setIsModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title="Manajemen Tagihan" />

            <div className="space-y-8">
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-white">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                            <span className="font-bold text-gray-900 pr-5">
                                MANAJEMEN TAGIHAN
                            </span>
                        </h1>
                    </div>
                </div>

                {/* --- CARD STATISTIK --- */}
                <div className="flex flex-col md:flex-row gap-4 w-full">
                    <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3 ">
                        <div className="bg-yellow-50 p-3 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                Ditagihkan (Pending)
                            </p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">
                                {formatRupiah(totalDitagihkan)}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                        <div className="bg-green-50 p-3 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                                Saldo Lunas
                            </p>
                            <p className="text-xl font-bold text-gray-900 mt-0.5">
                                {formatRupiah(totalLunas)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* --- TABEL TAGIHAN --- */}
                <div className="rounded-xl border bg-white overflow-hidden ">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-white border-b hover:bg-white">
                                <TableHead className="py-4 px-6 font-semibold text-gray-900">
                                    <div className="flex items-center gap-2 cursor-pointer hover:text-gray-600">
                                        Warga
                                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-900">
                                    Periode
                                </TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-900">
                                    Meteran
                                </TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-900">
                                    Nominal
                                </TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-900">
                                    Bukti
                                </TableHead>
                                <TableHead className="py-4 px-6 font-semibold text-gray-900 text-center">
                                    Aksi / Status
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {tagihan.length > 0 ? (
                                tagihan.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="hover:bg-gray-50 transition-colors border-b last:border-0"
                                    >
                                        <TableCell className="px-6 py-4 align-middle">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.user?.nm_lengkap}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {item.user?.alamat}
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 align-middle">
                                            <span className="text-sm text-gray-600">
                                                {item.bulan} {item.tahun}
                                            </span>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 align-middle">
                                            <div className="flex flex-col text-sm">
                                                <span className="text-gray-500 text-xs">
                                                    Lalu: {item.mtr_bln_lalu}
                                                </span>
                                                <span
                                                    className={
                                                        item.mtr_skrg
                                                            ? "font-medium text-gray-900"
                                                            : "text-gray-400 italic"
                                                    }
                                                >
                                                    Skrg: {item.mtr_skrg || "-"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 align-middle">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.nominal
                                                    ? formatRupiah(item.nominal)
                                                    : "-"}
                                            </div>
                                            {item.harga_sampah > 0 && (
                                                <div className="text-[10px] text-green-600">
                                                    +Sampah
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* --- KOLOM BUKTI (POPUP) --- */}
                                        <TableCell className="px-6 py-4 align-middle">
                                            {item.bkt_byr ? (
                                                <button
                                                    onClick={() =>
                                                        handleViewProof(
                                                            `/storage/${item.bkt_byr}`
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline transition-colors focus:outline-none"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="text-sm font-medium">
                                                        Lihat
                                                    </span>
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-sm">
                                                    -
                                                </span>
                                            )}
                                        </TableCell>

                                        {/* --- KOLOM AKSI / STATUS --- */}
                                        <TableCell className="px-6 py-4 align-middle text-center">
                                            {item.status === "pending" ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    {/* Tombol Tolak (Merah Muda) */}
                                                    <button
                                                        onClick={() =>
                                                            handleDecline(
                                                                item.id
                                                            )
                                                        }
                                                        className="p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                        title="Tolak"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>

                                                    {/* Tombol Terima (Hijau Muda) */}
                                                    <button
                                                        onClick={() =>
                                                            handleApprove(
                                                                item.id
                                                            )
                                                        }
                                                        className="p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                        title="Terima"
                                                    >
                                                        <Check className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : item.status === "approved" ? (
                                                <span className="inline-block px-4 py-2 rounded-md bg-green-50 text-green-700 font-medium text-sm">
                                                    Disetujui
                                                </span>
                                            ) : (
                                                <span className="inline-block px-4 py-2 rounded-md bg-red-50 text-red-700 font-medium text-sm">
                                                    Ditolak
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="h-24 text-center text-gray-500 text-sm"
                                    >
                                        Tidak ada data yang ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* --- MODAL POPUP BUKTI PEMBAYARAN --- */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Bukti Pembayaran</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-2">
                        {selectedProofUrl ? (
                            <img
                                src={selectedProofUrl}
                                alt="Bukti Transfer"
                                className="rounded-lg max-h-[500px] w-auto object-contain"
                            />
                        ) : (
                            <p className="text-gray-500">
                                Gambar tidak ditemukan.
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    Banknote,
    ChevronsUpDown,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

export default function Approval({ iurans, jumlahTagihan, jumlahApproved }) {
    const [rows, setRows] = useState(iurans.data || []);
    const [modalImage, setModalImage] = useState(null);
    const currentPage = iurans.current_page;
    const totalPages = iurans.last_page;

    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    const handleUpdate = (id, status) => {
        setRows((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status } : item))
        );

        router.patch(route("approval.patch", id), { status });
    };

    const goToPage = (page) => {
        router.get(
            route("approval"),
            { page },
            { preserveScroll: true, preserveState: true }
        );
    };

    return (
        <AppLayout>
            <div className="space-y-10">
                {/* HEADER PAGE */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-white">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        <span className="font-bold text-gray-900 pr-5">
                            APPROVAL PEMBAYARAN
                        </span>
                    </h1>
                </div>

                {/* RINGKASAN */}
                <div>
                    <h2 className="text-sm font-semibold text-gray-800 mb-3">
                        RINGKASAN
                    </h2>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Total Tagihan */}
                        <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                                <Banknote className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">
                                    Total Tagihan
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatRupiah(jumlahTagihan)}
                                </p>
                            </div>
                        </div>

                        {/* Total Lunas */}
                        <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                            <div className="bg-gray-100 p-2 rounded-lg">
                                <Banknote className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">
                                    Lunas
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatRupiah(jumlahApproved)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABEL */}
                <div className="pb-10">
                    <div className="rounded-xl border overflow-hidden bg-white">
                        <table className="w-full text-sm">
                            <thead className="bg-white border-b">
                                <tr>
                                    {[
                                        "No",
                                        "Nama",
                                        "Jenis Iuran",
                                        "Tanggal",
                                        "Bukti",
                                        "Status",
                                    ].map((label, idx) => (
                                        <th
                                            key={idx}
                                            className="p-3 font-semibold text-gray-700"
                                        >
                                            <div className="flex items-center gap-2">
                                                {label}
                                                {label !== "No" && (
                                                    <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((item, index) => {
                                    const approved = item.status === "approved";
                                    const rejected = item.status === "tagihan";

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-100 transition border-b"
                                        >
                                            <td className="p-3">
                                                {iurans.from + index}
                                            </td>

                                            <td className="p-3">
                                                {item.user?.nm_lengkap}
                                            </td>

                                            <td className="p-3">
                                                {
                                                    item.pengumuman?.kat_iuran
                                                        ?.nm_kat
                                                }
                                            </td>

                                            <td className="p-3">
                                                {new Date(
                                                    item.tgl
                                                ).toLocaleDateString("id-ID")}
                                            </td>

                                            <td className="p-3">
                                                <button
                                                    className="text-blue-600 underline"
                                                    onClick={() =>
                                                        setModalImage(
                                                            item.bkt_byr
                                                                ? `/storage/${item.bkt_byr}`
                                                                : null
                                                        )
                                                    }
                                                >
                                                    Lihat Bukti
                                                </button>
                                            </td>

                                            <td className="p-3">
                                                {approved ? (
                                                    <Badge className="bg-emerald-50 text-emerald-700 px-3 py-1">
                                                        Disetujui
                                                    </Badge>
                                                ) : rejected ? (
                                                    <Badge className="bg-red-50 text-red-700 px-3 py-1">
                                                        Ditolak
                                                    </Badge>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() =>
                                                                handleUpdate(
                                                                    item.id,
                                                                    "approved"
                                                                )
                                                            }
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            className="bg-red-500 hover:bg-red-600 text-white"
                                                            onClick={() =>
                                                                handleUpdate(
                                                                    item.id,
                                                                    "tagihan"
                                                                )
                                                            }
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex justify-end items-center gap-2 mt-6 px-2 pb-4">
                                {/* PREV */}
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => goToPage(currentPage - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {/* NUMBERS */}
                                {Array.from(
                                    { length: totalPages },
                                    (_, i) => i + 1
                                ).map((num) => (
                                    <Button
                                        key={num}
                                        onClick={() => goToPage(num)}
                                        className={`${
                                            num === currentPage
                                                ? "bg-blue-500 text-white"
                                                : "bg-white border text-blue-500"
                                        } hover:bg-blue-300 transition`}
                                    >
                                        {num}
                                    </Button>
                                ))}

                                {/* NEXT */}
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => goToPage(currentPage + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* POPUP GAMBAR */}
                <Dialog
                    open={!!modalImage}
                    onOpenChange={() => setModalImage(null)}
                >
                    <DialogContent className="max-w-xl">
                        {modalImage && (
                            <img
                                src={modalImage}
                                className="w-full rounded-lg"
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

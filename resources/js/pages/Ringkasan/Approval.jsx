import React, { useState } from "react";
import { router, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Banknote, ChevronsUpDown, Check, X } from "lucide-react";

export default function Approval({ iurans, jumlahTagihan, jumlahApproved }) {
    const [rows, setRows] = useState(iurans.data || []);
    const [modalImage, setModalImage] = useState(null);

    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    const handleUpdate = (id, status) => {
        setRows((prev) =>
            prev.map((item) => (item.id === id ? { ...item, status } : item))
        );

        router.patch(route("approval.patch", id), { status });
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
                        {/* HEADER TABEL */}
                        <table className="w-full text-sm">
                            <thead className="bg-white border-b">
                                <tr>
                                    <th className="p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            No
                                        </div>
                                    </th>
                                    <th className="p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            Nama
                                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            Jenis Iuran
                                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </th>

                                    <th className="p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            Tanggal
                                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </th>

                                    <th className="p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            Bukti
                                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </th>

                                    <th className="p-3 font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            Status
                                            <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </th>
                                </tr>
                            </thead>

                            {/* BODY */}
                            <tbody>
                                {rows.map((item, index) => {
                                    const approved = item.status === "approved";
                                    const rejected = item.status === "tagihan";

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-100 transition border-b"
                                        >
                                            {/* No */}
                                            <td className="p-3">
                                                {iurans.from + index}
                                            </td>

                                            {/* Nama */}
                                            <td className="p-3">
                                                {item.user?.nm_lengkap}
                                            </td>

                                            {/* Jenis */}
                                            <td className="p-3">
                                                {
                                                    item.pengumuman?.kat_iuran
                                                        ?.nm_kat
                                                }
                                            </td>

                                            {/* Tanggal */}
                                            <td className="p-3">
                                                {new Date(
                                                    item.tgl
                                                ).toLocaleDateString("id-ID")}
                                            </td>

                                            {/* Bukti */}
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

                                            {/* STATUS — sesuai gambar */}
                                            <td className="p-3">
                                                {approved && (
                                                    <Badge className="bg-emerald-50 text-emerald-700 px-3 py-1">
                                                        Disetujui
                                                    </Badge>
                                                )}

                                                {rejected && (
                                                    <Badge className="bg-red-50 text-red-700 px-3 py-1">
                                                        Ditolak
                                                    </Badge>
                                                )}

                                                {!approved && !rejected && (
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

                        {/* PAGINATION */}
                        <div className="flex justify-end items-center gap-2 mt-6 px-4 pb-4">
                            {iurans.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? "#"}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                    className={`px-3 py-1 rounded text-sm border ${
                                        link.active
                                            ? "bg-blue-500 text-white border-blue-500"
                                            : "bg-white text-blue-600 hover:bg-blue-50"
                                    } ${
                                        !link.url &&
                                        "opacity-40 cursor-not-allowed"
                                    }`}
                                />
                            ))}
                        </div>
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

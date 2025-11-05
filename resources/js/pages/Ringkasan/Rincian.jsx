// resources/js/Pages/Ringkasan/Rincian.jsx
import React from "react";
import { usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    Wallet,
    Coins,
    PiggyBank,
    ArrowDownCircle,
} from "lucide-react";

export default function Rincian() {
    const { rincian = {} } = usePage().props;

    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");
    const formatTanggalWaktu = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleString("id-ID", {
            dateStyle: "long",
            timeStyle: "short",
        });
    };

    const cards = [
        {
            title: "Jumlah awal",
            icon: <PiggyBank className="h-5 w-5 text-amber-500" />,
            value: formatRupiah(rincian.jumlah_awal),
            bg: "bg-orange-50",
            text: "text-orange-700",
        },
        {
            title: "Jumlah digunakan",
            icon: <ArrowDownCircle className="h-5 w-5 text-pink-500" />,
            value: formatRupiah(rincian.jumlah_digunakan),
            bg: "bg-pink-50",
            text: "text-pink-700",
        },
        {
            title: "Jumlah Sisa",
            icon: <Wallet className="h-5 w-5 text-green-500" />,
            value: formatRupiah(rincian.jumlah_sisa),
            bg: "bg-green-50",
            text: "text-green-700",
        },
        {
            title: "Jenis",
            icon: (
                <Coins
                    className={`h-5 w-5 ${
                        rincian.status === "Pemasukan"
                            ? "text-emerald-500"
                            : "text-red-500"
                    }`}
                />
            ),
            value: rincian.status || "-",
            bg: rincian.status === "Pemasukan" ? "bg-emerald-50" : "bg-red-50",
            text:
                rincian.status === "Pemasukan"
                    ? "text-emerald-700"
                    : "text-red-700",
        },
    ];

    return (
        <AppLayout>
            <div className="px-8 py-10 space-y-10">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit("/dashboard")}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-800">
                        Rincian Transaksi
                    </h1>
                </div>

                {/* Cards Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {cards.map((c, i) => (
                        <Card
                            key={i}
                            className="rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <CardContent className="p-5 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className={`p-2 rounded-lg ${c.bg}`}>
                                        {c.icon}
                                    </div>
                                    <div className="text-gray-400 text-lg">
                                        ⋯
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 font-medium">
                                        {c.title}
                                    </p>
                                    <p
                                        className={`text-lg font-semibold ${c.text}`}
                                    >
                                        {c.value}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Detail Section */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        Detail Transaksi
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700">
                        <div>
                            <p className="text-gray-500">Tanggal Transaksi</p>
                            <p className="font-medium">{rincian.tgl}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Kategori</p>
                            <p className="font-medium">{rincian.kategori}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-gray-500">Keterangan</p>
                            <p className="font-medium">{rincian.ket || "-"}</p>
                        </div>
                        {/* <div className="md:col-span-2">
                            <p className="text-gray-500">Dibuat pada</p>
                            <p className="font-medium">
                                {formatTanggalWaktu(rincian.created_at)}
                            </p>
                        </div> */}
                    </div>

                    {!!rincian.bkt_nota && (
                        <div className="mt-6">
                            <p className="text-gray-500 mb-2">Bukti Nota</p>
                            <img
                                src={rincian.bkt_nota}
                                alt="Bukti Nota"
                                className="rounded-lg border max-w-sm"
                            />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

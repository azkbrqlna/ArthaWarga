// resources/js/Pages/Ringkasan/Rincian.jsx
import React from "react";
import { usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Coins, PiggyBank, ArrowDownCircle } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Rincian() {
    const { rincian = {}, pemasukanBOP, pemasukanIuran } = usePage().props;

    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    const isIncome = rincian.status === "Pemasukan";

    // ================================
    // FIX — Ambil nominal pemasukan
    // ================================
    const nominalPemasukan = (() => {
        if (!isIncome) return rincian.jumlah_digunakan;

        if (rincian.kategori === "BOP") {
            return pemasukanBOP || rincian.jumlah_digunakan;
        }

        if (rincian.kategori === "Iuran") {
            return pemasukanIuran || rincian.jumlah_digunakan;
        }

        return rincian.jumlah_digunakan;
    })();

    const cards = [
        {
            title: "Jumlah awal",
            icon: <PiggyBank className="h-5 w-5 text-amber-500" />,
            value: formatRupiah(rincian.jumlah_awal),
            bg: "bg-orange-50",
            text: "text-orange-700",
        },
        {
            title: isIncome ? "Jumlah Pemasukan" : "Jumlah digunakan",
            icon: (
                <ArrowDownCircle
                    className={`h-5 w-5 ${
                        isIncome ? "text-emerald-500" : "text-pink-500"
                    }`}
                />
            ),
            value: isIncome
                ? formatRupiah(nominalPemasukan)
                : formatRupiah(rincian.jumlah_digunakan),
            bg: isIncome ? "bg-emerald-50" : "bg-pink-50",
            text: isIncome ? "text-emerald-700" : "text-pink-700",
        },
        {
            title: "Jumlah Sekarang",
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
                        isIncome ? "text-emerald-500" : "text-red-500"
                    }`}
                />
            ),
            value: rincian.status || "-",
            bg: isIncome ? "bg-emerald-50" : "bg-red-50",
            text: isIncome ? "text-emerald-700" : "text-red-700",
        },
    ];

    return (
        <AppLayout>
            <div className="pl-0 pr-8 pb-10 md:pr-12 md:pb-12 space-y-10">
                <h1 className="text-3xl font-bold mb-8">RINCIAN</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Tambah Rincian" },
                    ]}
                />

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
                    </div>

                    {!!rincian.bkt_nota && (
                        <div>
                            <p className="text-gray-500 mb-2 text-sm">
                                Bukti Nota
                            </p>
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

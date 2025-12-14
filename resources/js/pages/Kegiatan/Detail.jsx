import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
    Calendar,
    User,
    Users,
    FileText,
    ArrowDownCircle,
    Wallet,
    AlertCircle,
    PlusCircle,
    PiggyBank,
    Coins,
    X,
    ZoomIn,
} from "lucide-react";

export default function Detail({
    kegiatan,
    totalPengeluaran,
    listPengeluaran = [],
    canAddExpense,
    sisaBop,
    sisaIuran,
}) {
    // STATE UNTUK POPUP NOTA
    const [selectedNota, setSelectedNota] = useState(null);

    // --- FORMATTER ---
    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    // Data Pengeluaran dari relasi
    const pengeluaran = kegiatan.pengeluaran;

    // ==========================================
    // 💡 LOGIKA PERHITUNGAN MULTI-SUMBER DANA
    // ==========================================

    // 1. Hitung total penggunaan per sumber dari list transaksi
    let usedBop = 0;
    let usedIuran = 0;

    listPengeluaran.forEach((item) => {
        if (item.masuk_bop_id) {
            usedBop += parseInt(item.nominal);
        } else if (item.masuk_iuran_id) {
            usedIuran += parseInt(item.nominal);
        }
    });

    // 2. Tentukan Jenis Sumber Dana (Single/Mixed) untuk Label Kartu
    let sumberDanaLabel = "-";
    if (usedBop > 0 && usedIuran > 0) {
        sumberDanaLabel = "Campuran (BOP + Iuran)";
    } else if (usedBop > 0) {
        sumberDanaLabel = "Kas BOP";
    } else if (usedIuran > 0) {
        sumberDanaLabel = "Kas Iuran";
    } else if (listPengeluaran.length > 0) {
        sumberDanaLabel = "Tidak Diketahui";
    }

    // 3. Hitung Dana Awal (Snapshot)
    // Rumus: Saldo Sisa Saat Ini + Total yang sudah dipakai kegiatan ini
    const initialBopSnapshot = (parseInt(sisaBop) || 0) + usedBop;
    const initialIuranSnapshot = (parseInt(sisaIuran) || 0) + usedIuran;

    // Total Dana Awal Gabungan (Yang relevan saja)
    let totalInitialSnapshot = 0;
    if (usedBop > 0 && usedIuran > 0) {
        totalInitialSnapshot = initialBopSnapshot + initialIuranSnapshot;
    } else if (usedBop > 0) {
        totalInitialSnapshot = initialBopSnapshot;
    } else if (usedIuran > 0) {
        totalInitialSnapshot = initialIuranSnapshot;
    } else {
        // Fallback jika belum ada pengeluaran
        totalInitialSnapshot =
            (parseInt(sisaBop) || 0) + (parseInt(sisaIuran) || 0);
    }

    // Total Sisa Gabungan (Yang relevan saja)
    let totalSisaNow = 0;
    if (usedBop > 0 && usedIuran > 0) {
        totalSisaNow = (parseInt(sisaBop) || 0) + (parseInt(sisaIuran) || 0);
    } else if (usedBop > 0) {
        totalSisaNow = parseInt(sisaBop) || 0;
    } else if (usedIuran > 0) {
        totalSisaNow = parseInt(sisaIuran) || 0;
    } else {
        totalSisaNow = (parseInt(sisaBop) || 0) + (parseInt(sisaIuran) || 0);
    }

    return (
        <AppLayout>
            <div className="space-y-8 p-4 md:p-0">
                {/* ✅ HEADER & BREADCRUMBS (CLEAN STYLE) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            RINCIAN KEGIATAN
                        </h1>
                        <Breadcrumbs
                            items={[
                                {
                                    label: "Dashboard",
                                    href: route("dashboard"),
                                },
                                {
                                    label: "Kegiatan",
                                    href: route("kegiatan.index"),
                                },
                                { label: "Rincian" },
                            ]}
                        />
                    </div>
                    <Link href={route("kegiatan.index")}>
                        <Button
                            variant="outline"
                            className="bg-white hover:bg-gray-50 border-gray-300"
                        >
                            Kembali
                        </Button>
                    </Link>
                </div>

                {/* --- BAGIAN 1: INFORMASI KEGIATAN --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Kiri: Detail Teks */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {kegiatan.nm_keg}
                                </h2>
                                {listPengeluaran.length > 0 ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold uppercase rounded-full">
                                        Terlaksana
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold uppercase rounded-full">
                                        Direncanakan
                                    </span>
                                )}
                            </div>

                            <div className="mb-6">
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-100">
                                    {kegiatan.kategori}
                                </span>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                                            Waktu Pelaksanaan
                                        </p>
                                        <p className="font-medium text-gray-900 mt-1">
                                            {formatDate(kegiatan.tgl_mulai)} s/d{" "}
                                            {formatDate(kegiatan.tgl_selesai)}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <User className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                                                Penanggung Jawab
                                            </p>
                                            <p className="font-medium text-gray-900 mt-1">
                                                {kegiatan.pj_keg}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Users className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                                                Panitia
                                            </p>
                                            <p className="font-medium text-gray-900 mt-1">
                                                {kegiatan.panitia}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div className="w-full">
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mb-1">
                                            Rincian / Deskripsi
                                        </p>
                                        <div className="bg-gray-50 p-4 rounded-lg text-gray-700 leading-relaxed text-sm border border-gray-100">
                                            {kegiatan.rincian_kegiatan ||
                                                kegiatan.nm_keg}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Kanan: Dokumentasi Foto (Support Multiple) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border rounded-2xl p-6 shadow-sm h-full flex flex-col">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">
                                Dokumentasi (
                                {kegiatan.dokumentasi_urls?.length || 0})
                            </h3>

                            {kegiatan.dokumentasi_urls &&
                            kegiatan.dokumentasi_urls.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[500px] pr-2">
                                    {kegiatan.dokumentasi_urls.map(
                                        (url, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group cursor-pointer"
                                                onClick={() =>
                                                    setSelectedNota(url)
                                                }
                                            >
                                                <img
                                                    src={url}
                                                    alt={`Dokumentasi ${
                                                        idx + 1
                                                    }`}
                                                    className="w-full h-auto object-cover rounded-xl shadow-sm border group-hover:scale-[1.02] transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            "https://placehold.co/600x400?text=Gagal";
                                                    }}
                                                />
                                                {/* Overlay icon zoom */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                    <ZoomIn className="text-white w-8 h-8 drop-shadow-md" />
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-100">
                                    <p className="text-sm text-gray-400">
                                        Belum ada foto
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN 2: LOGIKA KEUANGAN (MULTIPLE & MIXED SOURCE) --- */}
                <div className="pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Laporan Keuangan
                        </h2>

                        {/* Tombol Tambah Pengeluaran Lagi */}
                        {listPengeluaran.length > 0 && canAddExpense && (
                            <Link href={route("dashboard")}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Tambah Pengeluaran Lain
                                </Button>
                            </Link>
                        )}
                    </div>

                    {listPengeluaran.length > 0 ? (
                        // === SKENARIO 1: SUDAH ADA PENGELUARAN ===
                        <div className="space-y-6">
                            {/* KARTU RINGKASAN (DINAMIS 2 SUMBER) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* 1. Total Dana Awal */}
                                <Card className="rounded-2xl border-none shadow-md bg-white overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                                                <PiggyBank className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Total Dana Awal
                                        </p>
                                        <p className="text-xl font-bold text-gray-800">
                                            {formatRupiah(totalInitialSnapshot)}
                                        </p>
                                        {/* Breakdown Kecil */}
                                        <div className="mt-2 text-xs text-gray-400">
                                            {usedBop > 0 && (
                                                <span>
                                                    BOP:{" "}
                                                    {formatRupiah(
                                                        initialBopSnapshot
                                                    )}
                                                    <br />
                                                </span>
                                            )}
                                            {usedIuran > 0 && (
                                                <span>
                                                    Iuran:{" "}
                                                    {formatRupiah(
                                                        initialIuranSnapshot
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 2. Total Digunakan */}
                                <Card className="rounded-2xl border-none shadow-md bg-white overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                                                <ArrowDownCircle className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Total Digunakan
                                        </p>
                                        <p className="text-xl font-bold text-pink-600">
                                            {formatRupiah(totalPengeluaran)}
                                        </p>
                                        {/* Breakdown Kecil */}
                                        <div className="mt-2 text-xs text-pink-400">
                                            {usedBop > 0 && (
                                                <span>
                                                    BOP: {formatRupiah(usedBop)}
                                                    <br />
                                                </span>
                                            )}
                                            {usedIuran > 0 && (
                                                <span>
                                                    Iuran:{" "}
                                                    {formatRupiah(usedIuran)}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 3. Sisa Saldo Sekarang */}
                                <Card className="rounded-2xl border-none shadow-md bg-white overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                                                <Wallet className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Sisa Dana Sekarang
                                        </p>
                                        <p className="text-xl font-bold text-emerald-600">
                                            {formatRupiah(totalSisaNow)}
                                        </p>
                                        {/* Breakdown Kecil */}
                                        <div className="mt-2 text-xs text-emerald-600/70">
                                            {usedBop > 0 && (
                                                <span>
                                                    BOP: {formatRupiah(sisaBop)}
                                                    <br />
                                                </span>
                                            )}
                                            {usedIuran > 0 && (
                                                <span>
                                                    Iuran:{" "}
                                                    {formatRupiah(sisaIuran)}
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 4. Sumber Dana */}
                                <Card className="rounded-2xl border-none shadow-md bg-white overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                                <Coins className="w-5 h-5" />
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Sumber Dana
                                        </p>
                                        <p className="text-lg font-bold text-blue-600 uppercase break-words leading-tight">
                                            {sumberDanaLabel}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* DAFTAR TRANSAKSI (DENGAN LABEL SUMBER) */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-800">
                                    Daftar Transaksi ({listPengeluaran.length})
                                </h3>
                                {listPengeluaran.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className="bg-white border rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden"
                                    >
                                        {/* Label Sumber Dana */}
                                        <div className="absolute top-0 right-0 p-4">
                                            {item.masuk_bop_id ? (
                                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md border border-blue-200">
                                                    Sumber: BOP
                                                </span>
                                            ) : item.masuk_iuran_id ? (
                                                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-md border border-purple-200">
                                                    Sumber: Iuran
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 mt-2">
                                            {/* Info Transaksi */}
                                            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                                                        Tanggal Transaksi
                                                    </p>
                                                    <p className="font-medium text-gray-900 text-base">
                                                        {formatDate(item.tgl)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                                                        Toko / Vendor
                                                    </p>
                                                    <p className="font-medium text-gray-900 text-base">
                                                        {item.toko || "-"}
                                                    </p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                                                        Keterangan
                                                    </p>
                                                    <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-100">
                                                        {item.ket}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2 mt-1">
                                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">
                                                        Nominal
                                                    </p>
                                                    <p className="text-lg font-bold text-red-600">
                                                        {formatRupiah(
                                                            item.nominal
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bukti Nota (Per Item) */}
                                            {item.bkt_nota_url && (
                                                <div className="flex-shrink-0 md:w-48">
                                                    <p className="text-xs text-gray-400 font-bold uppercase mb-2">
                                                        Bukti Nota
                                                    </p>
                                                    <div
                                                        className="relative group cursor-pointer"
                                                        onClick={() =>
                                                            setSelectedNota(
                                                                item.bkt_nota_url
                                                            )
                                                        }
                                                    >
                                                        <img
                                                            src={
                                                                item.bkt_nota_url
                                                            }
                                                            alt="Nota"
                                                            className="rounded-lg border shadow-sm w-full h-32 object-cover hover:opacity-90 transition-opacity"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                            <ZoomIn className="text-white w-6 h-6 drop-shadow-md" />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        // === SKENARIO 2: BELUM ADA PENGELUARAN ===
                        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Belum Ada Laporan Keuangan
                            </h3>
                            <p className="text-gray-500 max-w-lg mb-8">
                                Kegiatan ini belum memiliki data pengeluaran
                                yang tercatat. Silakan input pengeluaran setelah
                                kegiatan terlaksana.
                            </p>

                            {/* Tombol hanya muncul jika user punya izin */}
                            {canAddExpense && (
                                <div className="flex flex-col items-center">
                                    <Link href={route("dashboard")}>
                                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-xl text-lg shadow-lg shadow-blue-200">
                                            <PlusCircle className="w-5 h-5 mr-2" />
                                            Input Pengeluaran Sekarang
                                        </Button>
                                    </Link>
                                    <p className="text-xs text-gray-400 mt-3 bg-gray-50 px-3 py-1 rounded-full">
                                        *Arahkan ke Dashboard &gt; Tambah
                                        Pengeluaran &gt; Pilih Kegiatan ini
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL POPUP GAMBAR (NOTA/DOKUMENTASI) */}
                <Dialog
                    open={!!selectedNota}
                    onOpenChange={(open) => !open && setSelectedNota(null)}
                >
                    <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                        <div className="relative flex justify-center items-center">
                            {/* Tombol Close */}
                            <button
                                onClick={() => setSelectedNota(null)}
                                className="absolute -top-10 right-0 md:-right-10 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition"
                            >
                                <X className="h-6 w-6" />
                            </button>

                            {selectedNota && (
                                <img
                                    src={selectedNota}
                                    alt="Preview"
                                    className="w-auto h-auto max-h-[80vh] max-w-full rounded-lg shadow-2xl object-contain bg-white"
                                />
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

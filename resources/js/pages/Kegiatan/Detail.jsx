import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    Coins
} from "lucide-react";

// ✅ Terima sisaBop dan sisaIuran dari Controller
export default function Detail({ kegiatan, totalPengeluaran, canAddExpense, sisaBop, sisaIuran }) {
    
    // --- FORMATTER ---
    const formatRupiah = (val) => "Rp " + parseInt(val || 0).toLocaleString("id-ID");
    
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Data Pengeluaran dari relasi
    const pengeluaran = kegiatan.pengeluaran;

    // --- LOGIKA PERHITUNGAN KARTU (DINAMIS) ---
    let jumlahAwal = 0;
    let labelDanaAwal = "Jumlah Dana Awal";
    let labelDanaSisa = "Sisa Dana Sekarang";

    if (pengeluaran) {
        if (pengeluaran.tipe === 'bop') {
            // Jika pakai BOP: Awal = Sisa BOP sekarang + Yang dipakai ini
            jumlahAwal = (parseInt(sisaBop) || 0) + parseInt(totalPengeluaran);
            labelDanaAwal = "Dana BOP Awal";
            labelDanaSisa = "Sisa Dana BOP";
        } else if (pengeluaran.tipe === 'iuran') {
            // Jika pakai Iuran: Awal = Sisa Iuran sekarang + Yang dipakai ini
            jumlahAwal = (parseInt(sisaIuran) || 0) + parseInt(totalPengeluaran);
            labelDanaAwal = "Dana Iuran Awal";
            labelDanaSisa = "Sisa Dana Iuran";
        }
    }

    const jumlahDigunakan = totalPengeluaran;
    const jumlahSekarang = jumlahAwal - jumlahDigunakan;

    return (
        <AppLayout>
            <div className="w-full min-h-screen bg-white pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                
                {/* Header & Breadcrumbs */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">RINCIAN KEGIATAN</h1>
                </div>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Kegiatan", href: route("kegiatan.index") },
                        { label: "Rincian" },
                    ]}
                />

                <div className="mt-8 space-y-8">
                    
                    {/* --- BAGIAN 1: KARTU UTAMA (Informasi Kegiatan) --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kiri: Detail Teks */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">{kegiatan.nm_keg}</h2>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                                        {kegiatan.kategori}
                                    </span>
                                    {pengeluaran ? (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                            Terlaksana
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-semibold rounded-full">
                                            Direncanakan
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Waktu Pelaksanaan</p>
                                            <p className="font-medium text-gray-900">
                                                {formatDate(kegiatan.tgl_mulai)} s/d {formatDate(kegiatan.tgl_selesai)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Penanggung Jawab</p>
                                            <p className="font-medium text-gray-900">{kegiatan.pj_keg}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Panitia</p>
                                            <p className="font-medium text-gray-900">{kegiatan.panitia}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Rincian / Deskripsi</p>
                                            <p className="font-medium text-gray-900 leading-relaxed">
                                                {kegiatan.rincian_kegiatan || kegiatan.nm_keg}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kanan: Dokumentasi Foto */}
                        <div className="lg:col-span-1">
                            <div className="bg-white border rounded-2xl p-6 shadow-sm h-full">
                                <h3 className="font-semibold text-gray-700 mb-4">Dokumentasi</h3>
                                {kegiatan.dokumentasi_url ? (
                                    <img 
                                        src={kegiatan.dokumentasi_url} 
                                        alt="Dokumentasi" 
                                        className="w-full h-auto rounded-lg shadow-sm border object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <p className="text-sm text-gray-400">Belum ada foto</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- BAGIAN 2: LOGIKA KEUANGAN (Ala Rincian.jsx) --- */}
                    
                    <div className="pt-6 border-t border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Laporan Keuangan</h2>

                        {pengeluaran ? (
                            // === JIKA SUDAH ADA PENGELUARAN (TAMPILAN KARTU) ===
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                
                                {/* 👇 KARTU RINGKASAN KEUANGAN 👇 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    
                                    {/* 1. Jumlah Awal (Dinamis BOP/Iuran) */}
                                    <Card className="rounded-2xl border border-gray-100 shadow-sm bg-orange-50">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 rounded-lg bg-orange-100">
                                                    <PiggyBank className="h-5 w-5 text-orange-600" />
                                                </div>
                                                <div className="text-gray-400">...</div>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-sm text-orange-700 font-medium">{labelDanaAwal}</p>
                                                <p className="text-lg font-bold text-orange-700">
                                                    {formatRupiah(jumlahAwal)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 2. Jumlah Digunakan */}
                                    <Card className="rounded-2xl border border-gray-100 shadow-sm bg-pink-50">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 rounded-lg bg-pink-100">
                                                    <ArrowDownCircle className="h-5 w-5 text-pink-600" />
                                                </div>
                                                <div className="text-gray-400">...</div>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-sm text-pink-700 font-medium">Jumlah Digunakan</p>
                                                <p className="text-lg font-bold text-pink-700">
                                                    {formatRupiah(jumlahDigunakan)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 3. Jumlah Sekarang (Sisa) */}
                                    <Card className="rounded-2xl border border-gray-100 shadow-sm bg-green-50">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 rounded-lg bg-green-100">
                                                    <Wallet className="h-5 w-5 text-green-600" />
                                                </div>
                                                <div className="text-gray-400">...</div>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-sm text-green-700 font-medium">{labelDanaSisa}</p>
                                                <p className="text-lg font-bold text-green-700">
                                                    {formatRupiah(jumlahSekarang)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* 4. Status Dana / Jenis */}
                                    <Card className="rounded-2xl border border-gray-100 shadow-sm bg-blue-50">
                                        <CardContent className="p-5">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2 rounded-lg bg-blue-100">
                                                    <Coins className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="text-gray-400">...</div>
                                            </div>
                                            <div className="mt-4">
                                                <p className="text-sm text-blue-700 font-medium">Status Dana</p>
                                                <p className="text-lg font-bold text-blue-700">
                                                    {pengeluaran.tipe === 'bop' ? 'Dana BOP' : 'Dana Iuran'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>

                                </div>
                                {/* 👆👆 BATAS KARTU 👆👆 */}

                                {/* Detail Transaksi Pengeluaran */}
                                <div className="bg-white border rounded-2xl shadow-sm p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Rincian Transaksi</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div>
                                            <p className="text-gray-500">Tanggal Transaksi</p>
                                            <p className="font-medium text-gray-900">{formatDate(pengeluaran.tgl)}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Toko / Vendor</p>
                                            <p className="font-medium text-gray-900">{pengeluaran.toko || "-"}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-gray-500">Keterangan</p>
                                            <p className="font-medium text-gray-900">{pengeluaran.ket}</p>
                                        </div>
                                    </div>

                                    {/* Bukti Nota Pengeluaran */}
                                    {pengeluaran.bkt_nota_url && (
                                        <div className="mt-6">
                                            <p className="text-gray-500 mb-2">Bukti Nota / Kwitansi</p>
                                            <img 
                                                src={pengeluaran.bkt_nota_url} 
                                                alt="Nota" 
                                                className="rounded-lg border max-w-sm shadow-sm"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // === JIKA BELUM ADA PENGELUARAN ===
                            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-2">
                                    <AlertCircle className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Belum Ada Laporan Keuangan</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    Kegiatan ini belum memiliki data pengeluaran yang tercatat.
                                </p>

                                {/* Tombol Tambah (Hanya untuk RT & Bendahara) */}
                                {canAddExpense && (
                                    <div className="mt-6">
                                        <Link href={route('dashboard')}>
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                <PlusCircle className="w-4 h-4 mr-2" />
                                                Input Pengeluaran di Dashboard
                                            </Button>
                                        </Link>
                                        <p className="text-xs text-gray-400 mt-2">
                                            *Masuk ke Dashboard {'>'} Tambah Pengeluaran {'>'} Pilih Kegiatan ini
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
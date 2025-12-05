import React, { useState } from 'react';
import { Download, Calendar, User, Users, FileText, ArrowDownCircle, Wallet, AlertCircle, PlusCircle, PiggyBank, Coins } from "lucide-react";

// =========================================================
// MOCKS UNTUK LINGKUNGAN INERTIA/TAILWIND
// =========================================================

// ✅ KOREKSI FUNGSI ROUTE MOCK FINAL
const route = (name, params = {}) => {
    // 1. Tangani rute SPJ PDF yang baru (download.laporan.spj)
    if (name === "download.laporan.spj" && params.id) {
        // Ini menghasilkan URL: /laporan/spj/{id}?date=... (Sinkron dengan web.php)
        let url = `/laporan/spj/${params.id}`; 
        if (params.date) {
            url += `?date=${params.date}`;
        }
        return url;
    }
    
    // 2. Tangani rute teman Anda (download.pdf - Ringkasan Keuangan)
    if (name === "download.pdf") {
        let url = `/download/pdf`;
        if (params.date) {
             url += `?date=${params.date}`;
        }
        return url;
    }

    // 3. Default mock untuk rute Inertia lainnya
    let url = `/app/${name}`;
    if (params.id) url = url.replace('kegiatan', `kegiatan/${params.id}`);
    if (params.date) url += `?date=${params.date}`;
    return url;
};

// Mock AppLayout Component
const AppLayout = ({ children }) => (
    <div className="min-h-screen bg-gray-100 pt-12">{children}</div>
);

// Mock Link Component
const Link = ({ href, children, className }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); console.log(`Navigasi ke: ${href}`); }} className={className}>{children}</a>
);

// Mock Button Component
const Button = ({ onClick, className, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center transition duration-150 ease-in-out font-medium rounded-lg ${className}`}
    >
        {children}
    </button>
);

// Mock Card Components
const Card = ({ children, className }) => <div className={`border rounded-xl ${className}`}>{children}</div>;
const CardContent = ({ children, className }) => <div className={`p-4 ${className}`}>{children}</div>;
const Breadcrumbs = ({ items }) => (
    <div className="text-sm text-gray-500">
        {items.map((item, index) => (
            <React.Fragment key={index}>
                {item.href ? (
                    <Link href={item.href} className="hover:text-purple-600">{item.label}</Link>
                ) : (
                    <span>{item.label}</span>
                )}
                {index < items.length - 1 && <span className="mx-2">/</span>}
            </React.Fragment>
        ))}
    </div>
);

// =========================================================
// KOMPONEN DOWNLOAD PDF (DIINTEGRASIKAN)
// =========================================================

/**
 * Komponen Tombol Download PDF yang diintegrasikan.
 */
function DownloadPdfBtn({ kegiatanId, date }) {
    const handleDownload = () => {
        // PANGGIL NAMA ROUTE YANG BARU & UNIK
        const url = route("download.laporan.spj", { id: kegiatanId, date: date || "" });

        console.log(`[DOWNLOAD] Mempersiapkan unduhan PDF untuk ID: ${kegiatanId}. URL yang Digunakan: ${url}`);
        
        // Menggunakan window.open dengan _blank. Ini bekerja karena Controller harus memaksa download.
        window.open(url, "_blank");
    };

    return (
        <Button
            onClick={handleDownload}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md shadow-md hover:shadow-lg transition duration-200"
        >
            <Download className="w-4 h-4 mr-2" />
            Download Laporan PDF
        </Button>
    );
}


// =========================================================
// DATA MOCK DAN KOMPONEN UTAMA DETAIL
// =========================================================

// Data kegiatan contoh untuk simulasi (Ganti dengan prop yang sebenarnya)
const MOCK_KEGIATAN = {
    id: 123,
    nm_keg: "Pelatihan Pengembangan Web Modern (React & Laravel)",
    kategori: "Pendidikan & IT",
    tgl_mulai: "2024-10-01",
    tgl_selesai: "2024-10-05",
    pj_keg: "Rizky Firmansyah, S.Kom",
    panitia: "Tim Divisi Teknis",
    rincian_kegiatan: "Pelatihan intensif selama 5 hari mencakup dasar-dasar React, Tailwind CSS, dan integrasi API dengan Laravel. Bertujuan meningkatkan kompetensi tim internal.",
    dokumentasi_url: "https://placehold.co/400x300/e0e0e0/555555?text=Foto+Kegiatan",
    
    // Data pengeluaran jika sudah terlaksana
    pengeluaran: {
        tgl: "2024-10-06",
        tipe: 'bop', // Bisa 'bop' atau 'iuran'
        toko: 'Warung Nasi Jaya Abadi',
        ket: 'Pembayaran konsumsi dan sewa proyektor selama 5 hari pelatihan.',
        bkt_nota_url: "https://placehold.co/300x200/f8d7da/721c24?text=Bukti+Nota+Pembelian",
    },
};

export default function Detail({ 
    kegiatan = MOCK_KEGIATAN, 
    totalPengeluaran = 3500000, 
    canAddExpense = true, 
    sisaBop = 5000000, 
    sisaIuran = 1000000 
}) {
    
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
    let danaType = 'n/a';

    if (pengeluaran) {
        danaType = pengeluaran.tipe;
        if (danaType === 'bop') {
            jumlahAwal = (parseInt(sisaBop) || 0) + parseInt(totalPengeluaran);
            labelDanaAwal = "Dana BOP Awal";
            labelDanaSisa = "Sisa Dana BOP";
        } else if (danaType === 'iuran') {
            jumlahAwal = (parseInt(sisaIuran) || 0) + parseInt(totalPengeluaran);
            labelDanaAwal = "Dana Iuran Awal";
            labelDanaSisa = "Sisa Dana Iuran";
        }
    }

    const jumlahDigunakan = totalPengeluaran;
    const jumlahSekarang = jumlahAwal - jumlahDigunakan;

    return (
        <AppLayout>
            {/* Mengubah layout agar konten tidak terlalu menempel di tepi */}
            <div className="w-full min-h-screen bg-gray-100 p-4 md:p-8">
                
                {/* Pembungkus Konten Putih */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    
                    {/* Header Utama (Judul Halaman) */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-extrabold text-gray-900">RINCIAN KEGIATAN</h1>
                    </div>

                    {/* CONTAINER UNTUK BREADCRUMBS DAN TOMBOL DOWNLOAD */}
                    <div className="flex justify-between items-center mt-4 mb-8 pb-4 border-b border-gray-100">
                        <Breadcrumbs
                            items={[
                                { label: "Dashboard", href: route("dashboard") },
                                { label: "Kegiatan", href: route("kegiatan.index") },
                                { label: "Rincian" },
                            ]}
                        />
                        {/* Tombol Download Ditempatkan Sejajar dengan Breadcrumbs di Kanan */}
                        {pengeluaran && (
                            <DownloadPdfBtn 
                                kegiatanId={kegiatan.id} 
                                date={pengeluaran.tgl} 
                            />
                        )}
                    </div>
                    {/* AKHIR CONTAINER BREADCRUMBS/TOMBOL */}


                    {/* Konten Utama */}
                    <div className="space-y-10">
                        
                        {/* --- BAGIAN 1: KARTU UTAMA (Informasi Kegiatan & Dokumentasi) --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Kiri: Detail Teks (lg:col-span-2) */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{kegiatan.nm_keg}</h2>
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

                            {/* Kanan: Dokumentasi Foto (lg:col-span-1) - Sekarang Sejajar */}
                            <div className="lg:col-span-1 space-y-6">
                                <div className="bg-white border rounded-2xl p-6 shadow-sm h-full">
                                    <h3 className="font-semibold text-gray-700 mb-4">Dokumentasi</h3>
                                    {kegiatan.dokumentasi_url ? (
                                        <img 
                                            src={kegiatan.dokumentasi_url} 
                                            alt="Dokumentasi" 
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/e0e0e0/555555?text=Gambar+Gagal+Dimuat"; }}
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

                        {/* --- BAGIAN 2: LOGIKA KEUANGAN --- */}
                        <div className="pt-6 border-t border-gray-100">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800">Laporan Keuangan</h2>

                            {pengeluaran ? (
                                // === JIKA SUDAH ADA PENGELUARAN (TAMPILAN KARTU) ===
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    
                                    {/* 👇 KARTU RINGKASAN KEUANGAN 👇 */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                        
                                        {/* 1. Jumlah Awal (Dinamis BOP/Iuran) */}
                                        <Card className="rounded-2xl border border-gray-100 shadow-lg bg-orange-50">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start">
                                                    <div className="p-2 rounded-lg bg-orange-100">
                                                        <PiggyBank className="h-5 w-5 text-orange-600" />
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-sm text-orange-700 font-medium">{labelDanaAwal}</p>
                                                    <p className="text-xl font-bold text-orange-700">
                                                        {formatRupiah(jumlahAwal)}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 2. Jumlah Digunakan */}
                                        <Card className="rounded-2xl border border-gray-100 shadow-lg bg-pink-50">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start">
                                                    <div className="p-2 rounded-lg bg-pink-100">
                                                        <ArrowDownCircle className="h-5 w-5 text-pink-600" />
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-sm text-pink-700 font-medium">Jumlah Digunakan</p>
                                                    <p className="text-xl font-bold text-pink-700">
                                                        {formatRupiah(jumlahDigunakan)}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 3. Jumlah Sekarang (Sisa) */}
                                        <Card className="rounded-2xl border border-gray-100 shadow-lg bg-green-50">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start">
                                                    <div className="p-2 rounded-lg bg-green-100">
                                                        <Wallet className="h-5 w-5 text-green-600" />
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-sm text-green-700 font-medium">{labelDanaSisa}</p>
                                                    <p className="text-xl font-bold text-green-700">
                                                        {formatRupiah(jumlahSekarang)}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* 4. Status Dana / Jenis */}
                                        <Card className="rounded-2xl border border-gray-100 shadow-lg bg-blue-50">
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start">
                                                    <div className="p-2 rounded-lg bg-blue-100">
                                                        <Coins className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <p className="text-sm text-blue-700 font-medium">Jenis Dana</p>
                                                    <p className="text-xl font-bold text-blue-700 uppercase">
                                                        {danaType === 'bop' ? 'Dana BOP' : 'Dana Iuran'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                    </div>
                                    {/* 👆👆 BATAS KARTU 👆👆 */}

                                    {/* Detail Transaksi Pengeluaran */}
                                    <div className="bg-white border rounded-2xl shadow-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Detail Transaksi Pengeluaran</h3>
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
                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200/f8d7da/721c24?text=Bukti+Nota+Tidak+Ditemukan"; }}
                                                    className="rounded-lg border max-w-sm shadow-md"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // === JIKA BELUM ADA PENGELUARAN ===
                                <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center space-y-4 shadow-inner">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-2">
                                        <AlertCircle className="w-8 h-8 text-gray-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Belum Ada Laporan Keuangan</h3>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        Kegiatan ini belum memiliki data pengeluaran yang tercatat. Silakan input pengeluaran setelah kegiatan terlaksana.
                                    </p>

                                    {/* Tombol Tambah (Hanya untuk RT & Bendahara) */}
                                    {canAddExpense && (
                                        <div className="mt-6">
                                            <Link href={route('dashboard')}>
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                                                    <PlusCircle className="w-4 h-4 mr-2" />
                                                    Input Pengeluaran Sekarang
                                                </Button>
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-2">
                                                *Masuk ke Dashboard {'->'} Tambah Pengeluaran {'->'} Pilih Kegiatan ini
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
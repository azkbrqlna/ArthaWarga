import React, { useState, useMemo } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from "@/components/ui/button"; 

export default function IndexRT({ auth, tagihan }) {
    // --- SETUP DEFAULT DATE (Bulan & Tahun Ini) ---
    const now = new Date();
    const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");
    const defaultYear = String(now.getFullYear());

    // --- STATE & CONFIG ---
    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
    const [selectedYear, setSelectedYear] = useState(defaultYear);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; 

    // --- HELPER FUNCTIONS ---
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

    const handleDelete = (id, nama) => {
        if (confirm(`Apakah Anda yakin ingin menghapus tagihan milik ${nama}? Data tidak bisa dikembalikan.`)) {
            router.delete(route('tagihan.destroy', id));
        }
    };

    // --- LOGIKA FILTER ---
    const filteredData = useMemo(() => {
        return tagihan.filter((item) => {
            const itemMonth = String(item.bulan).padStart(2, "0"); 
            const itemYear = String(item.tahun);
            const monthMatch = selectedMonth ? itemMonth === selectedMonth : true;
            const yearMatch = selectedYear ? itemYear === selectedYear : true;
            return monthMatch && yearMatch;
        });
    }, [tagihan, selectedMonth, selectedYear]);

    // --- LOGIKA HITUNG SALDO (Fitur Baru) ---
    const totals = useMemo(() => {
        return filteredData.reduce((acc, item) => {
            const nominal = Number(item.nominal) || 0;
            const status = item.status ? item.status.toLowerCase() : '';

            // Hitung berdasarkan status
            if (status === 'approved' || status === 'lunas') {
                acc.lunas += nominal;
            } else if (status === 'pending' || status === 'ditagihkan') {
                acc.pending += nominal;
            }
            return acc;
        }, { lunas: 0, pending: 0 });
    }, [filteredData]);

    // --- LOGIKA PAGINATION ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    // Reset halaman ke 1 jika filter berubah
    useMemo(() => {
        setCurrentPage(1);
    }, [selectedMonth, selectedYear]);

    // --- LOGIKA WARNA STATUS ---
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved':
            case 'lunas': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'declined':
            case 'ditolak': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    return (
        <AppLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Monitoring Tagihan Warga</h2>}>
            <Head title="Monitoring Tagihan" />

            <div className="py-1">
                <div className="w-full px-1"> 
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 self-start md:self-center">
                            <span className="font-bold text-gray-900 pr-5">DAFTAR TAGIHAN BULANAN</span>
                        </h1>
                        <div className="flex gap-3 self-end md:self-center">
                            <Link 
                                href={route('kat_iuran.index')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded-md transition shadow-sm font-medium"
                            >
                                Edit Tagihan Air
                            </Link>
                            <Link 
                                href={route('tagihan.create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition shadow-sm font-medium"
                            >
                                Tambah Tagihan
                            </Link>
                        </div>
                    </div>

                    {/* --- SUMMARY CARDS (FITUR BARU) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {/* Card Saldo Ditagihkan (Kuning) */}
                        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-yellow-500 p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    SALDO DITAGIHKAN (PENDING)
                                </h3>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatRupiah(totals.pending)}
                                </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Menunggu pembayaran/verifikasi
                            </p>
                        </div>

                        {/* Card Saldo Lunas (Hijau) */}
                        <div className="bg-white rounded-xl border border-gray-200 border-l-4 border-l-emerald-500 p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                    SALDO LUNAS
                                </h3>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {formatRupiah(totals.lunas)}
                                </p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                Sudah masuk pembukuan
                            </p>
                        </div>
                    </div>

                    {/* TABEL CONTAINER */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                        
                        {/* SECTION FILTER */}
                        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-2 items-center justify-end bg-gray-50">
                            <span className="text-sm text-gray-600 font-medium mr-1">Filter:</span>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 shadow-sm outline-none"
                            >
                                <option value="">Semua Bulan</option>
                                {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m, i) => (
                                    <option key={m} value={m}>{new Date(0, i).toLocaleString("id-ID", { month: "long" })}</option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 shadow-sm outline-none"
                            >
                                <option value="">Semua Tahun</option>
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const year = new Date().getFullYear() - i + 1;
                                    return <option key={year} value={year}>{year}</option>;
                                })}
                            </select>
                            {(selectedMonth || selectedYear) && (
                                <button
                                    onClick={() => { setSelectedMonth(""); setSelectedYear(""); }}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium px-2"
                                >
                                    Reset
                                </button>
                            )}
                        </div>

                        {/* TABLE */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warga</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meteran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    <p className="text-base">Tidak ada data tagihan yang sesuai filter.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{item.user?.nm_lengkap}</div>
                                                    <div className="text-xs text-gray-500">{item.user?.alamat}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{item.bulan} / {item.tahun}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">{item.mtr_bln_lalu}</span>
                                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                                        <span className="font-bold">{item.mtr_skrg}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">Pakai: {item.mtr_skrg - item.mtr_bln_lalu} m³</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{formatRupiah(item.nominal)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                                                        {item.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <div className="flex justify-center items-center gap-3">
                                                        <Link href={route('tagihan.edit', item.id)} className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1 hover:underline">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> Edit
                                                        </Link>
                                                        <button onClick={() => handleDelete(item.id, item.user?.nm_lengkap)} className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1 hover:underline">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* SECTION PAGINATION DENGAN BUTTON SHADCN */}
                        {filteredData.length > 0 && (
                            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 px-6 py-4 bg-white border-t border-gray-200">
                                
                                <div className="flex items-center gap-2">
                                    {/* Tombol Previous */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="h-9 w-9 p-0"
                                    >
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </Button>

                                    {/* Nomor Halaman */}
                                    {Array.from({ length: totalPages }).map((_, i) => {
                                        const pageNum = i + 1;
                                        const isActive = currentPage === pageNum;
                                        
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={isActive ? "default" : "outline"}
                                                size="icon"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`h-9 w-9 p-0 ${isActive ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' : ''}`}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}

                                    {/* Tombol Next */}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="h-9 w-9 p-0"
                                    >
                                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
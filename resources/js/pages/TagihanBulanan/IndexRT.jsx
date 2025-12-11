import React, { useState, useMemo } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';

export default function IndexRT({ auth, tagihan, totalDitagihkan, totalLunas, totalJimpitan }) {
    // --- STATE & CONFIG ---
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // --- HELPER FUNCTIONS ---
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

    const handleDelete = (id, nama) => {
        if (confirm(`Apakah Anda yakin ingin menghapus tagihan milik ${nama}? Data tidak bisa dikembalikan.`)) {
            router.delete(route('tagihan.destroy', id));
        }
    };

    const handleApprove = (id) => {
        if (confirm("Verifikasi pembayaran ini valid?")) {
            router.patch(route("tagihan.approve", id));
        }
    };

    const handleDecline = (id) => {
        if (confirm("Tolak pembayaran ini?")) {
            router.patch(route("tagihan.decline", id));
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

    // --- LOGIKA PAGINATION ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    useMemo(() => { setCurrentPage(1); }, [selectedMonth, selectedYear]);

    // --- LOGIKA WARNA STATUS ---
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'ditagihkan': return 'bg-red-100 text-red-800 border border-red-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Monitoring Tagihan" />

            <div className="py-6 w-full px-4 sm:px-6 lg:px-8"> 
                
                {/* 1. Header & Buttons */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        MONITORING TAGIHAN BULANAN
                    </h1>
                    <div className="flex gap-3">
                        <Link href={route('kat_iuran.index')} className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-4 py-2 rounded-md transition shadow-sm font-medium">
                            Edit Tarif Air
                        </Link>
                        <Link href={route('tagihan.create')} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md transition shadow-sm font-medium flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                            Tambah Tagihan
                        </Link>
                    </div>
                </div>

                {/* 2. CARDS SECTION (Ringkasan Keuangan) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Saldo Ditagihkan */}
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl p-6 border-l-4 border-l-yellow-500">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Saldo Ditagihkan</div>
                        <div className="mt-2 text-2xl font-bold text-gray-900">{formatRupiah(totalDitagihkan)}</div>
                        <p className="text-xs text-gray-400 mt-1">Pending / Belum Bayar</p>
                    </div>

                    {/* Saldo Lunas */}
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl p-6 border-l-4 border-l-green-500">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Saldo Lunas</div>
                        <div className="mt-2 text-2xl font-bold text-green-600">{formatRupiah(totalLunas)}</div>
                        <p className="text-xs text-gray-400 mt-1">Sudah Masuk Kas</p>
                    </div>

                    {/* Total Jimpitan */}
                    <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl p-6 border-l-4 border-l-blue-500">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Jimpitan Terkumpul</div>
                        <div className="mt-2 text-2xl font-bold text-blue-600">{formatRupiah(totalJimpitan)}</div>
                        <p className="text-xs text-gray-400 mt-1">Akumulasi dari tagihan lunas</p>
                    </div>
                </div>

                {/* 3. TABLE & FILTER SECTION */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                    
                    {/* Filter Bar */}
                    <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center justify-end bg-gray-50/50">
                        <span className="text-sm text-gray-600 font-medium mr-1">Filter:</span>
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Semua Bulan</option>
                            {["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].map((m, i) => (
                                <option key={m} value={m}>{new Date(0, i).toLocaleString("id-ID", { month: "long" })}</option>
                            ))}
                        </select>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500">
                            <option value="">Semua Tahun</option>
                            {Array.from({ length: 5 }).map((_, i) => {
                                const year = new Date().getFullYear() - i + 1; 
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                        {(selectedMonth || selectedYear) && (
                            <button onClick={() => { setSelectedMonth(""); setSelectedYear(""); }} className="text-red-600 hover:text-red-800 text-xs font-medium px-2">Reset</button>
                        )}
                    </div>

                    {/* Table */}
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
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                <p>Tidak ada data tagihan yang sesuai filter.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {(currentPage - 1) * itemsPerPage + index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{item.user?.nm_lengkap}</div>
                                                <div className="text-xs text-gray-500">{item.user?.alamat}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">{item.bulan} / {item.tahun}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-500">{item.mtr_bln_lalu}</span>
                                                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                                    <span className="font-bold">{item.mtr_skrg}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">Pakai: {item.mtr_skrg - item.mtr_bln_lalu} m³</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                                {formatRupiah(item.nominal)}
                                                {item.harga_sampah > 0 && <span className="block text-[10px] text-green-600 font-normal">+Sampah</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(item.status)}`}>
                                                    {item.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                {item.status === 'pending' ? (
                                                    // Tombol Approval Jika Pending
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => handleApprove(item.id)} className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded-md shadow-sm" title="Setujui">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                                        </button>
                                                        <button onClick={() => handleDecline(item.id)} className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded-md shadow-sm" title="Tolak">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // Tombol Edit/Hapus Jika Belum Bayar atau Sudah Lunas
                                                    <div className="flex justify-center items-center gap-3">
                                                        <Link href={route('tagihan.edit', item.id)} className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1 hover:underline">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                            Edit
                                                        </Link>
                                                        <button onClick={() => handleDelete(item.id, item.user?.nm_lengkap)} className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1 hover:underline">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                            Hapus
                                                        </button>
                                                        {item.bkt_byr && (
                                                            <a href={`/storage/${item.bkt_byr}`} target="_blank" className="text-gray-500 hover:text-gray-700" title="Lihat Bukti">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-700">
                                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span className="font-medium">{filteredData.length}</span> data
                                </p>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}>
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </button>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button key={i} onClick={() => setCurrentPage(i + 1)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}>
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
import React, { useState, useMemo } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import Swal from 'sweetalert2'; 

export default function IndexRT({ auth, tagihan, totalDitagihkan, totalLunas, totalJimpitan }) {
    // --- 1. SETUP TANGGAL DEFAULT (HARI INI) ---
    const today = new Date();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    const currentYear = String(today.getFullYear());

    // --- STATE & CONFIG ---
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // --- HELPER FUNCTIONS ---
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

    // --- DELETE DENGAN SWEETALERT2 ---
    const handleDelete = (id, nama) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Tagihan milik ${nama} akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444', 
            cancelButtonColor: '#6b7280', 
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true 
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('tagihan.destroy', id), {
                    onSuccess: () => {
                        Swal.fire('Terhapus!', 'Data tagihan berhasil dihapus.', 'success');
                    },
                    onError: () => {
                        Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
                    }
                });
            }
        });
    };

    const handleReset = () => {
        setSelectedMonth("");
        setSelectedYear("");
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
            case 'declined': return 'bg-red-200 text-red-900 border border-red-300';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Monitoring Tagihan" />

            <div className="py-1">
                <div className="w-full px-1">
                
                {/* Header & Buttons */}
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

                {/* --- CARDS SECTION (UPDATED: Clean Style - Persis IndexWarga tapi Putih) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    
                    {/* Card 1: Saldo Ditagihkan */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-lg mr-4">
                                {/* Icon Exclamation / Clock - Neutral Gray */}
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Saldo Ditagihkan</p>
                                <p className="font-bold text-gray-800">{formatRupiah(totalDitagihkan)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Saldo Lunas */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-lg mr-4">
                                {/* Icon Check - Neutral Gray */}
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Saldo Lunas</p>
                                <p className=" font-bold text-gray-800">{formatRupiah(totalLunas)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Total Jimpitan */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-3 rounded-lg mr-4">
                                {/* Icon Chart / Piggy Bank - Neutral Gray */}
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Jimpitan</p>
                                <p className="font-bold text-gray-800">{formatRupiah(totalJimpitan)}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Table & Filter Section */}
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
                            <button onClick={handleReset} className="text-red-600 hover:text-red-800 text-xs font-medium px-2 border border-red-200 rounded bg-red-50 py-1.5 hover:bg-red-100 transition">
                                Reset (Tampilkan Semua)
                            </button>
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
                                                {(selectedMonth || selectedYear) && (
                                                    <button onClick={handleReset} className="mt-2 text-blue-600 hover:underline text-sm">
                                                        Reset Filter
                                                    </button>
                                                )}
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
                                                    {item.status === 'ditagihkan' ? 'belum bayar' : item.status.toLowerCase()}
                                                </span>
                                            </td>
                                            
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                <div className="flex justify-center items-center gap-3">
                                                    <Link href={route('tagihan.edit', item.id)} className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1 hover:underline">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                        Edit
                                                    </Link>
                                                    
                                                    <button onClick={() => handleDelete(item.id, item.user?.nm_lengkap)} className="text-red-600 hover:text-red-900 font-medium flex items-center gap-1 hover:underline">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                        Hapus
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredData.length > 0 && (
                        <div className="flex justify-end items-center gap-2 px-6 py-4 bg-white border-t border-gray-200">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-md border ${
                                    currentPage === 1
                                        ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                        : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                } transition`}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                                <button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition border ${
                                        currentPage === num
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    {num}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-md border ${
                                    currentPage === totalPages
                                        ? "text-gray-300 border-gray-200 cursor-not-allowed"
                                        : "text-gray-600 border-gray-300 hover:bg-gray-50"
                                } transition`}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
import React from 'react';
import AppLayout from '../../Layouts/AppLayout'; 
import { Head, Link } from '@inertiajs/react';

export default function IndexWarga({ auth, tagihan }) {
    // 1. Logic Format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };

    // 2. Logic Hitung Ringkasan (Card Statistik)
    // Hitung manual dari array 'tagihan' agar tidak perlu ubah Controller
    const totalTagihan = tagihan.length;
    
    // Belum Bayar: Status 'ditagihkan' (baru) atau 'declined' (ditolak/harus ulang)
    const belumBayar = tagihan.filter(t => t.status === 'ditagihkan' || t.status === 'declined').length;
    
    // Sudah Lunas: Status 'approved'
    const sudahLunas = tagihan.filter(t => t.status === 'approved').length;

    return (
        <AppLayout title="Riwayat Tagihan Air">
            <div className="p-8">
                {/* Header */}
                <h1 className="text-center text-4xl font-bold mb-6 text-gray-800">Riwayat Tagihan Air</h1>

                {/* --- CARDS SECTION (Ringkasan) --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    
                    {/* Card 1: Total Tagihan */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg mr-4">
                                {/* Icon List */}
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Tagihan</p>
                                <p className="text-2xl font-bold text-blue-800">{totalTagihan}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Belum Bayar (Action Needed) */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-red-100 p-3 rounded-lg mr-4">
                                {/* Icon Exclamation/Clock */}
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-red-600">Belum Bayar</p>
                                <p className="text-2xl font-bold text-red-800">{belumBayar}</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Sudah Lunas */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg mr-4">
                                {/* Icon Check */}
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-green-600">Lunas</p>
                                <p className="text-2xl font-bold text-green-800">{sudahLunas}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TABLE SECTION --- */}
                {tagihan.length === 0 ? (
                    // Empty State
                    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-lg">Belum ada history tagihan air.</p>
                    </div>
                ) : (
                    // Table Data
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meteran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Tagihan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tagihan.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                                            {/* Kolom Periode */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.bulan} / {item.tahun}
                                                </div>
                                            </td>

                                            {/* Kolom Meteran */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">Awal: {item.mtr_bln_lalu}</div>
                                                <div className="text-sm text-gray-500">Akhir: {item.mtr_skrg || '-'}</div>
                                            </td>

                                            {/* Kolom Nominal */}
                                            <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                                                {item.nominal ? formatRupiah(item.nominal) : '-'}
                                            </td>

                                            {/* Kolom Status Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full 
                                                    ${item.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                      item.status === 'declined' ? 'bg-red-100 text-red-800' : 
                                                      'bg-gray-100 text-gray-800'}`}>
                                                    {item.status === 'ditagihkan' ? 'BELUM BAYAR' : item.status.toUpperCase()}
                                                </span>
                                            </td>

                                            {/* Kolom Aksi Button */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {item.status === 'ditagihkan' || item.status === 'declined' ? (
                                                    <Link 
                                                        href={route('tagihan.warga.show', item.id)}
                                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition duration-200 shadow-sm"
                                                    >
                                                        Bayar
                                                    </Link>
                                                ) : item.status === 'pending' ? (
                                                    <span className="text-yellow-600 italic">Menunggu Verifikasi</span>
                                                ) : item.status === 'approved' ? (
                                                    <span className="text-green-600 font-bold flex items-center">
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        Lunas
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Detail</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
import React from 'react';
// UBAH DARI @ JADI ../.. AGAR AMAN
import AuthenticatedLayout from '../../Layouts/AppLayout'; 
import { Head, Link } from '@inertiajs/react';

export default function IndexWarga({ auth, tagihan }) {
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number || 0);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Riwayat Tagihan Air</h2>}
        >
            <Head title="Tagihan Air" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {tagihan.length === 0 ? (
                            <p className="text-center text-gray-500">Belum ada tagihan air.</p>
                        ) : (
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
                                            <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.bulan} / {item.tahun}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">Awal: {item.mtr_bln_lalu}</div>
                                                    <div className="text-sm text-gray-500">Akhir: {item.mtr_skrg || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-700">
                                                    {item.nominal ? formatRupiah(item.nominal) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                        ${item.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                          item.status === 'declined' ? 'bg-red-100 text-red-800' : 
                                                          'bg-gray-100 text-gray-800'}`}>
                                                        {item.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {item.status === 'ditagihkan' || item.status === 'declined' ? (
                                                        <Link 
                                                            href={route('tagihan.warga.show', item.id)}
                                                            className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
                                                        >
                                                            Bayar
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400 cursor-not-allowed">Detail</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
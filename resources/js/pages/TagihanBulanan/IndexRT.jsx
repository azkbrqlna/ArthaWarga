import React from 'react';
// UBAH DARI @ JADI ../.. AGAR AMAN
import AuthenticatedLayout from '../../Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';

export default function IndexRT({ auth, tagihan }) {
    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);

    const handleGenerate = () => {
        if (confirm('Apakah Anda yakin ingin membuat tagihan otomatis untuk bulan ini?')) {
            router.post(route('tagihan.generate'));
        }
    };

    const handleApprove = (id) => {
        if (confirm('Verifikasi pembayaran ini valid?')) {
            router.patch(route('tagihan.approve', id));
        }
    };

    const handleDecline = (id) => {
        if (confirm('Tolak pembayaran ini?')) {
            router.patch(route('tagihan.decline', id));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Manajemen Tagihan Air (RT)</h2>}>
            <Head title="Manajemen Tagihan" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-6 flex justify-end">
                        <button 
                            onClick={handleGenerate}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                            Generate Tagihan Bulan Ini
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Warga</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Periode</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Meteran</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nominal</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Bukti</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {tagihan.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4">
                                                <div className="font-medium text-gray-900">{item.user?.nm_lengkap}</div>
                                                <div className="text-xs text-gray-500">{item.user?.alamat}</div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {item.bulan} / {item.tahun}
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                <div>Lalu: {item.mtr_bln_lalu}</div>
                                                <div className={item.mtr_skrg ? "font-bold" : "text-gray-400"}>
                                                    Skrg: {item.mtr_skrg || '?'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 font-bold text-gray-700">
                                                {item.nominal ? formatRupiah(item.nominal) : '-'}
                                                {item.harga_sampah > 0 && (
                                                    <span className="block text-xs text-green-600 font-normal">+Sampah</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {item.bkt_byr ? (
                                                    <a href={`/storage/${item.bkt_byr}`} target="_blank" className="text-blue-600 hover:underline text-xs">
                                                        Lihat Bukti
                                                    </a>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                                    ${item.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                      item.status === 'declined' ? 'bg-red-100 text-red-800' : 
                                                      'bg-gray-100 text-gray-600'}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap">
                                                {item.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleApprove(item.id)}
                                                            className="text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs"
                                                            title="Setujui"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDecline(item.id)}
                                                            className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                                                            title="Tolak"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
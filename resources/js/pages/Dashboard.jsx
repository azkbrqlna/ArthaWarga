import React from 'react';
import { Head } from '@inertiajs/react';

export default function Dashboard({ totalKK, totalBOP, totalIuran, totalKeseluruhan, transaksiTerakhir }) {
    return (
        <>
            <Head title="Dashboard" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Total KK</p>
                        <h2 className="text-xl font-bold">{totalKK}</h2>
                    </div>
                    <div className="p-4 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Dana BOP Sekarang</p>
                        <h2 className="text-xl font-bold">Rp {totalBOP.toLocaleString()}</h2>
                    </div>
                    <div className="p-4 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Dana Iuran Sekarang</p>
                        <h2 className="text-xl font-bold">Rp {totalIuran.toLocaleString()}</h2>
                    </div>
                    <div className="p-4 bg-white shadow rounded-xl">
                        <p className="text-sm text-gray-500">Total Keseluruhan</p>
                        <h2 className="text-xl font-bold">Rp {totalKeseluruhan.toLocaleString()}</h2>
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-3">Terakhir Diedit</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 text-left">Tanggal Transaksi</th>
                            <th className="p-2 text-left">Kategori</th>
                            <th className="p-2 text-left">Jumlah</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Perubahan Oleh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transaksiTerakhir.map((trx, i) => (
                            <tr key={i} className="border-b">
                                <td className="p-2">{new Date(trx.created_at).toLocaleDateString()}</td>
                                <td className="p-2">{trx.kategori}</td>
                                <td className="p-2">Rp {trx.jumlah.toLocaleString()}</td>
                                <td className="p-2">{trx.status}</td>
                                <td className="p-2">{trx.diedit_oleh}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
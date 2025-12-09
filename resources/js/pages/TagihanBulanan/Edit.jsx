import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function Edit({ auth, tagihan, wargaList, masterHarga }) {
    
    // Init form dengan data existing
    const { data, setData, put, processing, errors } = useForm({
        usr_id: tagihan.usr_id,
        bulan: tagihan.bulan,
        tahun: tagihan.tahun,
        mtr_bln_lalu: tagihan.mtr_bln_lalu,
        mtr_skrg: tagihan.mtr_skrg,
        pakai_sampah: tagihan.harga_sampah > 0, 
    });

    const [estimasi, setEstimasi] = useState(tagihan.nominal);

    useEffect(() => {
        const mtrLalu = parseInt(data.mtr_bln_lalu) || 0;
        const mtrSkrg = parseInt(data.mtr_skrg) || 0;
        const pemakaian = Math.max(0, mtrSkrg - mtrLalu);

        // --- PERBAIKAN: Gunakan Optional Chaining (?.) agar tidak crash jika masterHarga null ---
        // Jika masterHarga tidak ada, kita fallback ke 0
        const hargaMeteran = masterHarga?.harga_meteran || 0;
        const hargaAbonemen = masterHarga?.abonemen || 0;
        const hargaJimpitan = masterHarga?.jimpitan_air || 0;
        const hargaSampahMaster = masterHarga?.harga_sampah || 0;

        const biayaAir = pemakaian * hargaMeteran;
        const biayaSampah = data.pakai_sampah ? hargaSampahMaster : 0;

        setEstimasi(biayaAir + hargaAbonemen + hargaJimpitan + biayaSampah);

    }, [data.mtr_bln_lalu, data.mtr_skrg, data.pakai_sampah, masterHarga]); // Tambahkan masterHarga ke dependency

    const submit = (e) => {
        e.preventDefault();
        put(route('tagihan.update', tagihan.id));
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
        <AppLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Edit Tagihan</h2>}>
            <Head title="Edit Tagihan" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* ALERT jika Master Harga belum disetting */}
                        {!masterHarga && (
                            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                                <strong className="font-bold">Peringatan! </strong>
                                <span className="block sm:inline">Master Harga "Air" belum ditemukan. Perhitungan otomatis mungkin salah.</span>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Warga */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Warga</label>
                                <select 
                                    className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm cursor-not-allowed"
                                    value={data.usr_id}
                                    onChange={e => setData('usr_id', e.target.value)}
                                    disabled 
                                >
                                    {wargaList.map(w => (
                                        <option key={w.id} value={w.id}>{w.nm_lengkap} ({w.alamat})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Periode */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bulan</label>
                                    <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" 
                                        value={data.bulan} onChange={e => setData('bulan', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tahun</label>
                                    <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" 
                                        value={data.tahun} onChange={e => setData('tahun', e.target.value)} required />
                                </div>
                            </div>

                            {/* Meteran */}
                            <div className="grid grid-cols-2 gap-4 bg-yellow-50 p-4 rounded-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meteran Lalu</label>
                                    <input 
                                        type="number" 
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white" 
                                        value={data.mtr_bln_lalu} 
                                        onChange={e => setData('mtr_bln_lalu', e.target.value)} 
                                        required 
                                    />
                                    <span className="text-xs text-gray-500">*Edit jika perlu koreksi</span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meteran Sekarang</label>
                                    <input 
                                        type="number" 
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                                        value={data.mtr_skrg} 
                                        onChange={e => setData('mtr_skrg', e.target.value)} 
                                        min={data.mtr_bln_lalu}
                                        required 
                                    />
                                </div>
                            </div>

                            {/* Sampah Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tagihan Sampah?</label>
                                <div className="flex items-center gap-4">
                                    <label className="inline-flex items-center">
                                        <input type="radio" className="form-radio text-blue-600"
                                            checked={data.pakai_sampah === true} onChange={() => setData('pakai_sampah', true)} />
                                        <span className="ml-2">Ya</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input type="radio" className="form-radio text-red-600"
                                            checked={data.pakai_sampah === false} onChange={() => setData('pakai_sampah', false)} />
                                        <span className="ml-2">Tidak</span>
                                    </label>
                                </div>
                            </div>

                            {/* Total & Action */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold text-gray-700">Total Baru:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatRupiah(estimasi)}</span>
                                </div>
                                
                                <div className="flex gap-3">
                                    {/* --- PERBAIKAN: Route name disesuaikan dengan web.php ('tagihan.rt.index') --- */}
                                    <Link href={route('tagihan.rt.index')} className="w-1/3 text-center bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition">
                                        Batal
                                    </Link>
                                    
                                    <button type="submit" disabled={processing} className="w-2/3 bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50">
                                        Update Tagihan
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
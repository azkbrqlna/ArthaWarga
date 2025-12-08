import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout'; // Sesuaikan path layout
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, wargaList, masterHarga }) {
    // Default Value Bulan & Tahun (Saat ini)
    const today = new Date();
    
    const { data, setData, post, processing, errors } = useForm({
        usr_id: '',
        bulan: today.getMonth() + 1, // 1-12
        tahun: today.getFullYear(),
        mtr_bln_lalu: 0,
        mtr_skrg: '',
        pakai_sampah: false, // Default Tidak
    });

    const [estimasi, setEstimasi] = useState(0);

    // 1. LOGIC AUTOFILL: Saat Warga Dipilih
    const handleUserChange = (e) => {
        const selectedId = e.target.value;
        
        // Cari data warga di array props
        const selectedWarga = wargaList.find(w => w.id == selectedId);
        
        if (selectedWarga) {
            setData(prev => ({
                ...prev,
                usr_id: selectedId,
                mtr_bln_lalu: selectedWarga.last_meter, // Autofill Meteran Terakhir
                mtr_skrg: '' // Reset input meteran sekarang
            }));
        } else {
            setData('usr_id', '');
        }
    };

    // 2. LOGIC PREVIEW HARGA (Frontend Only)
    useEffect(() => {
        const mtrLalu = parseInt(data.mtr_bln_lalu) || 0;
        const mtrSkrg = parseInt(data.mtr_skrg) || 0;
        const pemakaian = Math.max(0, mtrSkrg - mtrLalu);

        const biayaAir = pemakaian * (masterHarga.harga_meteran || 0);
        const biayaAbonemen = masterHarga.abonemen || 0;
        const biayaJimpitan = masterHarga.jimpitan_air || 0;
        const biayaSampah = data.pakai_sampah ? (masterHarga.harga_sampah || 0) : 0;

        setEstimasi(biayaAir + biayaAbonemen + biayaJimpitan + biayaSampah);

    }, [data.mtr_bln_lalu, data.mtr_skrg, data.pakai_sampah]);

    const submit = (e) => {
        e.preventDefault();
        post(route('tagihan.store')); // Pastikan route ini ada
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
        <AppLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Tambah Tagihan Manual</h2>}>
            <Head title="Buat Tagihan" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <form onSubmit={submit} className="space-y-6">
                            
                            {/* Pilihan Warga */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pilih Warga</label>
                                <select 
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    value={data.usr_id}
                                    onChange={handleUserChange}
                                    required
                                >
                                    <option value="">-- Pilih Warga --</option>
                                    {wargaList.map(w => (
                                        <option key={w.id} value={w.id}>
                                            {w.nm_lengkap} ({w.alamat})
                                        </option>
                                    ))}
                                </select>
                                {errors.usr_id && <p className="text-red-500 text-xs mt-1">{errors.usr_id}</p>}
                            </div>

                            {/* Bulan & Tahun */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bulan</label>
                                    <input 
                                        type="number" min="1" max="12"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                        value={data.bulan}
                                        onChange={e => setData('bulan', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tahun</label>
                                    <input 
                                        type="number"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                        value={data.tahun}
                                        onChange={e => setData('tahun', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Meteran */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Meteran Lalu (Otomatis)</label>
                                    <input 
                                        type="number"
                                        className="mt-1 block w-full bg-gray-200 border-gray-300 rounded-md shadow-sm text-gray-500 cursor-not-allowed"
                                        value={data.mtr_bln_lalu}
                                        readOnly // Admin sebaiknya tidak ubah ini manual kecuali terpaksa (bisa dihapus readonly nya kalo mau)
                                    />
                                    <span className="text-xs text-gray-500">*Dari tagihan terakhir</span>
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
                                    {errors.mtr_skrg && <p className="text-red-500 text-xs mt-1">{errors.mtr_skrg}</p>}
                                </div>
                            </div>

                            {/* Dropdown Sampah */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tagihan Sampah?</label>
                                <div className="flex items-center gap-4">
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            className="form-radio text-blue-600"
                                            name="pakai_sampah"
                                            checked={data.pakai_sampah === true}
                                            onChange={() => setData('pakai_sampah', true)}
                                        />
                                        <span className="ml-2">Ya (+ {formatRupiah(masterHarga.harga_sampah)})</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input 
                                            type="radio" 
                                            className="form-radio text-red-600"
                                            name="pakai_sampah"
                                            checked={data.pakai_sampah === false}
                                            onChange={() => setData('pakai_sampah', false)}
                                        />
                                        <span className="ml-2">Tidak</span>
                                    </label>
                                </div>
                            </div>

                            {/* Total Estimasi & Submit */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold text-gray-700">Total Tagihan:</span>
                                    <span className="text-2xl font-bold text-green-600">{formatRupiah(estimasi)}</span>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={processing || !data.usr_id} 
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Tagihan'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
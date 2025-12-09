import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Breadcrumbs from '@/Components/Breadcrumbs'; // Pastikan path ini sesuai dengan lokasi file Breadcrumbs.jsx Anda

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

        // Pemakaian (cegah minus)
        const pemakaian = Math.max(0, mtrSkrg - mtrLalu);

        const biayaAir = pemakaian * (masterHarga.harga_meteran || 0);
        const biayaAbonemen = masterHarga.abonemen || 0;
        const biayaJimpitan = masterHarga.jimpitan_air || 0;
        const biayaSampah = data.pakai_sampah ? (masterHarga.harga_sampah || 0) : 0;

        setEstimasi(biayaAir + biayaAbonemen + biayaJimpitan + biayaSampah);

    }, [data.mtr_bln_lalu, data.mtr_skrg, data.pakai_sampah]);

    const submit = (e) => {
        e.preventDefault();
        post(route('tagihan.store'));
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    // Data untuk Breadcrumbs
    const breadcrumbItems = [
        { label: 'Dashboard', href: '/dashboard' }, // Sesuaikan route dashboard
        { label: 'Tambah Tagihan', href: null } // Halaman aktif (href null)
    ];

    return (
        <AppLayout user={auth.user}>
            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                <h1 className="text-3xl font-bold mb-10">TAMBAH KEGIATAN</h1>
                    <Breadcrumbs items={breadcrumbItems} />

                {/* 3. Form (Tanpa Box Wrapper / Shadow) */}
                <form onSubmit={submit} className="space-y-6">

                    {/* ROW 1: Pilih Warga */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nama Warga <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700 bg-white"
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

                    {/* ROW 2: Bulan & Tahun (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Bulan Tagihan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number" min="1" max="12"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                                placeholder="Contoh: 12"
                                value={data.bulan}
                                onChange={e => setData('bulan', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Tahun Tagihan <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                                placeholder="Contoh: 2025"
                                value={data.tahun}
                                onChange={e => setData('tahun', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* ROW 3: Meteran (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Meteran Bulan Lalu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                                value={data.mtr_bln_lalu}
                                onChange={e => setData('mtr_bln_lalu', e.target.value)}
                                min="0"
                                required
                            />
                            <span className="text-xs text-gray-400 mt-1 block">Otomatis terisi dari data terakhir</span>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Meteran Sekarang <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
                                placeholder="Masukkan angka meteran..."
                                value={data.mtr_skrg}
                                onChange={e => setData('mtr_skrg', e.target.value)}
                                min={data.mtr_bln_lalu}
                                required
                            />
                            {errors.mtr_skrg && <p className="text-red-500 text-xs mt-1">{errors.mtr_skrg}</p>}
                        </div>
                    </div>

                    {/* ROW 4: Kategori Sampah */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Tagihan Sampah <span className="text-red-500">*</span>
                        </label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700 bg-white"
                            value={data.pakai_sampah ? '1' : '0'}
                            onChange={(e) => setData('pakai_sampah', e.target.value === '1')}
                        >
                            <option value="0">Tidak Menggunakan Sampah</option>
                            <option value="1">Ya (+ {formatRupiah(masterHarga.harga_sampah)})</option>
                        </select>
                    </div>

                    <hr className="border-dashed border-gray-300" />

                    {/* FOOTER: Total & Tombol Aksi */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
                        
                        {/* Kiri: Total Estimasi */}
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-bold">Total Estimasi:</span>
                            <span className="text-2xl font-bold text-green-600">{formatRupiah(estimasi)}</span>
                        </div>

                        {/* Kanan: Tombol Batal & Simpan */}
                        <div className="flex gap-3 w-full md:w-auto">
                            <Link
                                href={route('dashboard')}
                                className="px-6 py-2.5 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition text-center w-full md:w-auto"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing || !data.usr_id}
                                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 text-center w-full md:w-auto disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Tagihan'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
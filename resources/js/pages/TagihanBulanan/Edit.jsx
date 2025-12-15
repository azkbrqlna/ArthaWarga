import React from 'react'; // Hapus useState/useEffect yang tidak perlu
import AppLayout from '../../Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Breadcrumbs from '@/Components/Breadcrumbs';

export default function Edit({ auth, tagihan, wargaList, masterHarga }) {
    
    const { data, setData, put, processing, errors } = useForm({
        usr_id: tagihan.usr_id,
        bulan: tagihan.bulan,
        tahun: tagihan.tahun,
        mtr_bln_lalu: tagihan.mtr_bln_lalu,
        mtr_skrg: tagihan.mtr_skrg,
        pakai_sampah: tagihan.harga_sampah > 0,
    });

    // =========================================================================
    // LOGIC HITUNG CEPAT (Tanpa useEffect)
    // =========================================================================
    
    // 1. Parse Input User (Pastikan tidak NaN)
    const mtrLalu = data.mtr_bln_lalu === '' ? 0 : parseInt(data.mtr_bln_lalu);
    const mtrSkrg = data.mtr_skrg === '' ? 0 : parseInt(data.mtr_skrg);
    
    // 2. Ambil Harga Master (Pastikan tidak undefined/null)
    const h_meter    = Number(masterHarga?.harga_meteran || 0);
    const h_abonemen = Number(masterHarga?.abonemen || 0);
    const h_jimpitan = Number(masterHarga?.jimpitan_air || 0);
    const h_sampah   = Number(masterHarga?.harga_sampah || 0);

    // 3. Kalkulasi
    const pemakaian = Math.max(0, mtrSkrg - mtrLalu);
    const biayaAir = pemakaian * h_meter;
    const biayaSampahTotal = data.pakai_sampah ? h_sampah : 0;

    // HASIL AKHIR (Otomatis update saat user ngetik)
    const estimasi = biayaAir + h_abonemen + h_jimpitan + biayaSampahTotal;
    
    // =========================================================================

    const submit = (e) => {
        e.preventDefault();
        put(route('tagihan.update', tagihan.id));
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);

    const breadcrumbItems = [
        { label: 'Tagihan Bulanan', href: route('tagihan.rt.index') },
        { label: 'Edit Tagihan', href: null }
    ];

    return (
        <AppLayout user={auth.user}>
            <Head title="Edit Tagihan" />

            <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
                
                <h1 className="text-3xl font-bold mb-10">EDIT TAGIHAN</h1>
                <Breadcrumbs items={breadcrumbItems} />

                {/* Debugging: Cek apakah harga masuk */}
                {!masterHarga && (
                    <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
                        Error: Data Master Harga Air tidak terbaca dari Database!
                    </div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    
                    {/* Input Warga (Disabled) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Warga</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-500 cursor-not-allowed"
                            value={data.usr_id}
                            disabled 
                        >
                            {wargaList.map(w => (
                                <option key={w.id} value={w.id}>{w.nm_lengkap} ({w.alamat})</option>
                            ))}
                        </select>
                    </div>

                    {/* Bulan & Tahun */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bulan Tagihan</label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 transition"
                                value={data.bulan} onChange={e => setData('bulan', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tahun Tagihan</label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 transition"
                                value={data.tahun} onChange={e => setData('tahun', e.target.value)} required />
                        </div>
                    </div>

                    {/* Meteran */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Meteran Lalu</label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 transition"
                                value={data.mtr_bln_lalu} onChange={e => setData('mtr_bln_lalu', e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Meteran Sekarang</label>
                            <input type="number" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 transition"
                                value={data.mtr_skrg} onChange={e => setData('mtr_skrg', e.target.value)} min={data.mtr_bln_lalu} required />
                        </div>
                    </div>

                    {/* Sampah */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Tagihan Sampah</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 transition bg-white"
                            value={data.pakai_sampah ? '1' : '0'}
                            onChange={(e) => setData('pakai_sampah', e.target.value === '1')}
                        >
                            <option value="0">Tidak Menggunakan Sampah</option>
                            <option value="1">Ya (+ {formatRupiah(h_sampah)})</option>
                        </select>
                    </div>

                    <hr className="border-dashed border-gray-300" />

                    {/* Footer Total */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-bold">Total Baru:</span>
                            <span className="text-2xl font-bold text-green-600">{formatRupiah(estimasi)}</span>
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                            <Link href={route('tagihan.rt.index')} className="px-6 py-2.5 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition text-center w-full md:w-auto">
                                Batal
                            </Link>
                            <button type="submit" disabled={processing} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg text-center w-full md:w-auto disabled:opacity-50">
                                {processing ? 'Menyimpan...' : 'Update Tagihan'}
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
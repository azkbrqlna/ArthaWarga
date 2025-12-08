import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ShowWarga({ auth, tagihan }) {
    // Masukkan mtr_bln_lalu ke useForm agar bisa diedit
    const { data, setData, post, processing, errors } = useForm({
        id: tagihan.id,
        mtr_bln_lalu: tagihan.mtr_bln_lalu || 0, // Default 0 jika null
        mtr_skrg: tagihan.mtr_skrg || '',
        bayar_sampah: false,
        bkt_byr: null,
    });

    const [estimasi, setEstimasi] = useState(0);

    const hargaMeteran = tagihan.harga_meteran ?? tagihan.kategori?.harga_meteran ?? 0;
    const abonemen = tagihan.abonemen ?? tagihan.kategori?.abonemen ?? 0;
    const jimpitan = tagihan.jimpitan_air ?? tagihan.kategori?.jimpitan_air ?? 0;
    const hargaSampah = tagihan.kategori?.harga_sampah ?? 0;

    // Kalkulator Real-time (Merespon perubahan Lalu & Sekarang)
    useEffect(() => {
        const meteranSekarang = parseInt(data.mtr_skrg) || 0;
        const meteranLalu = parseInt(data.mtr_bln_lalu) || 0;
        
        // Pemakaian tidak boleh minus
        const pemakaian = Math.max(0, meteranSekarang - meteranLalu);
        
        let total = (pemakaian * hargaMeteran) + abonemen + jimpitan;
        
        if (data.bayar_sampah) {
            total += hargaSampah;
        }

        setEstimasi(total);
    }, [data.mtr_skrg, data.mtr_bln_lalu, data.bayar_sampah]);

    const submit = (e) => {
        e.preventDefault();
        post(route('tagihan.bayar'), {
            forceFormData: true, 
        });
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

    return (
        <AppLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Pembayaran Tagihan Air</h2>}>
            <Head title="Bayar Tagihan" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-bold text-blue-800 mb-2">Periode: {tagihan.bulan} / {tagihan.tahun}</h3>
                            <div className="text-sm grid grid-cols-2 gap-2">
                                <div>Harga /m³: {formatRupiah(hargaMeteran)}</div>
                                <div>Abonemen: {formatRupiah(abonemen)}</div>
                                <div>Jimpitan Wajib: {formatRupiah(jimpitan)}</div>
                            </div>
                        </div>

                        <form onSubmit={submit} encType="multipart/form-data">
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Input Meteran Bulan Lalu (Bisa Diedit) */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Meteran Awal</label>
                                    <input 
                                        type="number" 
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-yellow-50"
                                        value={data.mtr_bln_lalu}
                                        onChange={e => setData('mtr_bln_lalu', e.target.value)}
                                        min="0"
                                        required
                                    />
                                    {errors.mtr_bln_lalu && <p className="text-red-500 text-xs mt-1">{errors.mtr_bln_lalu}</p>}
                                    <p className="text-xs text-gray-500 mt-1">*Sesuaikan jika ini pemakaian pertama</p>
                                </div>

                                {/* Input Meteran Bulan Ini */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Meteran Akhir</label>
                                    <input 
                                        type="number" 
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.mtr_skrg}
                                        onChange={e => setData('mtr_skrg', e.target.value)}
                                        min={data.mtr_bln_lalu}
                                        placeholder="Isi angka meteran"
                                        required
                                    />
                                    {errors.mtr_skrg && <p className="text-red-500 text-xs mt-1">{errors.mtr_skrg}</p>}
                                </div>
                            </div>

                            {/* Info Pemakaian */}
                            <div className="mb-4 text-center p-2 bg-gray-50 rounded">
                                <span className="text-gray-600 text-sm">Total Pemakaian Air: </span>
                                <span className="font-bold text-gray-800">
                                    {Math.max(0, (parseInt(data.mtr_skrg)||0) - (parseInt(data.mtr_bln_lalu)||0))} m³
                                </span>
                            </div>

                            <div className="mb-4">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        checked={data.bayar_sampah}
                                        onChange={e => setData('bayar_sampah', e.target.checked)}
                                    />
                                    <span className="ml-2 text-gray-700">
                                        Bayar Iuran Sampah juga? (+ {formatRupiah(hargaSampah)})
                                    </span>
                                </label>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Bukti Transfer</label>
                                <input 
                                    type="file" 
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={e => setData('bkt_byr', e.target.files[0])}
                                    accept="image/*,application/pdf"
                                    required
                                />
                                {errors.bkt_byr && <p className="text-red-500 text-xs mt-1">{errors.bkt_byr}</p>}
                            </div>

                            <div className="bg-gray-100 p-4 rounded-lg mb-6 flex justify-between items-center">
                                <span className="font-semibold text-gray-600">Total Tagihan:</span>
                                <span className="text-2xl font-bold text-green-600">{formatRupiah(estimasi)}</span>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href={route('tagihan.warga.index')} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
                                    Batal
                                </Link>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Mengirim...' : 'Kirim Pembayaran'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
import React from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';

export default function ShowWarga({ auth, tagihan }) {
    const { data, setData, post, processing, errors } = useForm({
        id: tagihan.id,
        bkt_byr: null,
    });

    const submit = (e) => {
        e.preventDefault();
        // Route ini mengarah ke function upload_bukti di controller
        post(route('tagihan.upload'), { 
            forceFormData: true, 
        });
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    return (
        <AppLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Detail Pembayaran</h2>}>
            <Head title="Upload Bukti Bayar" />

            <div className="py-12">
                <div className="max-w-xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* Rincian Tagihan (Read Only) */}
                        <div className="mb-6 border-b pb-4">
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Rincian Tagihan</h3>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Periode</span>
                                    <span className="font-semibold">{tagihan.bulan} / {tagihan.tahun}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Meteran Air</span>
                                    <span>{tagihan.mtr_bln_lalu} ⮕ {tagihan.mtr_skrg}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pemakaian</span>
                                    <span className="font-semibold">{tagihan.mtr_skrg - tagihan.mtr_bln_lalu} m³</span>
                                </div>
                                
                                <div className="border-t border-dashed my-2"></div>

                                {/* Breakdown Harga */}
                                <div className="flex justify-between text-gray-500">
                                    <span>Biaya Air</span>
                                    <span>{formatRupiah((tagihan.mtr_skrg - tagihan.mtr_bln_lalu) * tagihan.harga_meteran)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Abonemen</span>
                                    <span>{formatRupiah(tagihan.abonemen)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Jimpitan</span>
                                    <span>{formatRupiah(tagihan.jimpitan_air)}</span>
                                </div>
                                {tagihan.harga_sampah > 0 && (
                                    <div className="flex justify-between text-gray-500">
                                        <span>Iuran Sampah</span>
                                        <span>{formatRupiah(tagihan.harga_sampah)}</span>
                                    </div>
                                )}
                                
                                <div className="border-t border-gray-300 my-2"></div>
                                
                                <div className="flex justify-between text-lg font-bold text-blue-600">
                                    <span>TOTAL</span>
                                    <span>{formatRupiah(tagihan.nominal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Upload */}
                        <form onSubmit={submit}>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Upload Bukti Transfer</label>
                                <input 
                                    type="file" 
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={e => setData('bkt_byr', e.target.files[0])}
                                    accept="image/*,application/pdf"
                                    required
                                />
                                {errors.bkt_byr && <p className="text-red-500 text-xs mt-1">{errors.bkt_byr}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href={route('tagihan.warga.index')} className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400">
                                    Kembali
                                </Link>
                                <button 
                                    type="submit" 
                                    disabled={processing} 
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Uploading...' : 'Kirim Bukti'}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
import React, { useState, useEffect } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, useForm, router } from '@inertiajs/react';

// Komponen Modal Sederhana (Bisa diganti dengan Modal bawaan template kamu jika ada)
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function HargaIuranIndex({ auth, kategoriIurans }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);

    // Setup Form Inertia
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        harga_meteran: '',
        abonemen: '',
        harga_sampah: '',
        jimpitan_air: '',
    });

    // Helper Format Rupiah
    const formatRupiah = (number) => {
        if (number === null || number === undefined) return '-';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // Buka Modal Edit
    const handleEdit = (item) => {
        setEditItem(item);
        setData({
            harga_meteran: item.harga_meteran ?? '',
            abonemen: item.abonemen ?? '',
            harga_sampah: item.harga_sampah ?? '',
            jimpitan_air: item.jimpitan_air ?? '',
        });
        clearErrors();
        setIsModalOpen(true);
    };

    // Tutup Modal
    const closeModal = () => {
        setIsModalOpen(false);
        setEditItem(null);
        reset();
    };

    // Submit Form
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Pastikan route ini sesuai dengan routes/web.php kamu
        // Route::put('/harga-iuran/{harga_iuran}', ...)
        put(route('harga_iuran.update', editItem.id), {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <AppLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800">Master Harga Iuran</h2>}>
            <Head title="Pengaturan Harga" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Info Card */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    Halaman ini digunakan untuk mengatur tarif dasar (Meteran, Abonemen, Sampah, dll) yang akan digunakan saat pembuatan tagihan bulanan otomatis.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori Iuran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Air /m³</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonemen</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sampah</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jimpitan</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {kategoriIurans.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Data konfigurasi harga belum tersedia.</td>
                                        </tr>
                                    ) : (
                                        kategoriIurans.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {item.kategori?.nm_kat || 'Tanpa Nama'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatRupiah(item.harga_meteran)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatRupiah(item.abonemen)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatRupiah(item.harga_sampah)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    {formatRupiah(item.jimpitan_air)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="inline-flex items-center px-3 py-1 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring ring-indigo-300 disabled:opacity-25 transition ease-in-out duration-150"
                                                    >
                                                        Edit Tarif
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL EDIT HARGA */}
            <Modal show={isModalOpen} onClose={closeModal} title={`Edit Harga: ${editItem?.kategori?.nm_kat || ''}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Input Harga Meteran */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Harga Meteran Air (per m³)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">Rp</span>
                            </div>
                            <input
                                type="number"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                value={data.harga_meteran}
                                onChange={e => setData('harga_meteran', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        {errors.harga_meteran && <p className="text-red-500 text-xs mt-1">{errors.harga_meteran}</p>}
                    </div>

                    {/* Input Abonemen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Biaya Abonemen (Tetap)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">Rp</span>
                            </div>
                            <input
                                type="number"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                value={data.abonemen}
                                onChange={e => setData('abonemen', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        {errors.abonemen && <p className="text-red-500 text-xs mt-1">{errors.abonemen}</p>}
                    </div>

                    {/* Input Harga Sampah */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Iuran Sampah</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">Rp</span>
                            </div>
                            <input
                                type="number"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                value={data.harga_sampah}
                                onChange={e => setData('harga_sampah', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        {errors.harga_sampah && <p className="text-red-500 text-xs mt-1">{errors.harga_sampah}</p>}
                    </div>

                    {/* Input Jimpitan */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Jimpitan Air (Maks 100 jika persen, atau nominal)
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">Rp</span>
                            </div>
                            <input
                                type="number"
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                value={data.jimpitan_air}
                                onChange={e => setData('jimpitan_air', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        {errors.jimpitan_air && <p className="text-red-500 text-xs mt-1">{errors.jimpitan_air}</p>}
                    </div>

                    <div className="flex justify-end pt-4 gap-2">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
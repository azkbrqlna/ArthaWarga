import React, { useState } from "react";
import { useForm, usePage } from "@inertiajs/react";

export default function Pengeluaran() {
    const { pengeluarans = [], saldo = {}, kegiatans = [] } = usePage().props;
    const { data, setData, post, processing, reset, errors } = useForm({
        tgl: "",
        keg_id: "", // ✅ harus 'keg_id'
        nominal: "",
        ket: "",
        tipe: "bop",
        bkt_nota: null,
    });
    const [preview, setPreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("pengeluaran.store"), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPreview(null);
            },
        });
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold mb-4">Ringkasan Pengeluaran</h1>

            {/* SALDO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 shadow">
                    <h2 className="font-semibold text-lg text-green-800">
                        Saldo BOP
                    </h2>
                    <p className="text-2xl font-bold text-green-900 mt-2">
                        Rp {saldo.bop?.toLocaleString("id-ID") || 0}
                    </p>
                </div>

                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 shadow">
                    <h2 className="font-semibold text-lg text-blue-800">
                        Saldo Iuran
                    </h2>
                    <p className="text-2xl font-bold text-blue-900 mt-2">
                        Rp {saldo.iuran?.toLocaleString("id-ID") || 0}
                    </p>
                </div>
            </div>

            {/* TABEL PENGELUARAN */}
            <div className="bg-white shadow rounded-lg p-4">
                <h2 className="font-semibold text-lg mb-4">
                    Daftar Pengeluaran
                </h2>
                {pengeluarans.length === 0 ? (
                    <p className="text-gray-500">Belum ada data pengeluaran.</p>
                ) : (
                    <table className="w-full border-collapse border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Tanggal</th>
                                <th className="border p-2">Kegiatan</th>
                                <th className="border p-2">Nominal</th>
                                <th className="border p-2">Keterangan</th>
                                <th className="border p-2">Tipe</th>
                                <th className="border p-2">Bukti Nota</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pengeluarans.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border p-2 text-center">
                                        {new Date(item.tgl).toLocaleDateString(
                                            "id-ID"
                                        )}
                                    </td>
                                    <td className="border p-2">
                                        {item.kegiatan?.nm_keg || "-"}
                                    </td>
                                    <td className="border p-2 text-right">
                                        Rp{" "}
                                        {item.nominal?.toLocaleString("id-ID")}
                                    </td>
                                    <td className="border p-2">{item.ket}</td>
                                    <td className="border p-2 text-center uppercase">
                                        {item.tipe}
                                    </td>
                                    <td className="border p-2 text-center">
                                        {item.bkt_nota ? (
                                            <img
                                                src={`/storage/${item.bkt_nota}`}
                                                alt="Bukti Nota"
                                                className="w-16 h-16 object-cover mx-auto rounded border"
                                            />
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* FORM TAMBAH */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Tambah Pengeluaran
                </h2>
                <form
                    onSubmit={handleSubmit}
                    encType="multipart/form-data"
                    className="space-y-4"
                >
                    <div>
                        <label className="block font-medium mb-1">
                            Tanggal
                        </label>
                        <input
                            type="date"
                            value={data.tgl}
                            onChange={(e) => setData("tgl", e.target.value)}
                            className="w-full border rounded p-2"
                        />
                        {errors.tgl && (
                            <div className="text-red-600 text-sm">
                                {errors.tgl}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">
                            Kegiatan
                        </label>
                        <select
                            value={data.keg_id}
                            onChange={(e) => setData("keg_id", e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="">-- Pilih Kegiatan --</option>
                            {kegiatans.map((k) => (
                                <option key={k.id} value={k.id}>
                                    {k.nm_keg}
                                </option>
                            ))}
                        </select>
                        {errors.keg_id && (
                            <div className="text-red-600 text-sm">
                                {errors.keg_id}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">
                            Nominal
                        </label>
                        <input
                            type="number"
                            value={data.nominal}
                            onChange={(e) => setData("nominal", e.target.value)}
                            className="w-full border rounded p-2"
                            placeholder="Contoh: 100000"
                        />
                        {errors.nominal && (
                            <div className="text-red-600 text-sm">
                                {errors.nominal}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">
                            Keterangan
                        </label>
                        <textarea
                            value={data.ket}
                            onChange={(e) => setData("ket", e.target.value)}
                            className="w-full border rounded p-2"
                            placeholder="Keterangan pengeluaran"
                        ></textarea>
                        {errors.ket && (
                            <div className="text-red-600 text-sm">
                                {errors.ket}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block font-medium mb-1">
                            Tipe Dana
                        </label>
                        <select
                            value={data.tipe}
                            onChange={(e) => setData("tipe", e.target.value)}
                            className="w-full border rounded p-2"
                        >
                            <option value="bop">BOP</option>
                            <option value="iuran">Iuran</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">
                            Upload Bukti Nota
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                                setData("bkt_nota", e.target.files[0]);
                                if (e.target.files[0]) {
                                    setPreview(
                                        URL.createObjectURL(e.target.files[0])
                                    );
                                }
                            }}
                            className="w-full border rounded p-2"
                        />
                        {preview && (
                            <img
                                src={preview}
                                alt="Preview"
                                className="mt-2 rounded w-40 border"
                            />
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {processing ? "Menyimpan..." : "Simpan Pengeluaran"}
                    </button>
                </form>
            </div>
        </div>
    );
}

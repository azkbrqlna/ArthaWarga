import React from "react";
// Import Layout baru (pastikan file AppLayout sudah disimpan di folder Layouts)
import AppLayout from "../../Layouts/AppLayout";
import { Head, router } from "@inertiajs/react";

export default function IndexRT({
    auth,
    tagihan,
    totalDitagihkan,
    totalLunas,
}) {
    const formatRupiah = (number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number || 0);

    const handleApprove = (id) => {
        if (confirm("Verifikasi pembayaran ini valid?")) {
            router.patch(route("tagihan.approve", id));
        }
    };

    const handleDecline = (id) => {
        if (confirm("Tolak pembayaran ini?")) {
            router.patch(route("tagihan.decline", id));
        }
    };

    return (
        // Hapus prop 'user' dan 'header' karena AppLayout baru menggunakan usePage() dan tidak ada slot header
        <AppLayout>
            <Head title="Manajemen Tagihan" />

            {/* JUDUL HALAMAN DIPINDAH KE SINI (DALAM CONTENT) */}
            <div className="mb-6">
                <h2 className="font-bold text-2xl text-gray-800">
                    Manajemen Tagihan Air (RT)
                </h2>
                <p className="text-gray-500 text-sm">
                    Monitor pembayaran dan verifikasi bukti transfer warga.
                </p>
            </div>

            {/* AREA SALDO / RINGKASAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Kartu Saldo Ditagihkan */}
                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-xl p-6 border-l-4 border-l-yellow-500">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                        Saldo Ditagihkan (Pending)
                    </div>
                    <div className="mt-2 text-3xl font-bold text-gray-900">
                        {formatRupiah(totalDitagihkan)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Menunggu pembayaran/verifikasi
                    </p>
                </div>

                {/* Kartu Saldo Lunas */}
                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-xl p-6 border-l-4 border-l-green-500">
                    <div className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                        Saldo Lunas
                    </div>
                    <div className="mt-2 text-3xl font-bold text-green-600">
                        {formatRupiah(totalLunas)}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Sudah masuk pembukuan
                    </p>
                </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm border border-gray-200 rounded-xl">
                <div className="p-0 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Warga
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Periode
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Meteran
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Nominal
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Bukti
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-sm">
                            {tagihan.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">
                                            {item.user?.nm_lengkap}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {item.user?.alamat}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                            {item.bulan} / {item.tahun}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                        <div className="text-xs">
                                            Lalu: {item.mtr_bln_lalu}
                                        </div>
                                        <div
                                            className={`text-sm ${
                                                item.mtr_skrg
                                                    ? "font-bold text-gray-800"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            Skrg: {item.mtr_skrg || "?"}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-700">
                                        {item.nominal
                                            ? formatRupiah(item.nominal)
                                            : "-"}
                                        {item.harga_sampah > 0 && (
                                            <span className="block text-[10px] text-green-600 font-normal">
                                                +Sampah
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.bkt_byr ? (
                                            <a
                                                href={`/storage/${item.bkt_byr}`}
                                                target="_blank"
                                                className="text-blue-600 hover:text-blue-800 hover:underline text-xs flex items-center gap-1 font-medium"
                                            >
                                                <svg
                                                    className="w-3 h-3"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    ></path>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    ></path>
                                                </svg>
                                                Lihat
                                            </a>
                                        ) : (
                                            <span className="text-gray-400 text-xs">
                                                -
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-bold border
                                            ${
                                                item.status === "approved"
                                                    ? "bg-green-50 text-green-700 border-green-200"
                                                    : item.status === "pending"
                                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    : item.status === "declined"
                                                    ? "bg-red-50 text-red-700 border-red-200"
                                                    : "bg-gray-50 text-gray-600 border-gray-200"
                                            }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.status === "pending" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleApprove(item.id)
                                                    }
                                                    className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded-md transition shadow-sm"
                                                    title="Setujui Pembayaran"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="3"
                                                            d="M5 13l4 4L19 7"
                                                        ></path>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDecline(item.id)
                                                    }
                                                    className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded-md transition shadow-sm"
                                                    title="Tolak Pembayaran"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="3"
                                                            d="M6 18L18 6M6 6l12 12"
                                                        ></path>
                                                    </svg>
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
        </AppLayout>
    );
}

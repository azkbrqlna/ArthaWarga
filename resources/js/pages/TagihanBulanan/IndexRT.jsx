import React, { useState, useMemo } from "react";
import AppLayout from "../../Layouts/AppLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    ChevronLeft,
    ChevronRight,
    Pencil,
    Trash2,
    Plus,
    Settings,
    RotateCcw,
} from "lucide-react";
import Swal from "sweetalert2";
// Pastikan path ini sesuai dengan lokasi komponen Button Shadcn Anda
import { Button } from "@/components/ui/button";

export default function IndexRT({ auth, tagihan }) {
    // --- 1. SETUP TANGGAL DEFAULT (HARI INI) ---
    const today = new Date();
    today.setMonth(today.getMonth() - 1);
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
    const currentYear = String(today.getFullYear());

    // --- STATE & CONFIG ---
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // --- HELPER FUNCTIONS ---
    const formatRupiah = (number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(number || 0);

    // --- DELETE FUNCTION ---
    const handleDelete = (id, nama) => {
        Swal.fire({
            title: "Apakah Anda yakin?",
            text: `Tagihan milik ${nama} akan dihapus permanen.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route("tagihan.destroy", id));
            }
        });
    };

    const handleReset = () => {
        setSelectedMonth("");
        setSelectedYear("");
    };

    // --- LOGIKA FILTER ---
    const filteredData = useMemo(() => {
        return tagihan.filter((item) => {
            const itemMonth = String(item.bulan).padStart(2, "0");
            const itemYear = String(item.tahun);
            const monthMatch = selectedMonth
                ? itemMonth === selectedMonth
                : true;
            const yearMatch = selectedYear ? itemYear === selectedYear : true;
            return monthMatch && yearMatch;
        });
    }, [tagihan, selectedMonth, selectedYear]);

    // --- LOGIKA KALKULASI TOTAL DINAMIS ---
    const dynamicTotals = useMemo(() => {
        let hitungDitagihkan = 0;
        let hitungLunas = 0;
        let hitungJimpitan = 0;

        filteredData.forEach((item) => {
            const nominal = Number(item.nominal) || 0;
            const jimpitan = Number(item.jimpitan_air) || 0;

            if (["ditagihkan", "pending"].includes(item.status)) {
                hitungDitagihkan += nominal;
            }

            if (item.status === "approved") {
                hitungLunas += nominal;
                hitungJimpitan += jimpitan;
            }
        });

        return {
            ditagihkan: hitungDitagihkan,
            lunas: hitungLunas,
            jimpitan: hitungJimpitan,
        };
    }, [filteredData]);

    // --- LOGIKA PAGINATION ---
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    useMemo(() => {
        setCurrentPage(1);
    }, [selectedMonth, selectedYear]);

    // --- WARNA STATUS ---
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "approved":
                return "bg-emerald-100 text-emerald-800 border border-emerald-200";
            case "pending":
                return "bg-yellow-100 text-yellow-800 border border-yellow-200";
            case "ditagihkan":
                return "bg-red-100 text-red-800 border border-red-200";
            case "declined":
                return "bg-red-200 text-red-900 border border-red-300";
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200";
        }
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Monitoring Tagihan" />

            <div className="py-1">
                <div className="w-full px-1">
                    {/* Header & Buttons */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            MONITORING TAGIHAN BULANAN
                        </h1>
                        <div className="flex gap-3">
                            {/* Tombol Edit Tarif Air */}
                            <Button
                                asChild
                                className="bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm"
                            >
                                <Link href={route("kat_iuran.index")}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Edit Tarif Air
                                </Link>
                            </Button>

                            {/* Tombol Tambah Tagihan */}
                            <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            >
                                <Link href={route("tagihan.create")}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Tagihan
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* --- CARDS SECTION --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Card 1: Saldo Ditagihkan */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                                    <svg
                                        className="w-6 h-6 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Saldo Ditagihkan
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        {formatRupiah(dynamicTotals.ditagihkan)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Saldo Lunas */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                                    <svg
                                        className="w-6 h-6 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Saldo Lunas
                                    </p>
                                    <p className=" font-bold text-gray-800">
                                        {formatRupiah(dynamicTotals.lunas)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Total Jimpitan */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center">
                                <div className="bg-gray-100 p-3 rounded-lg mr-4">
                                    <svg
                                        className="w-6 h-6 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        Total Jimpitan
                                    </p>
                                    <p className="font-bold text-gray-800">
                                        {formatRupiah(dynamicTotals.jimpitan)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                        {/* Filter Bar */}
                        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center justify-end bg-gray-50/50">
                            <span className="text-sm text-gray-600 font-medium mr-1">
                                Filter:
                            </span>
                            <select
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(e.target.value)
                                }
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 h-9"
                            >
                                <option value="">Semua Bulan</option>
                                {[
                                    "01",
                                    "02",
                                    "03",
                                    "04",
                                    "05",
                                    "06",
                                    "07",
                                    "08",
                                    "09",
                                    "10",
                                    "11",
                                    "12",
                                ].map((m, i) => (
                                    <option key={m} value={m}>
                                        {new Date(0, i).toLocaleString(
                                            "id-ID",
                                            { month: "long" }
                                        )}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(e.target.value)
                                }
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 h-9"
                            >
                                <option value="">Semua Tahun</option>
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const year =
                                        new Date().getFullYear() - i + 1;
                                    return (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </select>

                            {(selectedMonth || selectedYear) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 h-9"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </Button>
                            )}
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            No
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Warga
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Periode
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Meteran
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="px-6 py-8 text-center text-gray-500"
                                            >
                                                Tidak ada data.
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <tr
                                                key={item.id}
                                                className="hover:bg-gray-50 transition duration-150"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {(currentPage - 1) *
                                                        itemsPerPage +
                                                        index +
                                                        1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.user?.nm_lengkap}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.user?.alamat}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                                        {item.bulan} /{" "}
                                                        {item.tahun}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-gray-500">
                                                            {item.mtr_bln_lalu}
                                                        </span>
                                                        <span>→</span>
                                                        <span className="font-bold">
                                                            {item.mtr_skrg}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        Pakai:{" "}
                                                        {item.mtr_skrg -
                                                            item.mtr_bln_lalu}{" "}
                                                        m³
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                                    {formatRupiah(item.nominal)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                                                            item.status
                                                        )}`}
                                                    >
                                                        {item.status ===
                                                        "ditagihkan"
                                                            ? "belum bayar"
                                                            : item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    {/* ACTION BUTTONS WITH ICONS */}
                                                    <div className="flex justify-center items-center gap-2">
                                                        {/* Tombol Edit (Icon Only) */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            asChild
                                                            className="h-8 w-8 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50"
                                                        >
                                                            <Link
                                                                href={route(
                                                                    "tagihan.edit",
                                                                    item.id
                                                                )}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Edit
                                                                </span>
                                                            </Link>
                                                        </Button>

                                                        {/* Tombol Hapus (Icon Only) */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.id,
                                                                    item.user
                                                                        ?.nm_lengkap
                                                                )
                                                            }
                                                            className="h-8 w-8 text-red-600 hover:text-red-900 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">
                                                                Hapus
                                                            </span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredData.length > 0 && (
                            <div className="flex justify-end items-center gap-2 px-6 py-4 bg-white border-t border-gray-200">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.max(p - 1, 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                    className="h-8 w-8"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>

                                <span className="text-sm text-gray-600">
                                    Halaman {currentPage} dari {totalPages}
                                </span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                        setCurrentPage((p) =>
                                            Math.min(p + 1, totalPages)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

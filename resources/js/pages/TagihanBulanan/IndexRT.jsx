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
    CircleCheck,
    Wallet,
    Banknote,
    Receipt,
} from "lucide-react";
import Swal from "sweetalert2";

// Import komponen UI Shadcn (pastikan sudah ada di folder components/ui)
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

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

    // --- COMPONENT: INFO CARD (REUSABLE) ---
    const InfoCard = ({
        title,
        value,
        icon: Icon,
        variant = "blue",
        subtitle,
    }) => {
        const themes = {
            blue: {
                bar: "bg-blue-600",
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
            },
            orange: {
                bar: "bg-orange-500",
                iconBg: "bg-orange-50",
                iconColor: "text-orange-500",
            },
            green: {
                bar: "bg-emerald-600",
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
            },
        };

        const theme = themes[variant] || themes.blue;

        return (
            <div className="relative bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-5 h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
                <div
                    className={`absolute left-0 top-0 bottom-0 w-[6px] rounded-l-xl ${theme.bar}`}
                />
                <div className="flex flex-col h-full pl-3">
                    <div
                        className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center mb-4`}
                    >
                        <Icon
                            className={`w-6 h-6 ${theme.iconColor}`}
                            strokeWidth={2}
                        />
                    </div>
                    <div className="mt-auto">
                        <p className="text-gray-500 text-sm font-medium mb-1 tracking-wide">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
                            {value}
                        </h3>
                        {subtitle && (
                            <p className="text-xs text-gray-400 mt-2 font-medium">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AppLayout user={auth.user}>
            <Head title="Monitoring Tagihan" />

            <div className="py-1">
                <div className="w-full px-1">
                    {/* --- HEADER & BUTTONS --- */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pt-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                                Monitoring Tagihan
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Kelola data tagihan air dan iuran warga.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                asChild
                                variant="outline"
                                className="bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white shadow-sm"
                            >
                                <Link href={route("kat_iuran.index")}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Edit Tarif
                                </Link>
                            </Button>
                            <Button
                                asChild
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            >
                                <Link href={route("tagihan.create")}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Buat Tagihan
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* --- CARDS SECTION --- */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                        <InfoCard
                            title="Saldo Ditagihkan"
                            value={formatRupiah(dynamicTotals.ditagihkan)}
                            icon={Receipt}
                            variant="orange"
                            subtitle="Menunggu pembayaran"
                        />
                        <InfoCard
                            title="Saldo Lunas"
                            value={formatRupiah(dynamicTotals.lunas)}
                            icon={CircleCheck}
                            variant="green"
                            subtitle="Pembayaran diterima"
                        />
                        <InfoCard
                            title="Total Jimpitan"
                            value={formatRupiah(dynamicTotals.jimpitan)}
                            icon={Wallet}
                            variant="blue"
                            subtitle="Akumulasi dana jimpitan"
                        />
                    </div>

                    {/* --- TABLE CONTAINER --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-xl border border-gray-200">
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
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 h-9 bg-white"
                            >
                                <option value="">Semua Bulan</option>
                                {[...Array(12)].map((_, i) => (
                                    <option
                                        key={i}
                                        value={String(i + 1).padStart(2, "0")}
                                    >
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
                                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 h-9 bg-white"
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
                                    className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 h-9 rounded-lg"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </Button>
                            )}
                        </div>

                        {/* Table using Shadcn Components */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/80 border-b border-gray-200">
                                        <TableHead className="w-[50px] text-center">
                                            No
                                        </TableHead>
                                        <TableHead>Warga</TableHead>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Meteran Air</TableHead>
                                        <TableHead>Total Tagihan</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-center">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-100">
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan="7"
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <Banknote className="w-8 h-8 text-gray-300 mb-2" />
                                                    <p>
                                                        Tidak ada data tagihan
                                                        ditemukan.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((item, index) => (
                                            <TableRow
                                                key={item.id}
                                                className="hover:bg-gray-50 transition duration-150 border-0"
                                            >
                                                <TableCell className="text-center text-gray-500">
                                                    {(currentPage - 1) *
                                                        itemsPerPage +
                                                        index +
                                                        1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-gray-900">
                                                        {item.user?.nm_lengkap}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {item.user?.alamat}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700">
                                                        {new Date(
                                                            0,
                                                            item.bulan - 1
                                                        ).toLocaleString(
                                                            "id-ID",
                                                            { month: "short" }
                                                        )}{" "}
                                                        {item.tahun}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span className="text-gray-400">
                                                            {item.mtr_bln_lalu}
                                                        </span>
                                                        <ChevronRight className="w-3 h-3 text-gray-300" />
                                                        <span className="font-semibold text-gray-700">
                                                            {item.mtr_skrg}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-blue-600 mt-0.5 font-medium">
                                                        Pakai:{" "}
                                                        {item.mtr_skrg -
                                                            item.mtr_bln_lalu}{" "}
                                                        m³
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-bold text-gray-800">
                                                        {formatRupiah(
                                                            item.nominal
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`
                                                            ${
                                                                item.status ===
                                                                "approved"
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                                    : item.status ===
                                                                          "pending" ||
                                                                      item.status ===
                                                                          "ditagihkan"
                                                                    ? "bg-orange-50 text-orange-700 border-orange-100" // Orange untuk pending
                                                                    : "bg-red-50 text-red-700 border-red-100"
                                                            } border px-2.5 py-0.5 rounded-full font-medium capitalize shadow-none hover:bg-opacity-80
                                                        `}
                                                    >
                                                        {item.status ===
                                                        "ditagihkan"
                                                            ? "Belum Bayar"
                                                            : item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-center items-center gap-1">
                                                        {/* --- TOMBOL EDIT --- */}
                                                        {item.status === "approved" ? (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                disabled
                                                                className="h-8 w-8 text-gray-300 cursor-not-allowed"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                asChild
                                                                className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        "tagihan.edit",
                                                                        item.id
                                                                    )}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        )}

                                                        {/* --- TOMBOL HAPUS --- */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={
                                                                item.status ===
                                                                "approved"
                                                            }
                                                            onClick={() => {
                                                                if (
                                                                    item.status !==
                                                                    "approved"
                                                                ) {
                                                                    handleDelete(
                                                                        item.id,
                                                                        item
                                                                            .user
                                                                            ?.nm_lengkap
                                                                    );
                                                                }
                                                            }}
                                                            className={`h-8 w-8 rounded-lg ${
                                                                item.status ===
                                                                "approved"
                                                                    ? "text-gray-300 cursor-not-allowed"
                                                                    : "text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            }`}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
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

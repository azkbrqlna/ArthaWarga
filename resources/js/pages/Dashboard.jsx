import React, { useState, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    Banknote,
    Calculator,
    Database,
    RotateCcw,
    Plus,
    Wallet,
    TrendingUp,
    TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import FinancialLineChart from "@/components/FinancialLineChart";
import DownloadPdfBtn from "@/components/DownloadPdfBtn";

export default function Dashboard() {
    const {
        transaksi = [],
        auth,
        saldoAwal,
        sisaSaldo,
        totalPengeluaran,
        userTotal,
        sisaIuran,
        sisaBop,
    } = usePage().props;
    const userRole = auth?.user?.role_id;

    // --- STATE CONFIG ---
    const [sortField, setSortField] = useState("tgl");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const itemsPerPage = 8;

    // --- HELPER FUNCTIONS ---
    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    const toggleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleFilterChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);

        router.get(
            route("dashboard"),
            { month, year },
            { preserveScroll: true, preserveState: true }
        );
    };

    // --- LOGIKA FILTER & SORTING ---
    const filteredData = useMemo(() => {
        return transaksi.filter((t) => {
            const d = new Date(t.tgl);
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = String(d.getFullYear());

            let monthMatch = selectedMonth ? month === selectedMonth : true;
            let yearMatch = selectedYear ? year === selectedYear : true;

            return monthMatch && yearMatch;
        });
    }, [transaksi, selectedMonth, selectedYear]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (!valA || !valB) return 0;
            if (typeof valA === "string" && typeof valB === "string") {
                return sortOrder === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            return sortOrder === "asc" ? valA - valB : valB - a[sortField];
        });
    }, [filteredData, sortField, sortOrder]);

    // --- PAGINATION ---
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- CHART DATA ---
    const chartData = useMemo(() => {
        const monthlyData = {};
        filteredData.forEach((t) => {
            const date = new Date(t.tgl);
            const key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;

            if (!monthlyData[key]) {
                monthlyData[key] = {
                    pemasukan: 0,
                    pengeluaran: 0,
                    dateObj: date,
                };
            }

            const nominal =
                t.status === "Pemasukan"
                    ? t.jumlah_sisa - t.jumlah_awal
                    : t.jumlah_digunakan;

            if (t.status === "Pemasukan") {
                monthlyData[key].pemasukan += nominal;
            } else {
                monthlyData[key].pengeluaran += nominal;
            }
        });

        let saldo = 0;
        return Object.keys(monthlyData)
            .sort()
            .map((key) => {
                const d = monthlyData[key];
                saldo += d.pemasukan - d.pengeluaran;
                return {
                    month: d.dateObj.toLocaleString("id-ID", {
                        month: "short",
                        year: "numeric",
                    }),
                    pemasukan: d.pemasukan,
                    pengeluaran: d.pengeluaran,
                    saldo,
                };
            });
    }, [filteredData]);

    // --- COMPONENT: CARD ITEM (FIXED ALIGNMENT) ---
    const InfoCard = ({
        title,
        value,
        subtitle,
        icon: Icon,
        variant = "blue", // default variant
    }) => {
        // Konfigurasi warna berdasarkan variant
        const themes = {
            blue: {
                bar: "bg-blue-600",
                iconBg: "bg-blue-50",
                iconColor: "text-blue-600",
            },
            purple: {
                bar: "bg-purple-600",
                iconBg: "bg-purple-50",
                iconColor: "text-purple-600",
            },
            orange: {
                // Mirip gambar referensi
                bar: "bg-orange-500",
                iconBg: "bg-orange-50",
                iconColor: "text-orange-500",
            },
            green: {
                bar: "bg-emerald-600",
                iconBg: "bg-emerald-50",
                iconColor: "text-emerald-600",
            },
            red: {
                bar: "bg-red-600",
                iconBg: "bg-red-50",
                iconColor: "text-red-600",
            },
            indigo: {
                bar: "bg-indigo-600",
                iconBg: "bg-indigo-50",
                iconColor: "text-indigo-600",
            },
        };

        const theme = themes[variant] || themes.blue;

        return (
            <div className="relative bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-5 h-full overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Vertical Bar (Accent) */}
                <div
                    className={`absolute left-0 top-0 bottom-0 w-[6px] rounded-l-xl ${theme.bar}`}
                />

                <div className="flex flex-col h-full pl-3">
                    {/* Icon Container */}
                    <div
                        className={`w-12 h-12 rounded-2xl ${theme.iconBg} flex items-center justify-center mb-4`}
                    >
                        <Icon
                            className={`w-6 h-6 ${theme.iconColor}`}
                            strokeWidth={2}
                        />
                    </div>

                    {/* Text Content */}
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
            <Head title="Dashboard" />

            <div className="py-1">
                <div className="w-full px-1">
                    {/* --- HEADER & BUTTONS --- */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            DASHBOARD
                        </h1>

                        {/* Action Buttons */}
                        {userRole !== 5 && (
                            <div className="flex gap-3">
                                {(userRole === 2 ||
                                    userRole === 3 ||
                                    userRole === 4) && (
                                    <>
                                        <Button
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                            onClick={() =>
                                                router.visit(
                                                    "/dashboard/pemasukan"
                                                )
                                            }
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Tambah Pemasukan
                                        </Button>
                                        <Button
                                            className="bg-red-600 hover:bg-red-700 text-white shadow-sm"
                                            onClick={() =>
                                                router.visit(
                                                    "/dashboard/pengeluaran"
                                                )
                                            }
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Tambah Pengeluaran
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* --- CARDS GRID --- */}
                    <div
                        className={`grid grid-cols-1 md:grid-cols-2 ${
                            userRole === 1 ? "lg:grid-cols-4" : "lg:grid-cols-3"
                        } gap-5 mb-8 w-full`}
                    >
                        {/* BAGIAN ADMIN (4 KARTU) */}
                        {userRole === 1 && (
                            <>
                                <InfoCard
                                    title="Total Keluarga (KK)"
                                    value={userTotal}
                                    icon={Database}
                                    variant="indigo"
                                    subtitle="Data terdaftar sistem"
                                />
                                <InfoCard
                                    title="Sisa Dana BOP"
                                    value={formatRupiah(sisaBop)}
                                    icon={Wallet}
                                    variant="purple"
                                    subtitle={`BOP: ${formatRupiah(sisaBop)}`} // Style mirip gambar
                                />
                                <InfoCard
                                    title="Sisa Dana Iuran"
                                    value={formatRupiah(sisaIuran)}
                                    icon={Banknote}
                                    variant="orange" // Sesuai warna gambar referensi
                                    subtitle={`Iuran: ${formatRupiah(
                                        sisaIuran
                                    )}`}
                                />
                                <InfoCard
                                    title="Total Saldo Aktif"
                                    value={formatRupiah(sisaSaldo)}
                                    icon={Calculator}
                                    variant="green"
                                    subtitle="Akumulasi seluruh dana"
                                />
                            </>
                        )}

                        {/* BAGIAN USER LAIN (3 KARTU) */}
                        {(userRole === 2 ||
                            userRole === 3 ||
                            userRole === 4 ||
                            userRole === 5) && (
                            <>
                                <InfoCard
                                    title="Total Pemasukan"
                                    value={formatRupiah(saldoAwal)}
                                    icon={TrendingUp}
                                    variant="green"
                                />
                                <InfoCard
                                    title="Total Pengeluaran"
                                    value={formatRupiah(totalPengeluaran)}
                                    icon={TrendingDown}
                                    variant="red"
                                />
                                <InfoCard
                                    title="Saldo Sekarang"
                                    value={formatRupiah(sisaSaldo)}
                                    icon={Wallet}
                                    variant="blue"
                                    subtitle={`Sisa: ${formatRupiah(
                                        sisaSaldo
                                    )}`}
                                />
                            </>
                        )}
                    </div>

                    {/* --- CHART SECTION --- */}
                    <div>
                        <FinancialLineChart data={chartData} />
                    </div>

                    {/* --- TABLE CONTAINER (IndexRT Style) --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 mt-8">
                        {/* Filter Bar */}
                        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 items-center justify-end bg-gray-50/50">
                            <span className="text-sm text-gray-600 font-medium mr-1">
                                Filter:
                            </span>

                            {/* Filter Bulan */}
                            <select
                                value={selectedMonth}
                                onChange={(e) =>
                                    handleFilterChange(
                                        e.target.value,
                                        selectedYear
                                    )
                                }
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 h-9"
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

                            {/* Filter Tahun */}
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    handleFilterChange(
                                        selectedMonth,
                                        e.target.value
                                    )
                                }
                                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500 h-9"
                            >
                                <option value="">Semua Tahun</option>
                                {[...Array(6)].map((_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Reset Button */}
                            {(selectedMonth || selectedYear) && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedMonth("");
                                        setSelectedYear("");
                                        router.get(
                                            route("dashboard"),
                                            {},
                                            {
                                                preserveScroll: true,
                                                preserveState: true,
                                            }
                                        );
                                    }}
                                    className="text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 h-9"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </Button>
                            )}

                            {/* Download PDF */}
                            <DownloadPdfBtn
                                month={selectedMonth}
                                year={selectedYear}
                            />
                        </div>

                        {/* Table Content (Using Shadcn Table inside the container) */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
                                        {[
                                            { key: "tgl", label: "Tanggal" },
                                            {
                                                key: "kategori",
                                                label: "Kategori",
                                            },
                                            {
                                                key: "jumlah_awal",
                                                label: "Saldo Awal",
                                            },
                                            {
                                                key: "jumlah_pemasukan",
                                                label: "Saldo Masuk",
                                            },
                                            {
                                                key: "jumlah_pengeluaran",
                                                label: "Saldo Keluar",
                                            },
                                            {
                                                key: "jumlah_sisa",
                                                label: "Saldo Akhir",
                                            },
                                            { key: "status", label: "Status" },
                                        ].map((col) => (
                                            <TableHead
                                                key={col.key}
                                                onClick={() =>
                                                    toggleSort(col.key)
                                                }
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none h-auto"
                                            >
                                                <div className="flex items-center gap-1">
                                                    {col.label}
                                                    <ChevronsUpDown className="h-3 w-3 text-gray-400" />
                                                </div>
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="bg-white divide-y divide-gray-200">
                                    {paginatedData.length ? (
                                        paginatedData.map((t, i) => {
                                            const nominal =
                                                t.status === "Pemasukan"
                                                    ? t.jumlah_sisa -
                                                      t.jumlah_awal
                                                    : t.jumlah_digunakan;

                                            return (
                                                <TableRow
                                                    key={i}
                                                    onClick={() =>
                                                        router.visit(
                                                            `/rincian/${t.id}`
                                                        )
                                                    }
                                                    className="hover:bg-gray-50 transition duration-150 cursor-pointer border-0"
                                                >
                                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {t.tgl}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {t.kategori}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatRupiah(
                                                            t.jumlah_awal
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                                        {t.status ===
                                                        "Pemasukan"
                                                            ? formatRupiah(
                                                                  nominal
                                                              )
                                                            : "–"}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                                        {t.status ===
                                                        "Pengeluaran"
                                                            ? formatRupiah(
                                                                  nominal
                                                              )
                                                            : "–"}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                                        {formatRupiah(
                                                            t.jumlah_sisa
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="px-6 py-4 whitespace-nowrap">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`
                                                                ${
                                                                    t.status ===
                                                                    "Pemasukan"
                                                                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                                                        : "bg-red-100 text-red-800 border-red-200"
                                                                } border
                                                            `}
                                                        >
                                                            {t.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="px-6 py-8 text-center text-gray-500"
                                            >
                                                Tidak ada data transaksi.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Controls (IndexRT Style) */}
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

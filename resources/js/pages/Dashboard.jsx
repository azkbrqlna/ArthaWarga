import React, { useState, useMemo } from "react";
import { usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
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
    Clock,
    Database,
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

    const [sortField, setSortField] = useState("tgl");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    const itemsPerPage = 8;

    const toggleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    const handleFilterChange = (month, year) => {
        setSelectedMonth(month);
        setSelectedYear(year);

        // Update URL params agar state tersimpan saat refresh (opsional)
        router.get(
            route("dashboard"),
            { month, year },
            { preserveScroll: true, preserveState: true }
        );
    };

    // --- LOGIKA FILTER UTAMA ---
    // Menggabungkan filter Bulan & Tahun untuk data tabel dan chart
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

    // --- LOGIKA SORTING & PAGINATION ---
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

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // --- LOGIKA DATA CHART ---
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

    // --- PERSIAPAN TANGGAL UNTUK TOMBOL DOWNLOAD PDF ---
    // Karena dropdown terpisah (Bulan/Tahun), kita gabung jadi format YYYY-MM-DD (tanggal 01)
    // agar backend bisa membacanya sebagai tanggal valid.
    const dateForPdf = useMemo(() => {
        if (selectedYear && selectedMonth) {
            return `${selectedYear}-${selectedMonth}-01`;
        }
        return "";
    }, [selectedYear, selectedMonth]);

    return (
        <AppLayout>
            {/* padding global kanan kiri */}
            <div className="space-y-10">
                {/* HEADER DASHBOARD */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full bg-white">
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                        <span className="font-bold text-gray-900 pr-5">
                            DASHBOARD
                        </span>
                    </h1>

                    {userRole !== 5 && (
                        <div className="flex gap-2 mt-4 md:mt-0">
                            {/* {(userRole === 2 || userRole === 4) && (
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                                    onClick={() =>
                                        router.visit("/dashboard/kegiatan")
                                    }
                                >
                                    Tambah Kegiatan
                                </Button>
                            )} */}

                            {(userRole === 2 || userRole === 3) && (
                                <>
                                    {/* --- TOMBOL BARU: MASTER DATA (BIRU) --- */}
                                    <Button
                                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                                        onClick={() =>
                                            router.visit(
                                                route("kat_iuran.index")
                                            )
                                        }
                                    >
                                        Perbarui Master Data
                                    </Button>
                                    <Button
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                                        onClick={() =>
                                            router.visit(
                                                route("kategori.index")
                                            )
                                        } // <-- Link ke halaman baru
                                    >
                                        Kelola Kategori
                                    </Button>
                                    <Button
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                                        onClick={() =>
                                            router.visit("/dashboard/pemasukan")
                                        }
                                    >
                                        Tambah Pemasukan
                                    </Button>
                                    <Button
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                                        onClick={() =>
                                            router.visit(
                                                "/dashboard/pengeluaran"
                                            )
                                        }
                                    >
                                        Tambah Pengeluaran
                                    </Button>
                                    {/* <Button
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                                        onClick={() =>
                                            router.visit(
                                                "/dashboard/pengumuman"
                                            )
                                        }
                                    >
                                        Tambah Pengumuman
                                    </Button> */}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* RINGKASAN */}
                <div className="">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-gray-800">
                            RINGKASAN
                        </h2>

                        <div className="flex items-center gap-2">
                            {/* Dropdown Bulan */}
                            <select
                                value={selectedMonth}
                                onChange={(e) =>
                                    handleFilterChange(
                                        e.target.value,
                                        selectedYear
                                    )
                                }
                                className="border rounded-lg px-3 py-2 text-sm text-gray-700"
                            >
                                <option value="">Bulan</option>
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
                                            {
                                                month: "long",
                                            }
                                        )}
                                    </option>
                                ))}
                            </select>

                            {/* Dropdown Tahun */}
                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    handleFilterChange(
                                        selectedMonth,
                                        e.target.value
                                    )
                                }
                                className="border rounded-lg px-3 py-2 text-sm text-gray-700"
                            >
                                <option value="">Tahun</option>
                                {Array.from({ length: 6 }).map((_, i) => {
                                    const year = new Date().getFullYear() - i;
                                    return (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </select>

                            {/* Tombol Reset */}
                            {(selectedMonth || selectedYear) && (
                                <Button
                                    variant="outline"
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
                                    className="text-gray-700 text-xs"
                                >
                                    Reset
                                </Button>
                            )}

                            {/* TOMBOL DOWNLOAD PDF (Ditempatkan di sini) */}
                            <DownloadPdfBtn
                                month={selectedMonth}
                                year={selectedYear}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col md:flex-row gap-4 w-full">
                            {userRole === 1 && (
                                <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-lg">
                                        <Database className="w-5 h-5 text-gray-600" />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">
                                            Total KK
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {userTotal}
                                        </p>
                                    </div>
                                </div>
                            )}
                            {userRole === 1 && (
                                <>
                                    <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <Banknote className="w-5 h-5 text-gray-600" />
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Dana BOP Sekarang
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatRupiah(sisaBop)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <Banknote className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Dana Iuran Sekarang
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatRupiah(sisaIuran)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <Calculator className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Total Keseluruhan
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatRupiah(sisaSaldo)}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                            {(userRole === 2 ||
                                userRole === 3 ||
                                userRole === 4 ||
                                userRole === 5) && (
                                <>
                                    <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <Banknote className="w-5 h-5 text-gray-600" />
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Total Pemasukan
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatRupiah(saldoAwal)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <Clock className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Total Pengeluaran
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatRupiah(totalPengeluaran)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white border rounded-xl p-4 flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <Calculator className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Saldo Sekarang
                                            </p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {formatRupiah(sisaSaldo)}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* CHART KEJUTAN */}
                <div className="mt-8 mb-8">
                    <FinancialLineChart data={chartData} />
                </div>
                {/* AKHIR CHART KEJUTAN */}

                {/* TABEL TRANSAKSI */}
                <div className="pb-10">
                    <div className="rounded-xl border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-white">
                                    {[
                                        {
                                            key: "tgl",
                                            label: "Tanggal Transaksi",
                                        },
                                        { key: "kategori", label: "Kategori" },
                                        {
                                            key: "jumlah_awal",
                                            label: "Jumlah Awal",
                                        },
                                        {
                                            key: "jumlah_pemasukan",
                                            label: "Jumlah Pemasukan",
                                        },
                                        {
                                            key: "jumlah_pengeluaran",
                                            label: "Jumlah Pengeluaran",
                                        },
                                        {
                                            key: "jumlah_sisa",
                                            label: "Jumlah Sekarang",
                                        },
                                        { key: "status", label: "Status" },
                                    ].map((col) => (
                                        <TableHead
                                            key={col.key}
                                            onClick={() => toggleSort(col.key)}
                                            className="font-semibold cursor-pointer select-none"
                                        >
                                            <div className="flex items-center gap-2">
                                                {col.label}
                                                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {paginatedData.length ? (
                                    paginatedData.map((t, i) => {
                                        const nominal =
                                            t.status === "Pemasukan"
                                                ? t.jumlah_sisa - t.jumlah_awal
                                                : t.jumlah_digunakan;

                                        const jumlahPemasukan =
                                            t.status === "Pemasukan"
                                                ? formatRupiah(nominal)
                                                : "–";

                                        const jumlahPengeluaran =
                                            t.status === "Pengeluaran"
                                                ? formatRupiah(nominal)
                                                : "–";

                                        return (
                                            <TableRow
                                                key={i}
                                                onClick={() =>
                                                    router.visit(
                                                        `/rincian/${t.id}`
                                                    )
                                                }
                                                className="hover:bg-gray-100 cursor-pointer transition"
                                            >
                                                <TableCell>{t.tgl}</TableCell>
                                                <TableCell>
                                                    {t.kategori}
                                                </TableCell>

                                                {/* Jumlah Awal */}
                                                <TableCell>
                                                    {formatRupiah(
                                                        t.jumlah_awal
                                                    )}
                                                </TableCell>

                                                {/* Jumlah Pemasukan */}
                                                <TableCell className="font-medium text-emerald-700">
                                                    {jumlahPemasukan}
                                                </TableCell>

                                                {/* Jumlah Pengeluaran */}
                                                <TableCell className="font-medium text-red-700">
                                                    {jumlahPengeluaran}
                                                </TableCell>

                                                {/* Jumlah Sekarang */}
                                                <TableCell>
                                                    {formatRupiah(
                                                        t.jumlah_sisa
                                                    )}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    {t.status ===
                                                        "Pemasukan" && (
                                                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-medium">
                                                            Pemasukan
                                                        </Badge>
                                                    )}
                                                    {t.status ===
                                                        "Pengeluaran" && (
                                                        <Badge className="bg-red-50 text-red-700 hover:bg-red-50 font-medium">
                                                            Pengeluaran
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="text-center text-gray-500"
                                        >
                                            Tidak ada data transaksi
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {/* Pagination */}
                        <div className="flex justify-end items-center gap-2 mt-6 px-2 pb-4">
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((p) => Math.max(p - 1, 1))
                                }
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from(
                                { length: totalPages },
                                (_, i) => i + 1
                            ).map((num) => (
                                <Button
                                    key={num}
                                    onClick={() => setCurrentPage(num)}
                                    className={`${
                                        num === currentPage
                                            ? "bg-blue-500 text-white"
                                            : "bg-white border text-blue-500"
                                    } hover:bg-blue-300 transition`}
                                >
                                    {num}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) =>
                                        Math.min(p + 1, totalPages)
                                    )
                                }
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

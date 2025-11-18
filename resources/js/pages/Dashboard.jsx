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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
    const {
        transaksi = [],
        auth,
        saldoAwal,
        sisaSaldo,
        totalPengeluaran,
    } = usePage().props;
    const userRole = auth?.user?.role_id;

    const [sortField, setSortField] = useState("tgl");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDate, setSelectedDate] = useState("");
    const itemsPerPage = 8;

    const toggleSort = (field) => {
        if (field === sortField) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const sortedData = useMemo(() => {
        return [...transaksi].sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            if (!valA || !valB) return 0;
            if (typeof valA === "string" && typeof valB === "string") {
                return sortOrder === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }
            return sortOrder === "asc" ? valA - valB : valB - valA;
        });
    }, [transaksi, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    const handleDateChange = (e) => {
        const value = e.target.value;
        setSelectedDate(value);
        router.get(
            route("dashboard"),
            { date: value },
            { preserveScroll: true, preserveState: true }
        );
    };

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
                            {(userRole === 2 || userRole === 4) && (
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                                    onClick={() =>
                                        router.visit("/dashboard/kegiatan")
                                    }
                                >
                                    Tambah Kegiatan
                                </Button>
                            )}

                            {(userRole === 2 || userRole === 3) && (
                                <>
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
                                    <Button
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs md:text-sm px-3 md:px-4 py-2 rounded-md"
                                        onClick={() =>
                                            router.visit(
                                                "/dashboard/pengumuman"
                                            )
                                        }
                                    >
                                        Tambah Pengumuman
                                    </Button>
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
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="border rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none"
                            />

                            {selectedDate && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedDate("");
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
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex flex-col md:flex-row gap-4 w-full">
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
                        </div>
                    </div>
                </div>

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
                                            key: "jumlah_digunakan",
                                            label: "Jumlah Digunakan",
                                        },
                                        {
                                            key: "jumlah_sisa",
                                            label: "Jumlah Sisa",
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
                                    paginatedData.map((t, i) => (
                                        <TableRow
                                            key={i}
                                            onClick={() =>
                                                router.visit(`/rincian/${t.id}`)
                                            }
                                            className="hover:bg-gray-100 cursor-pointer transition"
                                        >
                                            <TableCell>{t.tgl}</TableCell>
                                            <TableCell>{t.kategori}</TableCell>
                                            <TableCell>
                                                {formatRupiah(t.jumlah_awal)}
                                            </TableCell>
                                            <TableCell>
                                                {formatRupiah(
                                                    t.jumlah_digunakan
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatRupiah(t.jumlah_sisa)}
                                            </TableCell>
                                            <TableCell className="text-left">
                                                {t.status === "Pemasukan" && (
                                                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 font-medium">
                                                        Pemasukan
                                                    </Badge>
                                                )}
                                                {t.status === "Pengeluaran" && (
                                                    <Badge className="bg-red-50 text-red-700 hover:bg-red-50 font-medium">
                                                        Pengeluaran
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="text-center text-gray-500"
                                        >
                                            Tidak ada data transaksi
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-end items-center gap-2 mt-6">
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
                                } hover:bg-blue-300`}
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
        </AppLayout>
    );
}

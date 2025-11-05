"use client";

import AppLayoutSuperadmin from "@/layouts/AppLayoutSuperadmin";
import React from "react";
import { Database, Banknote, Clock, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function Dashboard() {
    const [date, setDate] = React.useState();

    return (
        <AppLayoutSuperadmin>
            <div className="flex min-h-screen bg-white">
                {/* Main Content */}
                <main className="flex-1 p-8 space-y-6">
                    <h1 className="text-3xl font-bold border-b-2 border-gray-200 py-5">
                        Dashboard
                    </h1>

                    {/* Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card title="Total KK" value="8" icon={Database} />
                        <Card
                            title="Dana BOP Sekarang"
                            value="Rp. 6.000"
                            icon={Banknote}
                        />
                        <Card
                            title="Dana Iuran Sekarang"
                            value="Rp. 5.000"
                            icon={Banknote}
                        />
                        <Card
                            title="Total Keseluruhan"
                            value="Rp. 10.000"
                            icon={Clock}
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-semibold text-lg">
                                Terakhir Diedit
                            </h2>

                            {/* ✅ Kalender Popover */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-[180px] justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "dd/MM/yyyy") : (
                                            <span>DD/MM/YYYY</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        className="rounded-lg border [--cell-size:--spacing(8)] md:[--cell-size:--spacing(8)]"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="text-left py-2 px-3">
                                            Tanggal Transaksi
                                        </th>
                                        <th className="text-left py-2 px-3">
                                            Kategori
                                        </th>
                                        <th className="text-left py-2 px-3">
                                            Jumlah Awal
                                        </th>
                                        <th className="text-left py-2 px-3">
                                            Jumlah Digunakan
                                        </th>
                                        <th className="text-left py-2 px-3">
                                            Jumlah Sisa
                                        </th>
                                        <th className="text-left py-2 px-3">
                                            Status
                                        </th>
                                        <th className="text-left py-2 px-3">
                                            Perubahan Oleh
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        {
                                            tanggal: "07/09/2022, 06:31",
                                            kategori: "Administrasi",
                                            jumlahAwal: "Rp. 4.000",
                                            jumlahDigunakan: "Rp. 4.000",
                                            jumlahSisa: "Rp. 4.000",
                                            status: "Pengeluaran",
                                            perubahanOleh: "Ketua RT 05",
                                        },
                                        {
                                            tanggal: "06/09/2022, 22:02",
                                            kategori: "Administrasi",
                                            jumlahAwal: "Rp. 4.000",
                                            jumlahDigunakan: "Rp. 4.000",
                                            jumlahSisa: "Rp. 4.000",
                                            status: "Pemasukan",
                                            perubahanOleh: "Sekretaris RT 04",
                                        },
                                        {
                                            tanggal: "06/09/2022, 17:54",
                                            kategori: "Administrasi",
                                            jumlahAwal: "Rp. 4.000",
                                            jumlahDigunakan: "Rp. 4.000",
                                            jumlahSisa: "Rp. 4.000",
                                            status: "Pemasukan",
                                            perubahanOleh: "Bendahara RT 08",
                                        },
                                        {
                                            tanggal: "06/09/2022, 14:12",
                                            kategori: "Administrasi",
                                            jumlahAwal: "Rp. 4.000",
                                            jumlahDigunakan: "Rp. 4.000",
                                            jumlahSisa: "Rp. 4.000",
                                            status: "Pemasukan",
                                            perubahanOleh: "Sekretaris RT 09",
                                        },
                                    ].map((trx, i) => (
                                        <tr
                                            key={i}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="py-2 px-3">
                                                {trx.tanggal}
                                            </td>
                                            <td className="py-2 px-3">
                                                {trx.kategori}
                                            </td>
                                            <td className="py-2 px-3">
                                                {trx.jumlahAwal}
                                            </td>
                                            <td className="py-2 px-3">
                                                {trx.jumlahDigunakan}
                                            </td>
                                            <td className="py-2 px-3">
                                                {trx.jumlahSisa}
                                            </td>
                                            <td className="py-2 px-3">
                                                <span
                                                    className={`px-3 py-1 rounded-lg text-sm font-medium
                                                        ${
                                                            trx.status ===
                                                            "Pemasukan"
                                                                ? "bg-green-50 text-green-600 border border-green-50"
                                                                : "bg-orange-50 text-orange-600 border border-orange-50"
                                                        }`}
                                                >
                                                    {trx.status}
                                                </span>
                                            </td>

                                            <td className="py-2 px-3">
                                                {trx.perubahanOleh}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Dummy */}
                        <div className="flex justify-end mt-4 gap-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    className={`px-3 py-1 rounded ${
                                        n === 1
                                            ? "bg-green-200"
                                            : "hover:bg-gray-200"
                                    }`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </AppLayoutSuperadmin>
    );
}

function Card({ title, value, icon: Icon }) {
    return (
        <div className="bg-white border-2 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
            {Icon && <Icon size={24} className="text-black" />}
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-xl font-bold mt-1">{value}</p>
            </div>
        </div>
    );
}

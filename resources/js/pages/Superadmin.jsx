import AppLayoutSuperadmin from "@/layouts/AppLayoutSuperadmin";
import React from "react";
import { Database, Banknote, Clock, CalendarIcon, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

export default function Superadmin() {
    const [date, setDate] = React.useState(new Date());
    const [open, setOpen] = React.useState(false);
    const [sortConfig, setSortConfig] = React.useState({ key: null, direction: "asc" });
    const [data, setData] = React.useState([
        {
            tanggal: "07/09/2022, 06:31",
            kategori: "Administrasi",
            jumlahAwal: 8000,
            jumlahDigunakan: 4000,
            jumlahSisa: 4000,
            status: "Pengeluaran",
            perubahanOleh: "Ketua RT 05",
        },
        {
            tanggal: "06/09/2022, 22:02",
            kategori: "Administrasi",
            jumlahAwal: 4000,
            jumlahDigunakan: 4000,
            jumlahSisa: 4000,
            status: "Pemasukan",
            perubahanOleh: "Sekretaris RT 04",
        },
        {
            tanggal: "06/09/2022, 17:54",
            kategori: "Administrasi",
            jumlahAwal: 4000,
            jumlahDigunakan: 4000,
            jumlahSisa: 4000,
            status: "Pemasukan",
            perubahanOleh: "Bendahara RT 08",
        },
        {
            tanggal: "06/09/2022, 14:12",
            kategori: "Administrasi",
            jumlahAwal: 4000,
            jumlahDigunakan: 4000,
            jumlahSisa: 4000,
            status: "Pemasukan",
            perubahanOleh: "Sekretaris RT 09",
        },
    ]);

    // 🔽 fungsi untuk mengurutkan data
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        const sorted = [...data].sort((a, b) => {
            if (typeof a[key] === "number") {
                return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
            } else {
                return direction === "asc"
                    ? String(a[key]).localeCompare(String(b[key]))
                    : String(b[key]).localeCompare(String(a[key]));
            }
        });

        setData(sorted);
        setSortConfig({ key, direction });
    };

    // 🔼 komponen header tabel yang bisa diklik
    const SortableHeader = ({ label, columnKey }) => (
        <th
            className="cursor-pointer py-2 px-3 whitespace-nowrap select-none hover:bg-gray-100"
            onClick={() => handleSort(columnKey)}
        >
            <div className="flex items-center gap-1">
                {label}
                <ArrowUpDown
                    size={14}
                    className={`${
                        sortConfig.key === columnKey
                            ? sortConfig.direction === "asc"
                                ? "text-green-600 rotate-180 transition"
                                : "text-green-600 transition"
                            : "text-gray-400"
                    }`}
                />
            </div>
        </th>
    );

    return (
        <AppLayoutSuperadmin>
            <div className="flex flex-col min-h-screen px-10 bg-white">
                <main className="flex-1 p-3 sm:p-4 md:p-8 space-y-6 w-full">
                    <h1 className="text-2xl md:text-3xl font-bold border-b-2 border-gray-200 py-3 md:py-5 text-shadow-lg">
                        Dashboard
                    </h1>

                    {/* Kartu ringkasan */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <Card title="Total KK" value="8" icon={Database} />
                        <Card title="Dana BOP Sekarang" value="Rp. 6.000" icon={Banknote} />
                        <Card title="Dana Iuran Sekarang" value="Rp. 5.000" icon={Banknote} />
                        <Card title="Total Keseluruhan" value="Rp. 10.000" icon={Clock} />
                    </div>

                    {/* Bagian tabel */}
                    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                            <h2 className="font-semibold text-lg">Terakhir Diedit</h2>

                            {/* Kalender filter */}
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-[180px] justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "dd/MM/yyyy") : "DD/MM/YYYY"}
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-2" align="end">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(selectedDate) => {
                                            setDate(selectedDate);
                                            setOpen(false);
                                        }}
                                        className="rounded-lg border shadow-sm"
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Tabel scrollable */}
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-[700px] sm:min-w-full text-[12px] sm:text-sm">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <SortableHeader label="Tanggal Transaksi" columnKey="tanggal" />
                                            <SortableHeader label="Kategori" columnKey="kategori" />
                                            <SortableHeader label="Jumlah Awal" columnKey="jumlahAwal" />
                                            <SortableHeader label="Jumlah Digunakan" columnKey="jumlahDigunakan" />
                                            <SortableHeader label="Jumlah Sisa" columnKey="jumlahSisa" />
                                            <SortableHeader label="Status" columnKey="status" />
                                            <SortableHeader label="Perubahan Oleh" columnKey="perubahanOleh" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((trx, i) => (
                                            <tr key={i} className="border-b hover:bg-gray-100">
                                                <td className="py-2 px-3">{trx.tanggal}</td>
                                                <td className="py-2 px-3">{trx.kategori}</td>
                                                <td className="py-2 px-3">Rp. {trx.jumlahAwal}</td>
                                                <td className="py-2 px-3">Rp. {trx.jumlahDigunakan}</td>
                                                <td className="py-2 px-3">Rp. {trx.jumlahSisa}</td>
                                                <td className="py-2 px-3">
                                                    <span
                                                        className={`px-3 py-1 rounded-lg text-xs sm:text-sm font-medium ${
                                                            trx.status === "Pemasukan"
                                                                ? "bg-green-50 text-green-600 border border-green-50"
                                                                : "bg-orange-50 text-orange-600 border border-orange-50"
                                                        }`}
                                                    >
                                                        {trx.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-3">{trx.perubahanOleh}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Hint mobile */}
                        <p className="text-gray-400 text-xs mt-2 sm:hidden text-center">
                            Geser tabel ke kanan untuk melihat kolom lainnya →
                        </p>
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

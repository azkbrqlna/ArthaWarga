import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import AppLayout from "@/layouts/AppLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Filter } from "lucide-react";

export default function MasukIuranStatus({ iuran, warga }) {

    const [filterStatus, setFilterStatus] = useState("ALL");
    const [search, setSearch] = useState("");

    const jenisIuran =
        iuran?.kategori_iuran?.nm_kat ||
        iuran?.pengumuman?.judul ||
        "Iuran";

    const filteredData = warga.filter((item) => {
        const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());

        if (filterStatus === "SUDAH") {
            return matchSearch && item.status === "sudah";
        }
        if (filterStatus === "BELUM") {
            return matchSearch && item.status === "belum";
        }
        return matchSearch;
    });

    const handlePDF = () => {
        router.visit(route("masuk-iuran.pdf", { id: iuran.id }), {
            method: "get",
        });
    };

    return (
        <AppLayout>
            <Head title="Status Pembayaran Warga" />

            <div className="w-full min-h-screen bg-white px-6 pb-12">
                <h1 className="text-3xl font-bold mb-6">STATUS PEMBAYARAN WARGA</h1>

                <Breadcrumbs
                    items={[
                        { label: "Dashboard", href: route("dashboard") },
                        { label: "Iuran", href: route("masuk-iuran.index") },
                        { label: "Status Pembayaran" },
                    ]}
                />

                {/* FILTER */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Jenis Iuran */}
                    <div className="space-y-1">
                        <Label>Jenis Iuran</Label>
                        <Input value={jenisIuran} readOnly />
                    </div>

                    {/* Filter Status */}
                    <div className="space-y-1">
                        <Label>Status Pembayaran</Label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border rounded-lg px-3 py-2 w-full"
                        >
                            <option value="ALL">Semua</option>
                            <option value="SUDAH">Sudah Bayar</option>
                            <option value="BELUM">Belum Bayar</option>
                        </select>
                    </div>

                    {/* Cari */}
                    <div className="space-y-1">
                        <Label>Cari Warga</Label>
                        <Input
                            placeholder="Cari nama warga..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* PDF Button */}
                <div className="flex justify-end mt-6">
                    <Button
                        onClick={handlePDF}
                        className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
                    >
                        <FileText className="w-5 h-5" />
                        Generate PDF
                    </Button>
                </div>

                {/* LIST WARGA */}
                <div className="mt-8 space-y-4">
                    {filteredData.length === 0 && (
                        <p className="text-gray-500 text-center py-8">
                            Tidak ada data warga.
                        </p>
                    )}

                    {filteredData.map((item, index) => (
                        <div
                            key={index}
                            className="border rounded-xl p-5 shadow-sm hover:bg-gray-50 transition"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-semibold">{item.nama}</p>
                                    <p className="text-gray-600 text-sm">
                                        Rumah: {item.rumah}
                                    </p>
                                    <p className="text-gray-600 text-sm">
                                        Nominal: Rp {Number(item.nominal).toLocaleString("id-ID")}
                                    </p>
                                </div>

                                {/* Status */}
                                <div>
                                    {item.status === "sudah" ? (
                                        <span className="px-3 py-1 text-sm rounded-lg bg-green-100 text-green-700 font-medium">
                                            Sudah Bayar
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-600 font-medium">
                                            Belum Bayar
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

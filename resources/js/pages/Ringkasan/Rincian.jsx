import React from "react";
import { usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Rincian() {
    const { transaksi } = usePage().props;

    const formatRupiah = (val) =>
        "Rp " + parseInt(val || 0).toLocaleString("id-ID");

    return (
        <AppLayout>
            <div className="p-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        RINCIAN
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Dashboard &gt;{" "}
                        <span className="text-emerald-500 font-semibold">
                            Rincian
                        </span>
                    </p>
                </div>

                {/* Kartu Ringkasan */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-gray-500">Jumlah awal</p>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {formatRupiah(transaksi.nominal)}
                            </h2>
                            <p className="text-emerald-500 text-sm font-semibold mt-1">
                                +1.29%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-gray-500">Jumlah digunakan</p>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {formatRupiah(transaksi.nominal / 2)}
                            </h2>
                            <p className="text-red-500 text-sm font-semibold mt-1">
                                -1.29%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-gray-500">Jumlah sisa</p>
                            <h2 className="text-2xl font-bold text-gray-800">
                                {formatRupiah(transaksi.nominal / 2)}
                            </h2>
                            <p className="text-emerald-500 text-sm font-semibold mt-1">
                                +1.29%
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardContent className="p-4">
                            <p className="text-gray-500">Jenis</p>
                            <h2 className="text-2xl font-bold text-red-600">
                                {transaksi.tipe === "bop"
                                    ? "BOP"
                                    : transaksi.tipe === "iuran"
                                    ? "Iuran"
                                    : "Pengeluaran"}
                            </h2>
                        </CardContent>
                    </Card>
                </div>

                {/* Form Detail Barang */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <div>
                        <Label>
                            Nama Barang <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            value={transaksi.ket}
                            readOnly
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>
                            Tanggal <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            value={transaksi.tgl}
                            readOnly
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>
                            Jumlah <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="number"
                            value={10}
                            readOnly
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <Label>
                            Harga Satuan <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            value="Rp. 2.000"
                            readOnly
                            className="mt-1"
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

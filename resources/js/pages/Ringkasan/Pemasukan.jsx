import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import FormBOP from "./FormBOP";
import FormIuran from "./FormIuran";

export default function Pemasukan() {
    // 🟢 ubah default state jadi "bop"
    const [jenis, setJenis] = useState("bop");
    const [tanggal, setTanggal] = useState("");

    const { props } = usePage();
    const kategori_iuran = props.kategori_iuran || [];

    return (
        <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden px-8 py-10 md:px-12 md:py-12">
            <h1 className="text-3xl font-bold mb-10">TAMBAH PEMASUKAN</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 w-full">
                <div>
                    <Label className="mb-1 block">
                        Jenis Pemasukan <span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={jenis}
                        onValueChange={(val) => setJenis(val)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Pilih jenis" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="bop">BOP</SelectItem>
                            <SelectItem value="iuran">Iuran</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className="mb-1 block">
                        Tanggal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        type="date"
                        className="w-full"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                    />
                </div>
            </div>

            {/* tampilkan form sesuai jenis */}
            {jenis === "bop" && <FormBOP tanggal={tanggal} />}
            {jenis === "iuran" && (
                <FormIuran tanggal={tanggal} kategori_iuran={kategori_iuran} />
            )}
        </div>
    );
}

Pemasukan.layout = (page) => <AppLayout>{page}</AppLayout>;

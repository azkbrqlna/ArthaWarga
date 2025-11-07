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
import AppLayout from "@/layouts/Applayout";
import FormBOP from "./FormBOP";
import FormIuran from "./FormIuran";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Pemasukan() {
    const [jenis, setJenis] = useState("bop");
    const [tanggal, setTanggal] = useState("");

    const { props } = usePage();
    const kategori_iuran = props.kategori_iuran || [];

    return (
        <div className="w-full min-h-screen bg-white overflow-y-auto overflow-x-hidden pl-0 pr-8 pb-10 md:pr-12 md:pb-12">
            {/* Judul */}
            <h1 className="text-3xl font-bold mb-8">TAMBAH PEMASUKAN</h1>

            {/* Pilihan jenis dan tanggal */}
            <Breadcrumbs
                items={[
                    { label: "Dashboard", href: route("dashboard") },
                    { label: "Tambah Pemasukan" },
                ]}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 w-full">
                {/* Jenis Pemasukan */}
                <div className="space-y-2">
                    <Label>
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

                {/* Tanggal */}
                <div className="space-y-2">
                    <Label>
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

            {/* Form dinamis */}
            <div className="mt-6">
                {jenis === "bop" && <FormBOP tanggal={tanggal} />}
                {jenis === "iuran" && (
                    <FormIuran
                        tanggal={tanggal}
                        kategori_iuran={kategori_iuran}
                    />
                )}
            </div>
        </div>
    );
}

Pemasukan.layout = (page) => <AppLayout>{page}</AppLayout>;

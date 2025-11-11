import React, { useState } from "react";
import AppLayout from "@/layouts/AppLayout";
import { usePage, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

export default function Profil() {
    const { props } = usePage();
    const { user } = props;

    const [formData, setFormData] = useState({
        nm_lengkap: user.nm_lengkap || "",
        email: user.email || "",
        password: "",
        no_hp: user.no_hp || "",
        no_kk: user.no_kk || "",
        alamat: user.alamat || "",
        status: user.status || "",
        rt: user.rt || "",
        rw: user.rw || "",
        kode_pos: user.kode_pos || "",
        role_id: user.role_id || "",
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEditToggle = () => {
        if (isEditing) {
            router.put(`/profil/update/${user.id}`, formData, {
                onSuccess: () => setIsEditing(false),
            });
        } else {
            setIsEditing(true);
        }
    };

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-yellow-100 p-10">
                {/* Header Profil */}
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                    <img
                        src={
                            user.foto_profil
                                ? `/storage/${user.foto_profil}`
                                : "https://i.pravatar.cc/150"
                        }
                        alt="Foto Profil"
                        className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white"
                    />
                    <div>
                        <h1 className="text-5xl font-bold text-gray-900">
                            Hai, ini profilmu!
                        </h1>
                        <h2 className="text-4xl font-semibold text-gray-800 mt-2">
                            {formData.nm_lengkap}
                        </h2>
                    </div>
                </div>

                {/* Kartu Form Profil */}
                <div className="bg-white rounded-3xl shadow-xl p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Kolom Kiri */}
                        <div className="flex flex-col gap-5">
                            <InputField
                                label="Nama"
                                name="nm_lengkap"
                                value={formData.nm_lengkap}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="No Handphone"
                                name="no_hp"
                                value={formData.no_hp}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Role"
                                value={
                                    formData.role_id === 1
                                        ? "Superadmin"
                                        : formData.role_id === 2
                                        ? "Ketua RT"
                                        : formData.role_id === 3
                                        ? "Bendahara"
                                        : formData.role_id === 4
                                        ? "Sekretaris"
                                        : "Warga"
                                }
                                disabled
                            />
                            <InputField
                                label="Kode Pos"
                                name="kode_pos"
                                value={formData.kode_pos}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>

                        {/* Kolom Kanan */}
                        <div className="flex flex-col gap-5">
                            <InputField
                                label="Alamat"
                                name="alamat"
                                value={formData.alamat}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Nomor Kartu Keluarga"
                                name="no_kk"
                                value={formData.no_kk}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Rt"
                                name="rt"
                                value={formData.rt}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                            <InputField
                                label="Rw"
                                name="rw"
                                value={formData.rw}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    {/* Tombol Edit / Simpan */}
                    <div className="mt-8 flex justify-end">
                        <Button
                            onClick={handleEditToggle}
                            className={`px-6 py-2 rounded-lg text-white ${
                                isEditing
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {isEditing ? "Simpan" : "Edit"}
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

/* Komponen Input Field */
function InputField({ label, name, value, onChange, disabled, type = "text" }) {
    return (
        <div>
            <label className="block text-sm text-gray-600 mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`w-full border rounded-xl px-4 py-2 text-gray-800 placeholder-gray-400 ${
                    disabled
                        ? "bg-gray-100 cursor-not-allowed"
                        : "border-blue-300 focus:ring-2 focus:ring-blue-300"
                }`}
                placeholder={label + " anda"}
            />
        </div>
    );
}

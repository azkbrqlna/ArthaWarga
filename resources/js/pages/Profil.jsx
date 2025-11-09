import AppLayoutSuperadmin from "@/layouts/AppLayoutSuperadmin";
import React from "react";

export default function Profil() {
    return (
        <AppLayoutSuperadmin>
            <div className="h-screen bg-gradient-to-r from-blue-100 via-white to-yellow-100 rounded-3xl p-10 shadow ">
                {/* Judul */}
                <h1 className="text-4xl font-bold text-gray-900 mb-8">
                    Hai, ini profilmu!
                </h1>

                {/* Foto & Nama */}
                <div className="flex items-center gap-6 mb-6">
                    <img
                        src="https://i.pravatar.cc/150"
                        alt="Foto Profil"
                        className="w-30 h-30 rounded-full shadow-lg border-3 border-white object-cover"
                    />
                    <h2 className="text-5xl font-semibold text-gray-900">
                        Jonathan
                    </h2>
                </div>

                {/* Kartu Data Profil */}
                <div className="bg-white rounded-3xl shadow p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Kiri */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Nama</p>
                                <p className="text-lg font-medium text-gray-800">
                                    Jonathan Doe
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Password</p>
                                <p className="text-lg font-medium text-gray-800">
                                    ********
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-lg font-medium text-gray-800">
                                    jonathan@email.com
                                </p>
                            </div>
                        </div>

                        {/* Kanan */}
                        <div className="flex flex-col gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Alamat</p>
                                <p className="text-lg font-medium text-gray-800">
                                    Jl. Kenangan No. 12, Bandung
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="text-lg font-medium text-gray-800">
                                    Rumah Pribadi
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Jumlah anggota keluarga
                                </p>
                                <p className="text-lg font-medium text-gray-800">
                                    4 Orang
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tombol */}
                    <div className="mt-10">
                        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                            Edit Profil
                        </button>
                    </div>
                </div>
            </div>
        </AppLayoutSuperadmin>
    );
}
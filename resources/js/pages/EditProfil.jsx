import AppLayoutSuperadmin from "@/layouts/AppLayoutSuperadmin";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function EditProfil() {
  const [form, setForm] = useState({
    nama: "Jonathan Doe",
    password: "",
    email: "jonathan@email.com",
    alamat: "Jl. Kenangan No. 12, Bandung",
    status: "Rumah Pribadi",
    jumlahKeluarga: "4 Orang",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Data disimpan:", form);
  };

  return (
    <AppLayoutSuperadmin>
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-yellow-100 p-6 md:p-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Edit Profilmu
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg p-8 md:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Kolom Kiri */}
            <div className="flex flex-col gap-6">
              <div>
                <Label>Nama</Label>
                <Input
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="flex flex-col gap-6">
              <div>
                <Label>Alamat</Label>
                <Input
                  name="alamat"
                  value={form.alamat}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Status</Label>
                <Input
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Jumlah anggota keluarga</Label>
                <Input
                  name="jumlahKeluarga"
                  value={form.jumlahKeluarga}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="mt-10 flex justify-end gap-4">
            <Button
              type="button"
              onClick={() => window.history.back()}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400"
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </AppLayoutSuperadmin>
  );
}

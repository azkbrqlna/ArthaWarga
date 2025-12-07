import React from "react";

export default function ProfileIndex({ user }) {
  return (
    <div className="max-w-lg mx-auto bg-white shadow-md p-6 rounded-xl mt-10">
      <h2 className="text-2xl font-bold mb-4">Profil Saya</h2>

      <div className="space-y-2">
        <p><b>Nama Lengkap:</b> {user.nm_lengkap}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>No KK:</b> {user.no_kk}</p>
        <p><b>Password:</b> {user.password}</p>
        <p><b>No HP:</b> {user.no_hp}</p>
        <p><b>Role ID:</b> {user.role_id}</p>
        <p><b>Alamat:</b> RT {user.rt}/RW {user.rw}, {user.kode_desa}, {user.kode_kec}, {user.kode_kota_kab}, {user.kode_prov}</p>
        <p><b>Kode Pos:</b> {user.kode_pos}</p>
        {user.foto_profil && (
          <div className="mt-3">
            <b>Foto Profil:</b><br />
            <img
              src={`/storage/${user.foto_profil}`}
              alt="Foto Profil"
              className="w-32 h-32 object-cover rounded-full border"
            />
          </div>
        )}
      </div>
    </div>
  );
}

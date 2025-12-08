<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
// ✅ Namespace Intervention Image V3
use Intervention\Image\Laravel\Facades\Image;
use Inertia\Inertia;

class ProfileWargaController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Anda harus login untuk mengakses profil.');
        }

        return Inertia::render('Profil/Profil', [
            'user' => [
                'id'             => $user->id,
                'role_id'        => $user->role_id,
                'email'          => $user->email,
                'no_kk'          => $user->no_kk,
                'password'       => '********',
                'nm_lengkap'     => $user->nm_lengkap,
                'foto_profil'    => $user->foto_profil,
                'no_hp'          => $user->no_hp,
                'rt'             => $user->rt,
                'rw'             => $user->rw,
                'status'             => $user->status,
                'kode_pos'       => $user->kode_pos,
                'alamat'         => $user->alamat
            ]
        ]);
    }

    // Update data teks
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nm_lengkap' => 'required|string|max:255',
            // Validasi email disesuaikan dengan nama tabel (usr)
            'email'      => 'required|email|unique:usr,email,' . $user->id,
            'password'   => 'nullable|string|min:6',
            'no_hp'      => 'nullable|string',
            'no_kk'      => 'nullable|string',
            'rt'         => 'nullable|string',
            'rw'         => 'nullable|string',
            'status'         => 'nullable|string',
            'kode_pos'   => 'nullable|string',
            'alamat'     => 'nullable|string',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Profil berhasil diperbarui!');
    }

    /**
     * Update Foto dengan Teknik "Canvas Paste".
     * Menjamin hasil 100% presisi sesuai tampilan lingkaran crop.
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            'foto_profil' => 'required|image|mimes:jpg,jpeg,png|max:10240',
            'crop_width'  => 'required|integer',
            'crop_height' => 'required|integer',
            'crop_x'      => 'required|integer',
            'crop_y'      => 'required|integer',
        ]);

        $user = Auth::user();

        if ($request->hasFile('foto_profil')) {

            // 1. Hapus foto lama
            if ($user->foto_profil && Storage::disk('public')->exists('foto_profil/' . $user->foto_profil)) {
                Storage::disk('public')->delete('foto_profil/' . $user->foto_profil);
            }

            // 2. Siapkan File
            $file = $request->file('foto_profil');
            $filename = $file->hashName();

            // 3. Baca Gambar Asli
            $source = Image::read($file);

            // 4. Ambil Koordinat dari Frontend
            $cw = (int) $request->input('crop_width');
            $ch = (int) $request->input('crop_height');
            $cx = (int) $request->input('crop_x');
            $cy = (int) $request->input('crop_y');

            // --- LOGIKA "CANVAS PASTE" ---
            // Kita buat kanvas kosong, lalu tempel gambar di atasnya.
            // Ini menangani kasus zoom out, geser keluar batas, atau koordinat negatif.

            // a. Jika data nol (fallback aman), auto center crop
            if ($cw <= 0 || $ch <= 0) {
                $cw = 500;
                $ch = 500;
                $source->cover($cw, $ch); // Otomatis crop tengah
                $finalImage = $source;
            } else {
                // b. Buat Kanvas Putih Kosong Seukuran Hasil Crop
                $finalImage = Image::create($cw, $ch)->fill('#ffffff');

                // c. Hitung Posisi Tempel
                // Jika cx negatif (gambar digeser ke kanan), kita tempel di posisi positif di kanvas
                $pasteX = ($cx < 0) ? abs($cx) : 0;
                $pasteY = ($cy < 0) ? abs($cy) : 0;

                // d. Hitung Bagian Gambar Mana yang Harus Diambil
                // Kita tidak bisa mengambil dari koordinat negatif, jadi mulai dari 0 atau cx
                $cutX = max(0, $cx);
                $cutY = max(0, $cy);

                // e. Hitung Ukuran Potongan yang Valid (Agar tidak error out of bounds)
                // Lebar potongan = Min(Sisa ruang di kanvas, Sisa gambar asli)
                $cutW = min($cw - $pasteX, $source->width() - $cutX);
                $cutH = min($ch - $pasteY, $source->height() - $cutY);

                // f. Eksekusi: Potong lalu Tempel
                if ($cutW > 0 && $cutH > 0) {
                    // Ambil potongan dari gambar asli
                    $source->crop($cutW, $cutH, $cutX, $cutY);

                    // Tempel ke kanvas putih di posisi yang tepat
                    $finalImage->place($source, 'top-left', $pasteX, $pasteY);
                }
            }

            // 5. Simpan Hasil
            $encoded = $finalImage->toJpeg(90);
            Storage::disk('public')->put('foto_profil/' . $filename, $encoded);

            // 6. Update DB
            $user->update([
                'foto_profil' => $filename
            ]);
        }

        return redirect()->back()->with('success', 'Foto profil berhasil diperbarui!');
    }
    public function deletePhoto($id)
    {
        $user = Auth::user();

        // Security Check: Pastikan ID url sama dengan User yang login
        // Agar user A tidak bisa menghapus foto user B
        if ($user->id != $id) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        // Cek jika user punya foto
        if ($user->foto_profil) {
            // 1. Hapus file fisik jika ada
            if (Storage::disk('public')->exists('foto_profil/' . $user->foto_profil)) {
                Storage::disk('public')->delete('foto_profil/' . $user->foto_profil);
            }

            // 2. Set kolom database ke NULL
            $user->update([
                'foto_profil' => null
            ]);
        }

        return redirect()->back()->with('success', 'Foto profil berhasil dihapus.');
    }
}
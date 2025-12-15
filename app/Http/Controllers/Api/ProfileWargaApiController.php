<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller; 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Intervention\Image\Laravel\Facades\Image; 
use App\Models\User; 

class ProfileWargaApiController extends Controller
{
    // Mengambil data profil Warga/User yang sedang login
    /**
     * Lihat data profile user
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProfile()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Ambil data user dengan relasi yang diperlukan (kecamatan, kelurahan, kota)
        $user->load('kecamatan', 'kelurahan', 'kota');

        $profileData = [
            'id'             => $user->id,
            'role_id'        => $user->role_id,
            'email'          => $user->email,
            'no_kk'          => $user->no_kk,
            'nm_lengkap'     => $user->nm_lengkap,
            // Tambahkan URL lengkap untuk foto_profil
            'foto_profil'    => $user->foto_profil ? url('storage/foto_profil/' . $user->foto_profil) : null,
            'no_hp'          => $user->no_hp,
            'rt'             => $user->rt,
            'rw'             => $user->rw,
            'status'         => $user->status,
            'kode_pos'       => $user->kode_pos,
            'alamat'         => $user->alamat,

            // Relasi
            'kecamatan_nama' => $user->kecamatan->nama_kecamatan ?? '-',
            'kelurahan_nama' => $user->kelurahan->nama_kelurahan ?? '-',
            'kota_nama'      => $user->kota->nama_kota ?? '-',
            'kecamatan_id'   => $user->kecamatan_id,
            'kelurahan_id'   => $user->kelurahan_id,
            'kota_id'        => $user->kota_id,
        ];

        return response()->json($profileData);
    }

    // Memperbarui data teks profil Warga/User. Endpoint: POST /api/warga/profile/update
    /**
     *Update data profil
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nm_lengkap' => 'required|string|max:255',
            // Gunakan tabel 'usr' untuk validasi unik
            'email'      => 'required|email|unique:usr,email,' . $user->id,
            'password'   => 'nullable|string|min:6',
            'no_hp'      => 'nullable|string',
            'no_kk'      => 'nullable|string',
            'rt'         => 'nullable|string',
            'rw'         => 'nullable|string',
            'status'     => 'nullable|string',
            'kode_pos'   => 'nullable|string',
            'alamat'     => 'nullable|string',
            'kelurahan_id'  => 'nullable|string',
            'kecamatan_id'  => 'nullable|string',
            'kota_id'    => 'nullable|string',
        ]);

        if (!empty($validated['password'])) {
            // Gunakan Hash::make() untuk API, ini lebih modern dari bcrypt()
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profil berhasil diperbarui!',
            'data'    => $user->fresh()->only(array_keys($validated)) // Hanya kembalikan data yang diupdate
        ]);
    }
    
    //Update Foto Profil dengan Logika Canvas Paste yang sama.
    // Endpoint: POST /api/warga/profile/update-photo

    /**
     * Update foto profile 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePhoto(Request $request)
    {
        $request->validate([
            // Validasi file
            'foto_profil' => 'required|image|mimes:jpg,jpeg,png|max:10240',
            // Validasi koordinat crop
            'crop_width'  => 'required|integer|min:1',
            'crop_height' => 'required|integer|min:1',
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
            $filename = $file->hashName(); // Menggunakan hashName() untuk nama file unik

            // 3. Baca Gambar Asli
            $source = Image::read($file);

            // 4. Ambil Koordinat dari Frontend
            $cw = (int) $request->input('crop_width');
            $ch = (int) $request->input('crop_height');
            $cx = (int) $request->input('crop_x');
            $cy = (int) $request->input('crop_y');

            // --- LOGIKA "CANVAS PASTE" (Diadaptasi dari ProfileWargaController) ---

            // a. Jika data crop tidak valid (falllback aman)
            if ($cw <= 0 || $ch <= 0) {
                // Di API, lebih baik gagal atau fallback ke crop standar
                $cw = 500;
                $ch = 500;
                $source->cover($cw, $ch);
                $finalImage = $source;
            } else {
                // b. Buat Kanvas Putih Kosong Seukuran Hasil Crop
                $finalImage = Image::create($cw, $ch)->fill('#ffffff');

                // c. Hitung Posisi Tempel dan Potong
                $pasteX = max(0, -$cx); // Posisi tempel di kanvas jika crop_x negatif
                $pasteY = max(0, -$cy); // Posisi tempel di kanvas jika crop_y negatif
                $cutX   = max(0, $cx);   // Koordinat potong dari gambar asli
                $cutY   = max(0, $cy);   // Koordinat potong dari gambar asli

                // d. Hitung Ukuran Potongan yang Valid
                $cutW = min($cw - $pasteX, $source->width() - $cutX);
                $cutH = min($ch - $pasteY, $source->height() - $cutY);

                // e. Eksekusi: Potong lalu Tempel
                if ($cutW > 0 && $cutH > 0) {
                    $croppedSource = Image::read($file)->crop($cutW, $cutH, $cutX, $cutY);
                    $finalImage->place($croppedSource, 'top-left', $pasteX, $pasteY);
                }
            }

            // 5. Simpan Hasil
            $encoded = $finalImage->toJpeg(90);
            Storage::disk('public')->put('foto_profil/' . $filename, $encoded);

            // 6. Update DB
            $user->update([
                'foto_profil' => $filename
            ]);

            return response()->json([
                'message' => 'Foto profil berhasil diperbarui!',
                'foto_url' => url('storage/foto_profil/' . $filename)
            ]);
        }

        return response()->json(['message' => 'Gagal mengupload foto'], 400);
    }

    /**
     * Hapus foto profile
     * @param  int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function deletePhoto()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
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

        return response()->json(['message' => 'Foto profil berhasil dihapus.']);
    }
}
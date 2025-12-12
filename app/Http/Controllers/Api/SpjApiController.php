<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SpjApiController extends Controller
{
    // GET: Lihat data SPJ
    /**
     * Lihat isi data SPJ
     */
    public function show($id)
    {
        // 1. PARSING ID
        // Menerima format "bop-out-12" atau angka "12"
        if (str_contains($id, '-')) {
            $parts = explode('-', $id);
            $realId = end($parts);
        } else {
            $realId = $id;
        }

        // 2. AMBIL DATA DARI DB
        $transaksi = Pengeluaran::find($realId);

        // Validasi: Jika data tidak ketemu, kembalikan JSON error
        if (!$transaksi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data transaksi tidak ditemukan.',
                'requested_id' => $realId
            ], 404);
        }

        // 3. SETUP FORMATTING
        Carbon::setLocale('id');
        $tanggalTransaksi = Carbon::parse($transaksi->tgl);

        // 4. SIAPKAN DATA (JSON)
        // Kita susun data agar mudah dibaca oleh frontend/postman
        $data = [
            'id_transaksi'  => $transaksi->id,
            'kategori'      => $transaksi->tipe ?? 'Pengeluaran', // Sesuaikan kolom di DB
            'tanggal_raw'   => $transaksi->tgl,
            'tanggal_fmt'   => $tanggalTransaksi->translatedFormat('d F Y'),
            
            // Data Utama SPJ
            'pemberi'       => $transaksi->terima_dari ?? $transaksi->toko ?? 'PEJABAT PEMBUAT KOMITMEN LPPM UNDIP',
            'nominal'       => $transaksi->nominal,
            'nominal_rp'    => 'Rp ' . number_format($transaksi->nominal, 0, ',', '.'),
            'terbilang'     => strtoupper($this->terbilang($transaksi->nominal) . ' RUPIAH'),
            'deskripsi'     => $transaksi->ket ?? '-',
            'kota'          => 'Semarang',
        ];

        // 5. RETURN JSON
        // Browser akan menampilkan teks JSON, bukan download file
        return response()->json([
            'status' => 'success',
            'data'   => $data
        ], 200);
    }

    // --- FUNGSI HELPER TERBILANG ---
    private function terbilang($nilai) {
        $nilai = abs($nilai);
        $huruf = array("", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas");
        $temp = "";
        if ($nilai < 12) {
            $temp = " ". $huruf[$nilai];
        } else if ($nilai < 20) {
            $temp = $this->terbilang($nilai - 10). " belas";
        } else if ($nilai < 100) {
            $temp = $this->terbilang($nilai/10)." puluh". $this->terbilang($nilai % 10);
        } else if ($nilai < 200) {
            $temp = " seratus" . $this->terbilang($nilai - 100);
        } else if ($nilai < 1000) {
            $temp = $this->terbilang($nilai/100) . " ratus" . $this->terbilang($nilai % 100);
        } else if ($nilai < 2000) {
            $temp = " seribu" . $this->terbilang($nilai - 1000);
        } else if ($nilai < 1000000) {
            $temp = $this->terbilang($nilai/1000) . " ribu" . $this->terbilang($nilai % 1000);
        } else if ($nilai < 1000000000) {
            $temp = $this->terbilang($nilai/1000000) . " juta" . $this->terbilang($nilai % 1000000);
        }
        return $temp;
    }
}
<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class SpjController extends Controller
{
    public function download($id)
    {
        // 1. PARSING ID DARI FRONTEND
        // Format ID dari frontend: "bop-out-12" atau "iuran-out-5"
        // Kita perlu ambil angka paling belakang sebagai ID asli di database
        $parts = explode('-', $id);
        $realId = end($parts); 

        // 2. AMBIL DATA DARI DATABASE
        // Karena SPJ hanya untuk Pengeluaran, kita cari di model Pengeluaran
        $transaksi = Pengeluaran::find($realId);

        if (!$transaksi) {
            abort(404, 'Data transaksi tidak ditemukan.');
        }

        // 3. SETUP TANGGAL & FORMAT
        Carbon::setLocale('id');
        $tanggalTransaksi = Carbon::parse($transaksi->tgl);

        // 4. SIAPKAN DATA UTAMA
        $data = [
            // PEMBERI: Bisa dinamis kalau ada di DB, atau statis
            'pemberi'   => $transaksi->toko ?? '-',
            
            // TERBILANG: Pakai fungsi helper private di bawah
            'terbilang' => strtoupper($this->terbilang($transaksi->nominal) . ' RUPIAH'),
            
            // DESKRIPSI: Ambil dari kolom 'ket'
            'deskripsi' => $transaksi->ket ?? 'Pengeluaran operasional kegiatan.',

            // ITEMS:
            // Karena di tabel Pengeluaran sepertinya tidak ada tabel anak (rincian barang),
            // Kita anggap 1 Transaksi = 1 Item Kegiatan.
            'items'     => [
                [
                    'qty'   => '1 Keg', // Default 1 Kegiatan
                    'nama'  => $transaksi->ket, // Nama barang = Keterangan pengeluaran
                    'harga' => $transaksi->nominal
                ]
            ],
            
            // TOTAL
            'total'     => $transaksi->nominal,
            
            // KOTA & TANGGAL
            'kota'      => 'Semarang',
            'tanggal'   => $tanggalTransaksi->translatedFormat('d F Y'), // Contoh: 12 Oktober 2022
        ];

        // 5. LOAD VIEW PDF
        $pdf = Pdf::loadView('spj.spj', $data);
        $pdf->setPaper('A4', 'portrait');

        // 6. NAMA FILE SAAT DOWNLOAD
        // Contoh: SPJ-2023-10-12-bop-out-15.pdf
        $filename = 'SPJ-' . $transaksi->tgl . '-' . $id . '.pdf';

        return $pdf->download($filename);
    }

    // --- FUNGSI HELPER: ANGKA KE TERBILANG ---
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
        } else if ($nilai < 1000000000000) {
            $temp = $this->terbilang($nilai/1000000000) . " milyar" . $this->terbilang(fmod($nilai,1000000000));
        } else if ($nilai < 1000000000000000) {
            $temp = $this->terbilang($nilai/1000000000000) . " trilyun" . $this->terbilang(fmod($nilai,1000000000000));
        }
        return $temp;
    }
}
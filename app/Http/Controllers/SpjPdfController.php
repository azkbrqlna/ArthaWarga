<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Str;

class SpjPdfController extends Controller
{
    /**
     * Mengambil data kegiatan dan pengeluaran, kemudian menggabungkannya menjadi satu file PDF Laporan SPJ.
     * @param int $id ID Kegiatan
     * @return \Illuminate\Http\Response
     */
    public function generateSpjPdf(Request $request, $id)
    {
        // =======================================================
        // SIMULASI PENGAMBILAN DATA (GANTI DENGAN QUERY ELOQUENT ASLI ANDA)
        // =======================================================
        
        // Data Kegiatan Utama (Contoh)
        $kegiatanData = (object)[
            'id' => $id,
            'nm_keg' => 'Pelatihan Pengembangan Web Modern (React & Laravel)',
            'kategori' => 'Pendidikan & IT',
            'tgl_mulai' => '2024-10-01',
            'tgl_selesai' => '2024-10-05',
            'pj_keg' => 'Rizky Firmansyah, S.Kom',
            'panitia' => 'Tim Divisi Teknis',
            'rincian_kegiatan' => 'Pelatihan intensif selama 5 hari mencakup dasar-dasar React, Tailwind CSS, dan integrasi API. Meningkatkan kompetensi tim internal.',
            'dokumentasi_url' => 'https://placehold.co/400x300/e0e0e0/555555?text=Foto+A:+Kegiatan',
            'lokasi' => 'Gedung Serbaguna Lt. 2',
            'kota' => 'Jakarta',
        ];

        // Data Pengeluaran (Contoh)
        $pengeluaranData = collect([
            (object)['tgl' => '2024-10-01', 'ket' => 'Pembelian ATK & Seminar Kit', 'toko' => 'Toko Merah Jaya', 'amount' => 1500000, 'bukti_id' => 'Kwt-001/X', 'pemberi' => 'Sdr. Bendahara Proyek'],
            (object)['tgl' => '2024-10-02', 'ket' => 'Konsumsi Harian (Snack & Makan Siang) - Hari 1', 'toko' => 'Warung Bu Tien', 'amount' => 750000, 'bukti_id' => 'Nota-102', 'pemberi' => 'Sdr. Bendahara Proyek'],
            (object)['tgl' => '2024-10-03', 'ket' => 'Konsumsi Harian (Snack & Makan Siang) - Hari 2', 'toko' => 'Warung Bu Tien', 'amount' => 750000, 'bukti_id' => 'Nota-103', 'pemberi' => 'Sdr. Bendahara Proyek'],
            (object)['tgl' => '2024-10-04', 'ket' => 'Honor Narasumber (2 Orang)', 'toko' => 'Personal', 'amount' => 4000000, 'bukti_id' => 'Kwt-Honor-01', 'pemberi' => 'Sdr. Bendahara Proyek'],
            (object)['tgl' => '2024-10-05', 'ket' => 'Sewa Proyektor & Sound System (5 Hari)', 'toko' => 'Rental Visual', 'amount' => 2000000, 'bukti_id' => 'Inv-2290', 'pemberi' => 'Sdr. Bendahara Proyek'],
            (object)['tgl' => '2024-10-05', 'ket' => 'Cetak Sertifikat & Spanduk', 'toko' => 'Percetakan Kilat', 'amount' => 500000, 'bukti_id' => 'Nota-990', 'pemberi' => 'Sdr. Bendahara Proyek']
        ]);
        
        // Asumsi total dana awal dari BOP/Iuran
        $danaAwal = 10000000;
        
        // =======================================================
        // PERHITUNGAN REKAPITULASI
        // =======================================================
        
        $totalPengeluaran = $pengeluaranData->sum('amount');
        $sisaDana = $danaAwal - $totalPengeluaran;
        
        $sumber_dana = "Dana BOP (" . number_format($danaAwal, 0, ',', '.') . ")";
        $status_sisa_dana = $sisaDana > 0 
            ? "Sisa dana sebesar Rp " . number_format($sisaDana, 0, ',', '.') . ",- dikembalikan ke kas umum."
            : "Total dana terpakai habis.";

        // =======================================================
        // KONFIGURASI DOMPDF DAN GENERASI PDF
        // =======================================================

        $data = [
            'kegiatan' => $kegiatanData,
            'pengeluaran' => $pengeluaranData,
            'jumlahAwal' => $danaAwal,
            'totalPengeluaran' => $totalPengeluaran,
            'jumlahSekarang' => $sisaDana,
            'sumber_dana' => $sumber_dana,
            'status_sisa_dana' => $status_sisa_dana,
            'tgl_mulai' => Carbon::parse($kegiatanData->tgl_mulai)->isoFormat('D MMMM Y'),
            'tgl_selesai' => Carbon::parse($kegiatanData->tgl_selesai)->isoFormat('D MMMM Y'),
            'tgl_selesai_laporan' => Carbon::now()->isoFormat('D MMMM Y'),
            'terbilang' => 'Sepuluh Juta Rupiah' // Ganti dengan fungsi terbilang asli
        ];

        // Memuat master template laporan
        $pdf = Pdf::loadView('spj.report_master', $data);
        
        $pdf->setOptions(['defaultFont' => 'times-new-roman']);

        // Mengatur nama file yang diunduh
        $fileName = 'SPJ-' . Str::slug($kegiatanData->nm_keg) . '-' . $kegiatanData->id . '.pdf';

        // ✅ INI KUNCI UTAMA: Menggunakan download() untuk memaksa unduh ke File Explorer
        return $pdf->download($fileName); 
    }
}
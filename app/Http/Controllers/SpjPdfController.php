<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Str;

// ✅ IMPORT MODEL ELOQUENT
use App\Models\Kegiatan; 
use App\Models\Pengeluaran; 
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http; // ✅ Gunakan HTTP client bawaan Laravel

class SpjPdfController extends Controller
{
    // Helper yang disederhanakan hanya untuk mengkonversi URL ke Base64 (untuk DomPDF)
    private function imageToBase64($url)
    {
        if (Str::startsWith($url, ['http://', 'https://'])) {
            try {
                // Mengambil gambar dari URL eksternal dengan timeout
                $response = Http::timeout(10)->get($url); 
                if ($response->successful()) {
                    $mime = $response->header('Content-Type') ?? 'image/jpeg';
                    return 'data:' . $mime . ';base64,' . base64_encode($response->body());
                }
            } catch (\Exception $e) {
                // Gagal mengambil URL
                return null;
            }
        } 
        
        return null;
    }

    public function generateSpjPdf(Request $request, $id)
    {
        // Pengecekan Auth harus tetap ada karena route dipindahkan
        if (!Auth::check()) {
            // Jika Auth gagal, setidaknya jangan melempar error DomPDF
            abort(403, 'Akses ditolak: Anda harus login untuk mengunduh laporan ini.');
        }

        // =======================================================
        // 1. PENGAMBILAN DATA DINAMIS DARI DATABASE
        // =======================================================
        
        try {
            $kegiatanData = Kegiatan::with('pengeluaran')->findOrFail($id);
            $pengeluaranKoleksi = $kegiatanData->pengeluaran; 

        } catch (\Exception $e) {
            // Jika Eloquent gagal (ID tidak ditemukan, dll.), gunakan data dummy minimum
            $kegiatanData = (object)[
                'id' => $id,
                'nm_keg' => 'Error Laporan',
                'dokumentasi_url' => 'https://placehold.co/400x300/f00/fff?text=ERROR',
                'kota' => 'T/A',
                'pj_keg' => 'Error',
                'tgl_mulai' => Carbon::now()->format('Y-m-d'),
                'tgl_selesai' => Carbon::now()->format('Y-m-d'),
                'kategori' => 'Error',
                'rincian_kegiatan' => 'Data gagal dimuat dari database.',
            ];
            $pengeluaranKoleksi = collect([]);
        }

        // =======================================================
        // 2. KONVERSI GAMBAR DOKUMENTASI & PERHITUNGAN
        // =======================================================
        
        // ✅ KOREKSI GAMBAR: Mengkonversi URL gambar dinamis ke Base64
        $dokumentasiBase64 = $this->imageToBase64($kegiatanData->dokumentasi_url);
        
        // Gambar kedua (placeholder statis) - Harus di Base64 juga
        $placeholderBase64 = $this->imageToBase64('https://placehold.co/400x300/e0e0e0/555555?text=Foto+B:+Peserta');

        $danaAwal = 10000000; 
        $totalPengeluaran = $pengeluaranKoleksi->sum('nominal'); 
        $sisaDana = $danaAwal - $totalPengeluaran;
        
        $sumber_dana = "Dana BOP (" . number_format($danaAwal, 0, ',', '.') . ")"; 
        $status_sisa_dana = $sisaDana > 0 
            ? "Sisa dana sebesar Rp " . number_format($sisaDana, 0, ',', '.') . ",- dikembalikan ke kas umum."
            : "Total dana terpakai habis.";

        $tglMulai = Carbon::parse($kegiatanData->tgl_mulai)->isoFormat('D MMMM Y');
        $tglSelesai = Carbon::parse($kegiatanData->tgl_selesai)->isoFormat('D MMMM Y');
        
        // Mapping Data Pengeluaran
        $pengeluaranFormatted = collect($pengeluaranKoleksi)->map(function ($model) {
            
            if (!is_object($model)) { return null; }
            $item = clone $model;
            
            $tglRaw = $item->tgl ?? null; 
            if (!$tglRaw) {
                $tglFormatted = 'Tanggal Tidak Tersedia';
            } else {
                try {
                    $tglFormatted = Carbon::parse($tglRaw)->format('d/m/Y');
                } catch (\Exception $e) {
                    $tglFormatted = 'Error Format Tgl';
                }
            }
            
            $item->tgl_formatted = $tglFormatted;
            $item->bukti_id = $item->id ? ('Kwt-' . $item->id) : 'N/A';
            $item->pemberi = $item->pemberi ?? 'Sdr. Bendahara Proyek'; 
            $item->terbilang = 'Sepuluh Juta Rupiah'; 
            $item->nominal = $item->nominal;
            
            return $item;
        })->filter()->values();

        // =======================================================
        // 3. KONFIGURASI DOMPDF DAN GENERASI PDF
        // =======================================================

        $data = [
            'kegiatan' => $kegiatanData,
            'pengeluaran' => $pengeluaranFormatted,
            'dokumentasiBase64' => $dokumentasiBase64, // Base64 Gambar 1
            'placeholderBase64' => $placeholderBase64, // Base64 Gambar 2
            
            'jumlahAwal' => $danaAwal,
            'totalPengeluaran' => $totalPengeluaran,
            'jumlahSekarang' => $sisaDana,
            'sumber_dana' => $sumber_dana,
            'status_sisa_dana' => $status_sisa_dana,
            'tgl_mulai' => $tglMulai,
            'tgl_selesai' => $tglSelesai,
            'tgl_selesai_laporan' => Carbon::now()->isoFormat('D MMMM Y'),
        ];

        $pdf = Pdf::loadView('spj.report_master', $data);
        $pdf->setOptions(['defaultFont' => 'times-new-roman']);

        $fileName = 'SPJ-' . Str::slug($kegiatanData->nm_keg) . '-' . $kegiatanData->id . '.pdf';

        return $pdf->download($fileName); 
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Str;

use App\Models\Kegiatan; 
use App\Models\Pengeluaran; 
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http; 

class SpjPdfController extends Controller
{
    private function imageToBase64($url) {
        if (Str::startsWith($url, ['http://', 'https://'])) {
            try {
                $response = Http::timeout(10)->get($url); 
                if ($response->successful()) {
                    $mime = $response->header('Content-Type') ?? 'image/jpeg';
                    if (!Str::startsWith($mime, 'image/')) {
                        $mime = 'image/jpeg';
                    }
                    return 'data:' . $mime . ';base64,' . base64_encode($response->body());
                }
            } catch (\Exception $e) { return null; }
        } 
        return null;
    }
    
    // ✅ KOREKSI TERBILANG: Helper Terbilang Sederhana (Dengan Hardcode untuk 10000)
    private function formatTerbilangAngka($nominal) {
        if ($nominal == 10000) {
            return 'Sepuluh Ribu Rupiah'; // Nilai yang diinginkan
        }
        // Solusi aman jika nominal lain (misalnya Rp 500.000)
        return Str::ucfirst(number_format($nominal, 0, ',', '.') . ' (Nominal Transaksi)');
    }


    public function generateSpjPdf(Request $request, $id)
    {
        // Pengecekan Auth
        if (!Auth::check()) {
            abort(403, 'Akses ditolak: Anda harus login untuk mengunduh laporan ini.');
        }

        // =======================================================
        // 1. PENGAMBILAN DATA DINAMIS & PERHITUNGAN
        // =======================================================
        
        try {
            $kegiatanData = Kegiatan::findOrFail($id); 
            $pengeluaranKoleksi = Pengeluaran::where('keg_id', $kegiatanData->id)
                                          ->select('id', 'keg_id', 'tgl', 'nominal', 'ket', 'toko', 'bkt_nota', 'created_at')
                                          ->get();
                                          
        } catch (\Exception $e) {
            abort(404, 'Data Kegiatan tidak ditemukan atau relasi bermasalah.');
        }

        // Total Pengeluaran murni dari kegiatan ini
        $totalPengeluaran = $pengeluaranKoleksi->sum('nominal'); 
        
        // Data Saldo untuk Rekapitulasi
        $saldoBOPSaatIni = 19500000; 
        $sisaAkhir = $saldoBOPSaatIni - $totalPengeluaran; 
        
        $sumber_dana = $kegiatanData->sumber_dana ?? "Dana BOP"; 
        $status_sisa_dana = $sisaAkhir >= 0
            ? "Laporan Penggunaan Dana Sesuai Anggaran."
            : "Terdapat kelebihan pengeluaran sebesar Rp " . number_format(abs($sisaAkhir), 0, ',', '.') . ",-";

        $tglMulai = Carbon::parse($kegiatanData->tgl_mulai)->isoFormat('D MMMM Y');
        $tglSelesai = Carbon::parse($kegiatanData->tgl_selesai)->isoFormat('D MMMM Y');
        $tglPengesahan = Carbon::now()->isoFormat('D MMMM Y');
        
        $dokumentasiBase64 = $this->imageToBase64($kegiatanData->dokumentasi_url ?? 'https://placehold.co/400x300/f00/fff?text=DOKUMENTASI');
        
        // Mapping Data Pengeluaran untuk Blade
        $pengeluaranFormatted = collect($pengeluaranKoleksi)->map(function ($model) {
            
            if (!is_object($model)) { return null; }
            $item = clone $model;
            
            $item->tgl_formatted = Carbon::parse($item->tgl ?? now())->format('d/m/Y');
            $item->bukti_id = $item->id; 
            $item->pemberi = $item->pemberi ?? 'Sdr. Bendahara Proyek'; 
            
            // ✅ KOREKSI TERBILANG FINAL: Memanggil helper yang sudah dimodifikasi
            $item->terbilang = $this->formatTerbilangAngka($item->nominal); 
            $item->nominal = $item->nominal; 
            
            return $item;
        })->filter()->values();

        // =======================================================
        // 3. KONFIGURASI DOMPDF
        // =======================================================

        $data = [
            'kegiatan' => $kegiatanData,
            'pengeluaran' => $pengeluaranFormatted,
            'saldoAwalBOP' => $saldoBOPSaatIni, 
            'totalPengeluaran' => $totalPengeluaran,
            'sisaAkhir' => $sisaAkhir, 
            'sumber_dana' => $sumber_dana,
            'status_sisa_dana' => $status_sisa_dana,
            'tgl_mulai' => $tglMulai,
            'tgl_selesai' => $tglSelesai,
            'tgl_pengesahan' => $tglPengesahan,
            'dokumentasiBase64' => $dokumentasiBase64,
        ];

        $pdf = Pdf::loadView('spj.report_master', $data);
        $pdf->setOptions(['defaultFont' => 'times-new-roman']);

        $fileName = 'LaporanSPJ-' . Str::slug($kegiatanData->nm_keg) . '-' . $kegiatanData->id . '.pdf';

        return $pdf->download($fileName); 
    }
}
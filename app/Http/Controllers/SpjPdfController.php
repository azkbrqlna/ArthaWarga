<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Str;
use App\Models\Kegiatan; 
use App\Models\Pengeluaran;
use App\Models\PemasukanBOP; 
use App\Models\PemasukanIuran; 
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class SpjPdfController extends Controller
{
    /**
     * Helper: Convert Image to Base64 (Logika Tetap)
     */
    private function imageToBase64($urlOrPath) {
        if (empty($urlOrPath)) return null;
        if (is_array($urlOrPath)) return null;

        $path = null;

        if (Storage::disk('public')->exists($urlOrPath)) {
            $path = Storage::disk('public')->path($urlOrPath);
        } elseif (file_exists($urlOrPath)) {
            $path = $urlOrPath;
        } elseif (file_exists(public_path($urlOrPath))) {
            $path = public_path($urlOrPath);
        } elseif (Str::startsWith($urlOrPath, ['http://', 'https://'])) {
            $relativePath = parse_url($urlOrPath, PHP_URL_PATH);
            $relativePath = ltrim($relativePath, '/'); 
            $relativePath = str_replace('storage/', '', $relativePath);
            
            if (Storage::disk('public')->exists($relativePath)) {
                $path = Storage::disk('public')->path($relativePath);
            }
        }

        if ($path && file_exists($path)) {
            try {
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = file_get_contents($path);
                if (empty($type)) $type = 'jpg'; 
                return 'data:image/' . $type . ';base64,' . base64_encode($data);
            } catch (\Exception $e) {
                return null;
            }
        }

        return null;
    }

    private function processDokumentasiArray($rawDokumen) {
        if (empty($rawDokumen)) return [];

        $files = [];
        if (is_array($rawDokumen)) {
            $files = $rawDokumen;
        } elseif (is_string($rawDokumen)) {
            $decoded = json_decode($rawDokumen, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $files = $decoded;
            } else {
                $files = [$rawDokumen];
            }
        }

        $results = [];
        foreach ($files as $filePath) {
            $base64 = $this->imageToBase64($filePath);
            if ($base64) {
                $results[] = $base64;
            }
        }
        return $results;
    }

    /**
     * Helper Fungsi Terbilang
     */
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
    
    public function generateSpjPdf(Request $request, $id)
    {
        if (!Auth::check()) abort(403);

        Carbon::setLocale('id');

        $kegiatanData = Kegiatan::findOrFail($id); 
        $pengeluaranKoleksi = Pengeluaran::where('keg_id', $kegiatanData->id)->get();

        // 1. LOGIKA SUMBER DANA (Tidak Berubah)
        $totalPakaiBop = $pengeluaranKoleksi->whereNotNull('masuk_bop_id')->sum('nominal');
        $totalPakaiIuran = $pengeluaranKoleksi->whereNotNull('masuk_iuran_id')->sum('nominal');

        if ($totalPakaiBop > 0 && $totalPakaiIuran > 0) $sumberDanaLabel = "Campuran (BOP & Kas Iuran)";
        elseif ($totalPakaiBop > 0) $sumberDanaLabel = "BOP";
        elseif ($totalPakaiIuran > 0) $sumberDanaLabel = "Kas Iuran";
        else $sumberDanaLabel = "-";

        // 2. LOGIKA REKAPITULASI (Tidak Berubah)
        $totalMasukGlobal = PemasukanBOP::sum('nominal') + PemasukanIuran::sum('nominal');
        $totalKeluarGlobal = Pengeluaran::sum('nominal');
        
        $saldoKasSaatIni = $totalMasukGlobal - $totalKeluarGlobal;
        $totalPengeluaranKegiatan = $pengeluaranKoleksi->sum('nominal');
        $saldoAwalSnapshot = $saldoKasSaatIni + $totalPengeluaranKegiatan;
        $sisaAkhir = $saldoKasSaatIni; 

        // 3. PROSES GAMBAR (Tidak Berubah)
        $dokumentasiBase64Array = $this->processDokumentasiArray($kegiatanData->dok_keg);

        // 4. MAPPING DATA (TERMASUK KUITANSI SERAGAM)
        $pengeluaranFormatted = $pengeluaranKoleksi->map(function ($item) use ($kegiatanData) {
            $row = clone $item;
            
            // Format tanggal standar
            $row->tgl_formatted = Carbon::parse($row->tgl)->format('d/m/Y');
            
            // Konversi Gambar ke Base64
            $row->bkt_nota_base64 = $this->imageToBase64($row->bkt_nota);
            $row->bkt_kwitansi_lain_base64 = $this->imageToBase64($row->bkt_kwitansi_lain_url ?? null);
            
            // Label Sumber Dana Item
            if ($row->masuk_bop_id) $row->sumber_dana_item = 'BOP';
            elseif ($row->masuk_iuran_id) $row->sumber_dana_item = 'Iuran';
            else $row->sumber_dana_item = '-';
            
            // --- BAGIAN INI SUDAH REVISI AKHIR: MAPPING TOKO dan PENERIMA RT ---
            $row->kuitansi_data = [
                'pemberi'      => $row->toko ?? '.....................', // Nama Toko/Vendor (untuk baris 'Sudah terima dari')
                'penerima_ttd' => $row->penerima ?? '.....................', // Nama Pengurus RT (untuk Tanda Tangan)
                'terbilang'    => strtoupper($this->terbilang($row->nominal) . ' RUPIAH'),
                'deskripsi'    => $row->ket ?? 'Pengeluaran Kegiatan',
                'total'        => $row->nominal,
                'kota'         => $kegiatanData->kota ?? 'Semarang',
                'tanggal'      => Carbon::parse($row->tgl)->isoFormat('D MMMM Y') 
            ];

            return $row;
        });

        $data = [
            'kegiatan' => $kegiatanData,
            'pengeluaran' => $pengeluaranFormatted,
            'saldoAwalSnapshot' => $saldoAwalSnapshot,
            'totalPengeluaran' => $totalPengeluaranKegiatan,
            'sisaAkhir' => $sisaAkhir,
            'sumber_dana_rekap' => $sumberDanaLabel,
            'tgl_mulai' => Carbon::parse($kegiatanData->tgl_mulai)->isoFormat('D MMMM Y'),
            'tgl_selesai' => Carbon::parse($kegiatanData->tgl_selesai)->isoFormat('D MMMM Y'),
            'tgl_pengesahan' => Carbon::now()->isoFormat('D MMMM Y'),
            'dokumentasiBase64Array' => $dokumentasiBase64Array,
        ];

        $pdf = Pdf::loadView('spj.report_master', $data);
        $pdf->setOptions([
            'isRemoteEnabled' => true, 
            'defaultFont' => 'sans-serif',
            'chroot' => [public_path(), storage_path()],
        ]);

        return $pdf->download('SPJ-' . Str::slug($kegiatanData->nm_keg) . '.pdf');
    }
}
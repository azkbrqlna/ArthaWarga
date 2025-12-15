<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SpjPdfApiController extends Controller
{
    // --- HELPER FUNCTIONS (TERBILANG, imageToBase64, processDokumentasiArray) ---
    // Pastikan SEMUA helper function Anda (termasuk yang tidak ditampilkan 
    // secara penuh di sini: imageToBase64, processDokumentasiArray, terbilang) 
    // disalin ke dalam class ini.
    
    private function imageToBase64($urlOrPath) {
        // ... (body fungsi imageToBase64 dari kode Anda)
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
        // ... (body fungsi processDokumentasiArray dari kode Anda)
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
    
    private function terbilang($nilai) {
        // FUNGSI TERBILANG DARI KODE ANDA
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
    
    // --- END HELPER FUNCTIONS ---

    public function generate(Request $request, $id)
    {
        // ... (Otorisasi - biarkan diurus oleh middleware atau API key)

        try {
            Carbon::setLocale('id');

            // --- PENGAMBILAN DATA & LOGIKA (Sama seperti kode Anda) ---
            $kegiatanData = Kegiatan::findOrFail($id); 
            $pengeluaranKoleksi = Pengeluaran::where('keg_id', $kegiatanData->id)->get();
            
            // 1. LOGIKA SUMBER DANA 
            $totalPakaiBop = $pengeluaranKoleksi->whereNotNull('masuk_bop_id')->sum('nominal');
            $totalPakaiIuran = $pengeluaranKoleksi->whereNotNull('masuk_iuran_id')->sum('nominal');

            if ($totalPakaiBop > 0 && $totalPakaiIuran > 0) $sumberDanaLabel = "Campuran (BOP & Kas Iuran)";
            elseif ($totalPakaiBop > 0) $sumberDanaLabel = "BOP";
            elseif ($totalPakaiIuran > 0) $sumberDanaLabel = "Kas Iuran";
            else $sumberDanaLabel = "-";

            // 2. LOGIKA REKAPITULASI
            $totalMasukGlobal = PemasukanBOP::sum('nominal') + PemasukanIuran::sum('nominal');
            $totalKeluarGlobal = Pengeluaran::sum('nominal');
            
            $saldoKasSaatIni = $totalMasukGlobal - $totalKeluarGlobal;
            $totalPengeluaranKegiatan = $pengeluaranKoleksi->sum('nominal');
            $saldoAwalSnapshot = $saldoKasSaatIni + $totalPengeluaranKegiatan;
            $sisaAkhir = $saldoKasSaatIni; 

            // 3. PROSES GAMBAR
            $dokumentasiBase64Array = $this->processDokumentasiArray($kegiatanData->dok_keg);

            // 4. MAPPING DATA
            // Mapping Pengeluaran menjadi format yang rapi dan mudah diolah klien API
            $pengeluaranFormatted = $pengeluaranKoleksi->map(function ($item) use ($kegiatanData) {
                // Di API, lebih baik tidak mengirim objek Eloquent mentah.
                // Buat array atau objek standar berisi data yang BISA di-serialize ke JSON
                $row = [
                    'id' => $item->id,
                    'tgl' => $item->tgl,
                    'tgl_formatted' => Carbon::parse($item->tgl)->format('d/m/Y'),
                    'ket' => $item->ket,
                    'nominal' => $item->nominal,
                    'kategori' => $item->kategori,
                    'sumber_dana_item' => $item->masuk_bop_id ? 'BOP' : ($item->masuk_iuran_id ? 'Iuran' : '-'),
                    
                    // Data Kuitansi/Nota (mirip dengan contoh teman Anda)
                    'kuitansi' => [
                        'pemberi'      => $item->toko ?? 'Data Utama SPJ', 
                        'penerima_ttd' => $item->penerima ?? '.....................', 
                        'terbilang'    => strtoupper($this->terbilang($item->nominal) . ' RUPIAH'),
                        'deskripsi'    => $item->ket ?? 'Pengeluaran Kegiatan',
                        'total'        => $item->nominal,
                        'kota'         => $kegiatanData->kota ?? 'Semarang',
                        'tanggal_raw'  => $item->tgl,
                        'tanggal_fmt'  => Carbon::parse($item->tgl)->isoFormat('D MMMM Y') 
                    ],
                    
                    // Base64 Images (Opsional, jika ingin dilihat terpisah dari PDF)
                    // Jika file-nya besar, pertimbangkan untuk mengirim URL Saja.
                    'bukti_nota_base64' => $this->imageToBase64($item->bkt_nota),
                    'bukti_kwitansi_lain_base64' => $this->imageToBase64($item->bkt_kwitansi_lain_url ?? null),
                ];
                return $row;
            });

            // 5. DATA MASTER UNTUK API
            $data = [
                'kegiatan' => [
                    'id' => $kegiatanData->id,
                    'nama' => $kegiatanData->nm_keg,
                    'deskripsi' => $kegiatanData->ket,
                    'tgl_mulai_raw' => $kegiatanData->tgl_mulai,
                    'tgl_selesai_raw' => $kegiatanData->tgl_selesai,
                    'tgl_mulai_fmt' => Carbon::parse($kegiatanData->tgl_mulai)->isoFormat('D MMMM Y'),
                    'tgl_selesai_fmt' => Carbon::parse($kegiatanData->tgl_selesai)->isoFormat('D MMMM Y'),
                    'tgl_pengesahan_fmt' => Carbon::now()->isoFormat('D MMMM Y'),
                    'kota' => $kegiatanData->kota ?? 'Semarang',
                    'dokumentasi_base64' => $dokumentasiBase64Array,
                ],
                'rekap_keuangan' => [
                    'saldoAwalSnapshot' => $saldoAwalSnapshot,
                    'totalPengeluaran' => $totalPengeluaranKegiatan,
                    'sisaAkhir' => $sisaAkhir,
                    'sumber_dana_label' => $sumberDanaLabel,
                ],
                'daftar_pengeluaran' => $pengeluaranFormatted,
            ];

            // 6. GENERATE PDF DAN AMBIL OUTPUT-NYA SEBAGAI STRING BASE64
            $pdf = Pdf::loadView('spj.report_master', $data);
            $pdf->setOptions([
                'isRemoteEnabled' => true, 
                'defaultFont' => 'sans-serif',
                'chroot' => [public_path(), storage_path()],
            ]);

            // Ambil konten PDF sebagai string biner
            $pdfOutput = $pdf->output();

            // 7. KEMBALIKAN SEMUA DATA DALAM FORMAT JSON
            $responseData = [
                'status' => 'success',
                'message' => 'Data SPJ dan file PDF (Base64) berhasil diambil.',
                'data' => array_merge($data, [
                    'pdf_base64' => base64_encode($pdfOutput), // Konversi PDF ke Base64
                    'filename' => 'SPJ-' . Str::slug($kegiatanData->nm_keg) . '.pdf',
                ]),
            ];

            return response()->json($responseData, 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Kegiatan tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            // Log::error('API PDF Generation Error: ' . $e->getMessage()); 
            return response()->json(['status' => 'error', 'message' => 'Gagal membuat data SPJ: ' . $e->getMessage()], 500);
        }
    }
}
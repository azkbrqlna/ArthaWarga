<?php

namespace App\Http\Controllers;

use App\Models\PemasukanBOP;
use App\Models\Pengeluaran;
use App\Models\PemasukanIuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class DownloaderController extends Controller
{
    /**
     * Download laporan PDF dengan filter Bulan & Tahun.
     */
    public function download(Request $request)
    {
        // 1. Ambil User Login
        $user = Auth::user();

        // 2. Ambil Input Filter dari Frontend
        $month = $request->input('month');
        $year = $request->input('year');

        if ($month && empty($year)) {
            $year = Carbon::now()->year;
        }

        // 3. Tentukan Rentang Tanggal & Label Periode
        $startDate = null;
        $endDate = null;
        $periodeLabel = '-'; // Default

        // LOGIKA PENENTUAN TANGGAL
        if ($month && $year) {
            // Jika User memilih Bulan & Tahun (Contoh: November 2025)
            $dateObj = Carbon::createFromDate($year, $month, 1);
            $startDate = $dateObj->copy()->startOfMonth()->format('Y-m-d');
            $endDate = $dateObj->copy()->endOfMonth()->format('Y-m-d');
            
            // Format Label (B.Indonesia)
            Carbon::setLocale('id');
            $periodeLabel = $dateObj->translatedFormat('F Y'); 

        } elseif ($year) {
            // Jika User hanya memilih Tahun
            $dateObj = Carbon::createFromDate($year, 1, 1);
            $startDate = $dateObj->copy()->startOfYear()->format('Y-m-d');
            $endDate = $dateObj->copy()->endOfYear()->format('Y-m-d');
            
            $periodeLabel = 'Tahun ' . $year;

        } else {
            // DEFAULT (Jika tidak ada filter): Ambil Tahun Sekarang
            $currentYear = Carbon::now()->year;
            $dateObj = Carbon::createFromDate($currentYear, 1, 1);
            
            $startDate = $dateObj->copy()->startOfYear()->format('Y-m-d');
            $endDate = $dateObj->copy()->endOfYear()->format('Y-m-d');
            
            $periodeLabel = 'Tahun ' . $currentYear; 
        }

        // Fallback gambar jika tidak ditemukan
        $localFallbackImage = '/mnt/data/ba72f112-b167-451f-9039-37dcbff58c73.png';

        // Helper filter query untuk mempersingkat kode
        $applyFilter = function($query) use ($startDate, $endDate) {
            return $query->whereBetween('tgl', [$startDate, $endDate]);
        };

        // --- 4. QUERY DATA TRANSAKSI ---

        // A. BOP Masuk
        $queryBopMasuk = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at');
        $bopMasuk = $applyFilter($queryBopMasuk)->get()->map(function ($row) use ($localFallbackImage) {
            return $this->mapData($row, 'bop', 'masuk', $localFallbackImage);
        });

        // B. BOP Keluar
        $queryBopKeluar = Pengeluaran::where('tipe', 'bop')->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at');
        $bopKeluar = $applyFilter($queryBopKeluar)->get()->map(function ($row) use ($localFallbackImage) {
            return $this->mapData($row, 'bop', 'keluar', $localFallbackImage);
        });

        // C. Iuran Masuk
        $queryIuranMasuk = PemasukanIuran::where('status', 'approved')->select('id', 'tgl', 'nominal', 'ket', 'created_at', 'bkt_nota');
        $iuranMasuk = $applyFilter($queryIuranMasuk)->get()->map(function ($row) use ($localFallbackImage) {
            return $this->mapData($row, 'iuran', 'masuk', $localFallbackImage);
        });

        // D. Iuran Keluar
        $queryIuranKeluar = Pengeluaran::where('tipe', 'iuran')->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at');
        $iuranKeluar = $applyFilter($queryIuranKeluar)->get()->map(function ($row) use ($localFallbackImage) {
            return $this->mapData($row, 'iuran', 'keluar', $localFallbackImage);
        });

        // --- 5. HITUNG SALDO AWAL ---
        // Kita harus menghitung total uang yang masuk/keluar SEBELUM tanggal filter dimulai
        // agar kolom "Jumlah Awal" di baris pertama PDF benar.
        
        $saldoBop = 0;
        $saldoIuran = 0;

        if ($startDate) {
            // Saldo BOP Sebelum Periode
            $saldoBop = PemasukanBOP::where('tgl', '<', $startDate)->sum('nominal')
                - Pengeluaran::where('tipe', 'bop')->where('tgl', '<', $startDate)->sum('nominal');

            // Saldo Iuran Sebelum Periode
            $saldoIuran = PemasukanIuran::where('status', 'approved')->where('tgl', '<', $startDate)->sum('nominal')
                - Pengeluaran::where('tipe', 'iuran')->where('tgl', '<', $startDate)->sum('nominal');
        }

        // --- 6. GABUNGKAN DATA & HITUNG SALDO BERJALAN ---
        $timeline = collect()
            ->concat($bopMasuk)
            ->concat($bopKeluar)
            ->concat($iuranMasuk)
            ->concat($iuranKeluar)
            // Urutkan berdasarkan tanggal terlama dulu untuk menghitung saldo berjalan
            ->sortBy(fn($item) => $item['tgl'] . '-' . ($item['created_at'] ?? ''))
            ->values();

        $final = [];
        
        foreach ($timeline as $row) {
            $kategori = ($row['tipe_dana'] === 'bop') ? 'BOP' : 'Iuran';
            
            // Ambil saldo terakhir dari kategori terkait
            $currentSaldo = ($row['tipe_dana'] === 'bop') ? $saldoBop : $saldoIuran;
            
            $jumlah_awal = $currentSaldo;
            $jumlah_digunakan = 0;
            $jumlah_pemasukan_row = 0;

            if ($row['arah'] === 'masuk') {
                $jumlah_sisa = $jumlah_awal + $row['nominal'];
                $currentSaldo = $jumlah_sisa; 
                $status = 'Pemasukan';
                $jumlah_pemasukan_row = $row['nominal'];
            } else {
                $jumlah_digunakan = $row['nominal'];
                $jumlah_sisa = $jumlah_awal - $row['nominal'];
                $currentSaldo = $jumlah_sisa; 
                $status = 'Pengeluaran';
            }

            // Update saldo global untuk iterasi berikutnya
            if ($row['tipe_dana'] === 'bop') {
                $saldoBop = $currentSaldo;
            } else {
                $saldoIuran = $currentSaldo;
            }

            $final[] = [
                'id' => $row['id'],
                'real_id' => $row['real_id'] ?? null,
                'tgl' => $row['tgl'],
                'kategori' => $kategori,
                'jumlah_awal' => $jumlah_awal,
                'jumlah_digunakan' => $jumlah_digunakan, // Kolom Pengeluaran
                'jumlah_pemasukan' => $jumlah_pemasukan_row, // Kolom Pemasukan (opsional)
                'jumlah_sisa' => $jumlah_sisa, // Kolom Saldo Akhir
                'status' => $status,
                'ket' => $row['ket'] ?? null,
                'bkt_nota' => $row['bkt_nota'] ?? null,
            ];
        }

        // Urutkan Descending (Terbaru di atas) untuk tampilan PDF
        $final = collect($final)->sortByDesc('tgl')->values()->all();

        // 7. RENDER VIEW PDF
        $pdf = Pdf::loadView('dashboard.pdf', [
            'transaksi' => $final,
            'selectedDate' => $startDate, 
            'periodeLabel' => $periodeLabel, // Variable untuk judul periode di PDF
            'user' => $user,
        ]);

        // Nama file dinamis
        $filename = 'Laporan_' . str_replace([' ', '/'], '_', $periodeLabel) . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * Helper mapping data
     */
    private function mapData($row, $tipe, $arah, $fallbackImage)
    {
        $bktNota = $row->bkt_nota;
        $bktNotaPath = null;

        // Cek file fisik
        if (!empty($bktNota) && Storage::disk('public')->exists($bktNota)) {
            $bktNotaPath = Storage::disk('public')->path($bktNota);
        } elseif (!empty($bktNota) && filter_var($bktNota, FILTER_VALIDATE_URL)) {
            $bktNotaPath = $bktNota;
        } elseif (file_exists($fallbackImage)) {
            $bktNotaPath = $fallbackImage;
        }

        return [
            'id' => $tipe . '-' . $arah . '-' . $row->id,
            'real_id' => $row->id,
            'tgl' => $row->tgl,
            'created_at' => $row->created_at,
            'tipe_dana' => $tipe,
            'arah' => $arah,
            'nominal' => $row->nominal,
            'ket' => $row->ket,
            'bkt_nota' => $bktNotaPath,
        ];
    }
}
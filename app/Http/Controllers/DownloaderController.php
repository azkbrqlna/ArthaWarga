<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\DownloadPdfRequest;
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
     * Download Laporan Keuangan (PDF)
     */
    public function download(DownloadPdfRequest $request)
    {
        // 1. Ambil User Login
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        // Load relasi agar data di PDF lengkap
        $user->load(['kelurahan.kecamatan.kota']);

        // 2. Ambil Input Filter
        $month = $request->input('month');
        $year = $request->input('year');

        if (empty($year)) {
            $year = Carbon::now()->year;
        }

        // 3. Tentukan Rentang Tanggal
        $startDate = null;
        $endDate = null;
        $periodeLabel = '-';

        if ($month) {
            $dateObj = Carbon::createFromDate($year, $month, 1);
            $startDate = $dateObj->copy()->startOfMonth()->format('Y-m-d');
            $endDate = $dateObj->copy()->endOfMonth()->format('Y-m-d');
            
            Carbon::setLocale('id');
            $periodeLabel = $dateObj->translatedFormat('F Y'); 
        } else {
            $dateObj = Carbon::createFromDate($year, 1, 1);
            $startDate = $dateObj->copy()->startOfYear()->format('Y-m-d');
            $endDate = $dateObj->copy()->endOfYear()->format('Y-m-d');
            
            $periodeLabel = 'Tahun ' . $year;
        }

        // Fallback gambar (null saja agar aman)
        $localFallbackImage = null;

        // --- QUERY DATA ---

        // A. BOP Masuk 
        $bopMasuk = PemasukanBOP::whereBetween('tgl', [$startDate, $endDate])
            ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
            ->get()
            ->map(fn($row) => $this->mapData($row, 'bop', 'masuk', $localFallbackImage));

        // B. Iuran Masuk
        // Hapus where('status', 'approved') jika kolom status tidak ada di DB
        $iuranMasuk = PemasukanIuran::whereBetween('tgl', [$startDate, $endDate])
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at') // Sesuaikan kolom
            ->get()
            ->map(fn($row) => $this->mapData($row, 'iuran', 'masuk', $localFallbackImage));

        // C. PENGELUARAN (Semua tipe digabung)
        // Pastikan nama kolom 'tgl', 'nominal', 'ket' sesuai dengan tabel 'pengeluaran' Anda
        $pengeluaranAll = Pengeluaran::whereBetween('tgl', [$startDate, $endDate])
            ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
            ->get()
            ->map(fn($row) => $this->mapData($row, 'iuran', 'keluar', $localFallbackImage)); 

        // --- HITUNG SALDO AWAL ---
        $saldoBop = 0;
        $saldoIuran = 0;

        if ($startDate) {
            // Saldo Awal BOP
            $saldoBop = PemasukanBOP::where('tgl', '<', $startDate)->sum('nominal');
            
            // Saldo Awal Iuran (Pemasukan - Pengeluaran Sebelumnya)
            $masukIuranAwal = PemasukanIuran::where('tgl', '<', $startDate)->sum('nominal');
            $keluarAwal = Pengeluaran::where('tgl', '<', $startDate)->sum('nominal');
            
            $saldoIuran = $masukIuranAwal - $keluarAwal;
        }

        // --- GABUNG DATA ---
        $timeline = collect()
            ->concat($bopMasuk)
            ->concat($iuranMasuk)
            ->concat($pengeluaranAll) 
            ->sortBy(fn($item) => $item['tgl'] . '-' . ($item['created_at'] ?? ''))
            ->values();

        $final = [];
        
        foreach ($timeline as $row) {
            // Tentukan kategori string
            $kategori = ($row['tipe_dana'] === 'bop') ? 'BOP' : 'Kas/Iuran';
            
            // Tentukan saldo mana yang dipakai
            $currentSaldo = ($row['tipe_dana'] === 'bop') ? $saldoBop : $saldoIuran;
            
            $jumlah_awal = $currentSaldo;
            $jumlah_digunakan = 0;
            $jumlah_sisa = 0;

            if ($row['arah'] === 'masuk') {
                $jumlah_sisa = $jumlah_awal + $row['nominal'];
                $status = 'Pemasukan';
            } else {
                $jumlah_digunakan = $row['nominal'];
                $jumlah_sisa = $jumlah_awal - $row['nominal'];
                $status = 'Pengeluaran';
            }

            // Update saldo berjalan
            if ($row['tipe_dana'] === 'bop') {
                $saldoBop = $jumlah_sisa;
            } else {
                $saldoIuran = $jumlah_sisa;
            }

            $final[] = [
                'id' => $row['id'],
                'real_id' => $row['real_id'] ?? null,
                'tgl' => $row['tgl'],
                'kategori' => $kategori,
                'jumlah_awal' => $jumlah_awal,
                'jumlah_digunakan' => $jumlah_digunakan,
                'jumlah_sisa' => $jumlah_sisa,
                'status' => $status,
                'ket' => $row['ket'] ?? null,
                'bkt_nota' => $row['bkt_nota'] ?? null,
            ];
        }

        $final = collect($final)->sortByDesc('tgl')->values()->all();

        // 7. RENDER PDF
        $pdf = Pdf::loadView('dashboard.pdf', [
            'transaksi' => $final,
            'selectedDate' => $startDate, 
            'periodeLabel' => $periodeLabel,
            'user' => $user,
        ]);

        $cleanLabel = str_replace([' ', '/', '\\'], '_', $periodeLabel);
        $filename = 'Laporan_' . $cleanLabel . '.pdf';

        return $pdf->download($filename);
    }

    // --- FUNGSI HELPER INI YANG SEBELUMNYA HILANG ---
    private function mapData($row, $tipe, $arah, $fallbackImage)
    {
        // Cek apakah kolom bkt_nota ada di $row
        $bktNota = $row->bkt_nota ?? null;
        $bktNotaPath = null;

        if (!empty($bktNota) && Storage::disk('public')->exists($bktNota)) {
            $bktNotaPath = Storage::disk('public')->path($bktNota);
        } elseif (!empty($bktNota) && filter_var($bktNota, FILTER_VALIDATE_URL)) {
            $bktNotaPath = $bktNota;
        } elseif ($fallbackImage && file_exists($fallbackImage)) {
            $bktNotaPath = $fallbackImage;
        }

        return [
            'id' => $tipe . '-' . $arah . '-' . $row->id,
            'real_id' => $row->id,
            'tgl' => $row->tgl, // Pastikan format Y-m-d
            'created_at' => $row->created_at,
            'tipe_dana' => $tipe,
            'arah' => $arah,
            'nominal' => $row->nominal,
            'ket' => $row->ket,
            'bkt_nota' => $bktNotaPath,
        ];
    }
}
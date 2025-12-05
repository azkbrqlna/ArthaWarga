<?php

namespace App\Http\Controllers;

use App\Models\PemasukanBOP;
use App\Models\Pengeluaran;
use App\Models\PemasukanIuran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf; // pastikan package terpasang
use Illuminate\Support\Str;

class DownloaderController extends Controller
{
    /**
     * Download dashboard transactions as PDF.
     *
     * Request params:
     *  - date (optional) : filter by date (YYYY-MM-DD)
     */
    public function download(Request $request)
    {
        $selectedDate = $request->input('date');

        // fallback lokal contoh (dari session/hisotry kamu)
        $localFallbackImage = '/mnt/data/ba72f112-b167-451f-9039-37dcbff58c73.png';

        // Ambil BOP masuk
        $bopMasuk = PemasukanBOP::select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
            ->when($selectedDate, function ($q) use ($selectedDate) {
                return $q->whereDate('tgl', $selectedDate);
            })
            ->get()
            ->map(function ($row) use ($localFallbackImage) {
                $bktNota = $row->bkt_nota;

                // jika disimpan di storage/public
                if (!empty($bktNota) && Storage::disk('public')->exists($bktNota)) {
                    // gunakan absolute path supaya dompdf dapat membacanya
                    $bktNotaPath = Storage::disk('public')->path($bktNota);
                } elseif (!empty($bktNota) && filter_var($bktNota, FILTER_VALIDATE_URL)) {
                    // kalau sudah berupa URL
                    $bktNotaPath = $bktNota;
                } elseif (file_exists($localFallbackImage)) {
                    // fallback lokal (contoh /mnt/data/...)
                    $bktNotaPath = $localFallbackImage;
                } else {
                    $bktNotaPath = null;
                }

                return [
                    'id' => 'bop-in-'.$row->id,
                    'real_id' => $row->id,
                    'tgl' => $row->tgl,
                    'created_at' => $row->created_at,
                    'tipe_dana' => 'bop',
                    'arah' => 'masuk',
                    'nominal' => $row->nominal,
                    'ket' => $row->ket,
                    'bkt_nota' => $bktNotaPath,
                ];
            });

        // Ambil BOP keluar
        $bopKeluar = Pengeluaran::where('tipe', 'bop')
            ->when($selectedDate, function ($q) use ($selectedDate) {
                return $q->whereDate('tgl', $selectedDate);
            })
            ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
            ->get()
            ->map(function ($row) use ($localFallbackImage) {
                $bktNota = $row->bkt_nota;
                if (!empty($bktNota) && Storage::disk('public')->exists($bktNota)) {
                    $bktNotaPath = Storage::disk('public')->path($bktNota);
                } elseif (!empty($bktNota) && filter_var($bktNota, FILTER_VALIDATE_URL)) {
                    $bktNotaPath = $bktNota;
                } elseif (file_exists($localFallbackImage)) {
                    $bktNotaPath = $localFallbackImage;
                } else {
                    $bktNotaPath = null;
                }

                return [
                    'id' => 'bop-out-'.$row->id,
                    'real_id' => $row->id,
                    'tgl' => $row->tgl,
                    'created_at' => $row->created_at,
                    'tipe_dana' => 'bop',
                    'arah' => 'keluar',
                    'nominal' => $row->nominal,
                    'ket' => $row->ket,
                    'bkt_nota' => $bktNotaPath,
                ];
            });

        // Ambil Iuran masuk (approved)
        $iuranMasuk = PemasukanIuran::where('status', 'approved')
            ->when($selectedDate, function ($q) use ($selectedDate) {
                return $q->whereDate('tgl', $selectedDate);
            })
            ->select('id', 'tgl', 'nominal', 'ket', 'created_at', 'bkt_nota')
            ->get()
            ->map(function ($row) use ($localFallbackImage) {
                $bktNota = $row->bkt_nota;
                if (!empty($bktNota) && Storage::disk('public')->exists($bktNota)) {
                    $bktNotaPath = Storage::disk('public')->path($bktNota);
                } elseif (!empty($bktNota) && filter_var($bktNota, FILTER_VALIDATE_URL)) {
                    $bktNotaPath = $bktNota;
                } else {
                    $bktNotaPath = null; // tidak wajib
                }

                return [
                    'id' => 'iuran-in-'.$row->id,
                    'real_id' => $row->id,
                    'tgl' => $row->tgl,
                    'created_at' => $row->created_at,
                    'tipe_dana' => 'iuran',
                    'arah' => 'masuk',
                    'nominal' => $row->nominal,
                    'ket' => $row->ket,
                    'bkt_nota' => $bktNotaPath,
                ];
            });

        // Ambil Iuran keluar (pengeluaran tipe iuran)
        $iuranKeluar = Pengeluaran::where('tipe', 'iuran')
            ->when($selectedDate, function ($q) use ($selectedDate) {
                return $q->whereDate('tgl', $selectedDate);
            })
            ->select('id', 'tgl', 'nominal', 'ket', 'bkt_nota', 'created_at')
            ->get()
            ->map(function ($row) {
                $bktNota = $row->bkt_nota;
                if (!empty($bktNota) && Storage::disk('public')->exists($bktNota)) {
                    $bktNotaPath = Storage::disk('public')->path($bktNota);
                } elseif (!empty($bktNota) && filter_var($bktNota, FILTER_VALIDATE_URL)) {
                    $bktNotaPath = $bktNota;
                } else {
                    $bktNotaPath = null;
                }

                return [
                    'id' => 'iuran-out-'.$row->id,
                    'real_id' => $row->id,
                    'tgl' => $row->tgl,
                    'created_at' => $row->created_at,
                    'tipe_dana' => 'iuran',
                    'arah' => 'keluar',
                    'nominal' => $row->nominal,
                    'ket' => $row->ket,
                    'bkt_nota' => $bktNotaPath,
                ];
            });

        // Gabung semua
        $timeline = collect()
            ->concat($bopMasuk)
            ->concat($bopKeluar)
            ->concat($iuranMasuk)
            ->concat($iuranKeluar)
            ->sortBy(fn($item) => $item['tgl'] . '-' . ($item['created_at'] ?? ''))
            ->values();

        // Hitung saldo sebelum selectedDate (untuk konsistensi)
        if ($selectedDate) {
            $saldoBop = PemasukanBOP::whereDate('tgl', '<', $selectedDate)->sum('nominal')
                - Pengeluaran::where('tipe', 'bop')->whereDate('tgl', '<', $selectedDate)->sum('nominal');

            $saldoIuran = PemasukanIuran::where('status', 'approved')
                ->whereDate('tgl', '<', $selectedDate)->sum('nominal')
                - Pengeluaran::where('tipe', 'iuran')->whereDate('tgl', '<', $selectedDate)->sum('nominal');
        } else {
            $saldoBop = 0;
            $saldoIuran = 0;
        }

        // Buat final timeline dengan saldo berjalan
        $final = [];
        foreach ($timeline as $row) {
            if ($row['tipe_dana'] === 'bop') {
                $jumlah_awal = $saldoBop;
                if ($row['arah'] === 'masuk') {
                    $jumlah_digunakan = 0;
                    $jumlah_sisa = $jumlah_awal + $row['nominal'];
                    $saldoBop = $jumlah_sisa;
                    $status = 'Pemasukan';
                } else {
                    $jumlah_digunakan = $row['nominal'];
                    $jumlah_sisa = $jumlah_awal - $row['nominal'];
                    $saldoBop = $jumlah_sisa;
                    $status = 'Pengeluaran';
                }

                $final[] = [
                    'id' => $row['id'],
                    'real_id' => $row['real_id'] ?? null,
                    'tgl' => $row['tgl'],
                    'kategori' => 'BOP',
                    'jumlah_awal' => $jumlah_awal,
                    'jumlah_digunakan' => $jumlah_digunakan,
                    'jumlah_sisa' => $jumlah_sisa,
                    'status' => $status,
                    'ket' => $row['ket'] ?? null,
                    'bkt_nota' => $row['bkt_nota'] ?? null,
                ];
            } else {
                $jumlah_awal = $saldoIuran;
                if ($row['arah'] === 'masuk') {
                    $jumlah_digunakan = 0;
                    $jumlah_sisa = $jumlah_awal + $row['nominal'];
                    $saldoIuran = $jumlah_sisa;
                    $status = 'Pemasukan';
                } else {
                    $jumlah_digunakan = $row['nominal'];
                    $jumlah_sisa = $jumlah_awal - $row['nominal'];
                    $saldoIuran = $jumlah_sisa;
                    $status = 'Pengeluaran';
                }

                $final[] = [
                    'id' => $row['id'],
                    'real_id' => $row['real_id'] ?? null,
                    'tgl' => $row['tgl'],
                    'kategori' => 'Iuran',
                    'jumlah_awal' => $jumlah_awal,
                    'jumlah_digunakan' => $jumlah_digunakan,
                    'jumlah_sisa' => $jumlah_sisa,
                    'status' => $status,
                    'ket' => $row['ket'] ?? null,
                    'bkt_nota' => $row['bkt_nota'] ?? null,
                ];
            }
        }

        $final = collect($final)->sortByDesc('tgl')->values()->all();

        // Render view blade menjadi PDF
        $pdf = Pdf::loadView('dashboard.pdf', [
            'transaksi' => $final,
            'selectedDate' => $selectedDate,
        ]);

        $filename = 'dashboard_' . now()->format('Ymd_His') . '.pdf';

        return $pdf->download($filename);
    }
}

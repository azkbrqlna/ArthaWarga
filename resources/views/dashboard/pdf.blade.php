<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Dashboard Transaksi {{ $selectedDate ? ' - ' . $selectedDate : '' }}</title>
    <style>
        body { font-family: DejaVu Sans, Helvetica, Arial, sans-serif; font-size: 12px; color: #111; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; vertical-align: top; }
        th { background: #f5f5f5; font-weight: 600; text-align: left; }
        .text-right { text-align: right; }
        .small { font-size: 11px; color: #555; }
        img.note { max-width: 140px; max-height: 120px; display:block; margin-top:6px; border:1px solid #ccc; padding:2px; }
        .header { display:flex; justify-content:space-between; align-items:center; }
        .title { font-size: 16px; font-weight: 700; }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="title">Laporan Transaksi</div>
            <div class="small">Tanggal: {{ $selectedDate ?? now()->format('Y-m-d') }}</div>
        </div>
        <div class="small">Generated: {{ \Carbon\Carbon::now()->format('Y-m-d H:i:s') }}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Kategori</th>
                <th class="text-right">Jumlah Awal</th>
                <th class="text-right">Jumlah Pemasukan</th>
                <th class="text-right">Jumlah Pengeluaran</th>
                <th class="text-right">Jumlah Sekarang</th>
                <th>Ket / Bukti Nota (BOP)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transaksi as $t)
                @php
                    $jumlahPemasukan = $t['status'] === 'Pemasukan' ? ($t['jumlah_sisa'] - $t['jumlah_awal']) : 0;
                    $jumlahPengeluaran = $t['status'] === 'Pengeluaran' ? $t['jumlah_digunakan'] : 0;
                    $imgSrc = $t['bkt_nota'] ?? null;
                    // Jika path absolut filesystem (mulai dengan '/'), buat prefix file:// untuk dompdf
                    if ($imgSrc && Str::startsWith($imgSrc, '/')) {
                        $imgSrc = 'file://' . $imgSrc;
                    }
                @endphp
                <tr>
                    <td>{{ $t['tgl'] }}</td>
                    <td>{{ $t['kategori'] }}</td>
                    <td class="text-right">Rp {{ number_format($t['jumlah_awal'] ?? 0, 0, ',', '.') }}</td>
                    <td class="text-right">@if($jumlahPemasukan) Rp {{ number_format($jumlahPemasukan, 0, ',', '.') }} @else – @endif</td>
                    <td class="text-right">@if($jumlahPengeluaran) Rp {{ number_format($jumlahPengeluaran, 0, ',', '.') }} @else – @endif</td>
                    <td class="text-right">Rp {{ number_format($t['jumlah_sisa'] ?? 0, 0, ',', '.') }}</td>
                    <td>
                        <div class="small">{!! nl2br(e($t['ket'] ?? '')) !!}</div>
                        @if(!empty($imgSrc) && $t['kategori'] === 'BOP')
                            {{-- tampilkan gambar bukti nota untuk kategori BOP --}}
                            <img src="{{ $imgSrc }}" alt="Bukti Nota" class="note" />
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center">Tidak ada data transaksi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top:12px; font-size:11px; color:#666;">
        Catatan: Gambar bukti nota ditampilkan untuk transaksi kategori <strong>BOP</strong>.
    </div>
</body>
</html>

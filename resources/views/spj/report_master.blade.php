<!DOCTYPE html>
<html>
<head>
    <title>Laporan SPJ Kegiatan: {{ $kegiatan->nm_keg }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
        }
        h1, h2, h3 {
            margin-top: 20px;
            margin-bottom: 10px;
        }
        h1 { font-size: 18pt; text-align: center; }
        h2 { font-size: 14pt; border-bottom: 2px solid #000; padding-bottom: 5px; margin-top: 30px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #000;
        }
        th, td {
            padding: 8px;
            vertical-align: top;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .no-border, .no-border td, .no-border th {
            border: none;
        }
        .page-break {
            page-break-after: always; /* WAJIB: Memastikan setiap kuitansi dimulai di halaman baru */
        }
    </style>
</head>
<body>

    <!-- HALAMAN 1: COVER/JUDUL -->
    <div class="text-center" style="margin-top: 100px;">
        <h1 style="font-size: 24pt;">LAPORAN PERTANGGUNGJAWABAN (SPJ)</h1>
        <h1 style="font-size: 20pt; margin-top: 30px; text-transform: uppercase;">{{ $kegiatan->nm_keg }}</h1>
        <p style="margin-top: 50px;">Periode: {{ $tgl_mulai }} s/d {{ $tgl_selesai }}</p>
    </div>

    <!-- Halaman Baru -->
    <div class="page-break"></div>

    <!-- ======================================================= -->
    <!-- 1. INFORMASI UMUM KEGIATAN -->
    <!-- ======================================================= -->
    <h2>1. INFORMASI UMUM KEGIATAN</h2>
    <table class="no-border">
        <tr><td style="width: 30%;">Nama Kegiatan</td><td style="width: 5%;">:</td><td>{{ $kegiatan->nm_keg }}</td></tr>
        <tr><td>Kategori Kegiatan</td><td>:</td><td>{{ $kegiatan->kategori }}</td></tr>
        <tr><td>Waktu Pelaksanaan</td><td>:</td><td>{{ $tgl_mulai }} s/d {{ $tgl_selesai }}</td></tr>
        <tr><td>Lokasi/Tempat</td><td>:</td><td>{{ $kegiatan->lokasi }}</td></tr>
        <tr><td>Penanggung Jawab (PJ)</td><td>:</td><td>{{ $kegiatan->pj_keg }}</td></tr>
        <tr><td>Sumber Dana</td><td>:</td><td>{{ $sumber_dana }}</td></tr>
        <tr><td>Tujuan Kegiatan</td><td>:</td><td>{{ $kegiatan->rincian_kegiatan }}</td></tr>
    </table>

    <!-- ======================================================= -->
    <!-- 2. REKAPITULASI ANGGARAN -->
    <!-- ======================================================= -->
    <h2>2. REKAPITULASI ANGGARAN</h2>
    <table>
        <thead>
            <tr><th style="width: 70%;" class="text-left">Uraian</th><th class="text-right">Jumlah (Rp)</th></tr>
        </thead>
        <tbody>
            <tr><td>**Dana Awal yang Dialokasikan**</td><td class="text-right">**{{ number_format($jumlahAwal, 0, ',', '.') }},-**</td></tr>
            <tr><td>Total Pengeluaran Kegiatan</td><td class="text-right">{{ number_format($totalPengeluaran, 0, ',', '.') }},-</td></tr>
            <tr style="background-color: #f0f0f0;"><td>**Sisa Dana / Saldo Akhir**</td><td class="text-right">**{{ number_format($jumlahSekarang, 0, ',', '.') }},-**</td></tr>
            <tr><td colspan="2">*Status: {{ $status_sisa_dana }}*</td></tr>
        </tbody>
    </table>

    <!-- ======================================================= -->
    <!-- 3. RINCIAN PENGELUARAN DAN BUKTI TRANSAKSI (Tabel Detail) -->
    <!-- ======================================================= -->
    <h2>3. RINCIAN PENGELUARAN DAN BUKTI TRANSAKSI</h2>
    <table>
        <thead>
            <tr>
                <th style="width: 5%;">No.</th>
                <th style="width: 15%;">Tanggal</th>
                <th style="width: 30%;">Uraian / Keterangan Belanja</th>
                <th style="width: 20%;">Toko / Vendor</th>
                <th style="width: 15%;">Jumlah (Rp)</th>
                <th style="width: 15%;">Bukti (ID Referensi)</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($pengeluaran as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td>{{ \Carbon\Carbon::parse($item->tgl)->format('d/m/Y') }}</td>
                    <td>{{ $item->ket }}</td>
                    <td>{{ $item->toko }}</td>
                    <td class="text-right">{{ number_format($item->amount, 0, ',', '.') }},-</td>
                    <td class="text-center">{{ $item->bukti_id }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #e0e0e0;">
                <td colspan="4" class="text-right">**TOTAL PENGELUARAN**</td>
                <td class="text-right">**{{ number_format($totalPengeluaran, 0, ',', '.') }},-**</td>
                <td></td>
            </tr>
        </tfoot>
    </table>

    <!-- ======================================================= -->
    <!-- 4. DOKUMENTASI KEGIATAN -->
    <!-- ======================================================= -->
    <div class="page-break"></div>
    <h2>4. DOKUMENTASI KEGIATAN</h2>
    <p>Lampiran visual ini membuktikan kegiatan telah dilaksanakan sesuai rencana:</p>
    
    <div style="width: 100%; margin: 20px 0;">
        <img src="{{ $kegiatan->dokumentasi_url }}" style="width: 48%; height: auto; float: left; margin-right: 4%; border: 1px solid #ccc; padding: 5px;">
        <img src="https://placehold.co/400x300/e0e0e0/555555?text=Foto+B:+Peserta" style="width: 48%; height: auto; border: 1px solid #ccc; padding: 5px;">
        <div style="clear: both;"></div>
    </div>
    <p style="margin-top: 10px;">Gambar 1. Suasana Pelaksanaan Utama dan Kehadiran Peserta.</p>

    <!-- ======================================================= -->
    <!-- 5. LEMBAR PENGESAHAN -->
    <!-- ======================================================= -->
    <div class="page-break"></div>
    <h2>5. LEMBAR PENGESAHAN</h2>

    <div style="text-align: right; margin-bottom: 50px;">
        {{ $kegiatan->kota }}, {{ $tgl_selesai_laporan }}
    </div>

    <table class="no-border" style="width: 90%; margin: 0 auto;">
        <thead>
            <tr class="text-center">
                <th style="width: 33%;">Disusun Oleh:</th>
                <th style="width: 33%;">Diperiksa Oleh:</th>
                <th style="width: 33%;">Disetujui Oleh:</th>
            </tr>
            <tr class="text-center">
                <th>**Bendahara Kegiatan**</th>
                <th>**Penanggung Jawab Kegiatan**</th>
                <th>**Kepala Lembaga/RT**</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-center" style="height: 100px;">
                    <p style="margin-top: 70px;">( ..................................... )</p>
                </td>
                <td class="text-center" style="height: 100px;">
                    <p style="margin-top: 70px;">( ..................................... )</p>
                </td>
                <td class="text-center" style="height: 100px;">
                    <p style="margin-top: 70px;">( ..................................... )</p>
                </td>
            </tr>
        </tbody>
    </table>
    <p style="margin-top: 50px; text-align: center; font-size: 10pt;">
        *Laporan ini dibuat sebagai bentuk pertanggungjawaban atas penggunaan dana kegiatan.*
    </p>

    <!-- Halaman Baru sebelum Lampiran Kuitansi Pertama -->
    <div class="page-break"></div>

    <!-- ======================================================= -->
    <!-- LAMPIRAN BUKTI KUITANSI (LOOPING) -->
    <!-- ======================================================= -->
    <h2 style="text-align: center;">LAMPIRAN BUKTI KUITANSI</h2>
    
    @foreach ($pengeluaran as $item)
        @if (!$loop->first)
            <div class="page-break"></div> 
        @endif

        <h3 style="text-align: center; font-size: 12pt; margin-top: 50px;">Bukti Kuitansi No. {{ $loop->iteration }} ({{ $item->bukti_id }})</h3>

        {{-- MEMANGGIL TEMPLATE KUITANSI TUNGGAL (File views/spj/spj.blade.php Anda) --}}
        @include('spj.spj', [
            'pemberi' => $item->pemberi ?? 'Sdr. BENDUM (Bendahara Umum)', 
            'terbilang' => $item->terbilang ?? 'Tujuh Juta Lima Ratus Ribu Rupiah', 
            'deskripsi' => $item->ket,
            'total' => $item->amount,
            'kota' => $kegiatan->kota,
            'tanggal' => \Carbon\Carbon::parse($item->tgl)->format('d F Y'),
        ])
    @endforeach

</body>
</html>
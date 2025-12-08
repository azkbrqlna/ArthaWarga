<!DOCTYPE html>
<html>
<head>
    <title>Laporan SPJ Kegiatan: {{ $kegiatan->nm_keg }}</title>
    <style>
        @page {
            size: A4 portrait;
            /* ✅ KOREKSI AKHIR: Margin ditingkatkan menjadi 40mm agar terlihat rapi */
            margin: 40mm;
        }
        body {
            /* Padding di body dihapus (sudah benar) */
            padding: 0; 
            font-family: 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
        }
        
        h1, h2 {
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
        .text-left { text-align: left; }
        .no-border, .no-border td, .no-border th {
            border: none;
        }
        .page-break {
            page-break-after: always;
        }
        /* Style untuk Cover */
        .cover-periode { font-size: 12pt; } 
        /* Style untuk penempatan gambar yang stabil (Satu Kotak Besar) */
        .img-container {
            width: 100%; 
            margin: 20px auto;
            text-align: center;
            height: 350px; 
            box-sizing: border-box;
        }
        .img-box {
            width: 90%; 
            height: 300px; 
            border: 1px solid #ccc;
            padding: 5px;
            box-sizing: border-box;
            display: inline-block; 
            margin: 5px auto;
            vertical-align: top;
            overflow: hidden;
        }
        .img-box img {
            width: 100%;
            height: 100%;
            object-fit: contain; 
        }
    </style>
</head>
<body>
    
    <!-- HALAMAN 1: COVER/JUDUL -->
    <div class="text-center" style="margin-top: 100px;">
        <!-- MENGHILANGKAN SEMUA LOGO DAN PLACEHOLDER DESA -->
        <div style="height: 115px; margin-bottom: 15px;"></div>
        
        <h1 style="font-size: 24pt;">LAPORAN PERTANGGUNGJAWABAN</h1>
        <h1 style="font-size: 20pt; margin-top: 10px;">(SPJ)</h1>
        <h1 style="font-size: 20pt; margin-top: 30px; text-transform: uppercase;">{{ $kegiatan->nm_keg }}</h1>
        <p class="cover-periode" style="margin-top: 50px;">Periode: {{ $tgl_mulai }} s/d {{ $tgl_selesai }}</p>
    </div>

    <!-- Halaman Baru -->
    <div class="page-break"></div>

    <!-- ======================================================= -->
    <!-- 1. INFORMASI UMUM KEGIATAN -->
    <!-- ======================================================= -->
    <h2>1. INFORMASI UMUM KEGIATAN</h2>
    <table class="no-border">
        <tr><td style="width: 30%;">Nama Kegiatan</td><td style="width: 5%;">:</td><td>{{ $kegiatan->nm_keg }}</td></tr>
        
        <tr><td>Waktu Pelaksanaan</td><td style="width: 5%;">:</td><td>{{ $tgl_mulai }} s/d {{ $tgl_selesai }}</td></tr>
        <tr><td>Penanggung Jawab (PJ)</td><td style="width: 5%;">:</td><td>{{ $kegiatan->pj_keg }}</td></tr>
        
        <tr><td>Sumber Dana</td><td style="width: 5%;">:</td><td>{{ $sumber_dana }}</td></tr> 
    </table>

    <!-- ======================================================= -->
    <!-- 2. REKAPITULASI PENGGUNAAN DANA -->
    <!-- ======================================================= -->
    <h2>2. REKAPITULASI PENGGUNAAN DANA</h2>
    <table>
        <thead>
            <tr><th style="width: 70%;" class="text-left">Uraian</th><th class="text-right">Jumlah (Rp)</th></tr>
        </thead>
        <tbody>
            <tr><td>Dana BOP Awal (Saldo Sebelum Penggunaan)</td><td class="text-right">{{ number_format($saldoAwalBOP, 0, ',', '.') }},-</td></tr>
            
            <!-- Jumlah Digunakan (Total Pengeluaran Kegiatan) -->
            <tr><td>Jumlah Dana Digunakan (Total Pengeluaran Kegiatan)</td><td class="text-right">{{ number_format($totalPengeluaran, 0, ',', '.') }},-</td></tr>
            
            <!-- Sisa Saldo BOP Setelah Kegiatan -->
            <tr style="background-color: #f0f0f0;"><td><b>Sisa Saldo BOP Setelah Kegiatan Ini</b></td><td class="text-right"><b>{{ number_format($sisaAkhir, 0, ',', '.') }},-</b></td></tr>
            
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
                <th style="width: 45%;">Uraian / Keterangan Belanja</th>
                <th style="width: 20%;">ID Referensi (Bukti ID)</th> 
            </tr>
        </thead>
        <tbody>
            @foreach ($pengeluaran as $item)
                <tr>
                    <td class="text-center">{{ $loop->iteration }}</td>
                    <td>{{ $item->tgl_formatted }}</td> 
                    <td>
                        {{ $item->ket }} 
                        <br><i style="font-size:10pt;">(Toko/Vendor: {{ $item->toko ?? '-' }})</i>
                        <br><i style="font-size:10pt;">(Jumlah: Rp {{ number_format($item->nominal, 0, ',', '.') }})</i>
                    </td> 
                    <td class="text-center">{{ $item->bukti_id }}</td> 
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #e0e0e0;">
                <td colspan="2" class="text-right"></td>
                <td class="text-left"><b>TOTAL PENGELUARAN KEGIATAN INI</b></td>
                <td class="text-center"><b>{{ number_format($totalPengeluaran, 0, ',', '.') }},-</b></td>
            </tr>
        </tfoot>
        
    </table>

    <!-- ======================================================= -->
    <!-- 4. DOKUMENTASI KEGIATAN -->
    <!-- ======================================================= -->
    <div class="page-break"></div>
    <h2>4. DOKUMENTASI KEGIATAN</h2>
    <p>Lampiran visual ini membuktikan kegiatan telah dilaksanakan sesuai rencana:</p>
    
    <!-- IMPLEMENTASI GAMBAR BASE64 TUNGGAL -->
    <div class="img-container">
        <div class="img-box">
            @if ($dokumentasiBase64)
                <!-- Sumber gambar Base64 dari Controller -->
                <img src="{{ $dokumentasiBase64 }}" alt="Dokumentasi Kegiatan">
            @else
                <p style="padding-top: 100px; color: #999;">Gambar Dokumentasi Gagal Dimuat. Pastikan URL Gambar valid dan Guzzle terinstal.</p>
            @endif
        </div>
    </div>
    <p style="margin-top: 10px; text-align: center;">Gambar Dokumentasi Utama Kegiatan.</p>

    <!-- ======================================================= -->
    <!-- 5. LEMBAR PENGESAHAN -->
    <!-- ======================================================= -->
    <div class="page-break"></div>
    <h2>5. LEMBAR PENGESAHAN</h2>

    <div style="text-align: right; margin-bottom: 50px;">
        <!-- TANGGAL PENGESAHAN DARI CONTROLLER -->
        {{ $kegiatan->kota ?? 'Semarang' }}, {{ $tgl_pengesahan }}
    </div>

    <table class="no-border" style="width: 90%; margin: 0 auto;">
        <thead>
            <tr class="text-center">
                <th style="width: 33%;">Disusun Oleh:</th>
                <th style="width: 33%;">Diperiksa Oleh:</th>
                <th style="width: 33%;">Disetujui Oleh:</th>
            </tr>
            <tr class="text-center">
                <th><b>Bendahara Kegiatan</b></th>
                <th><b>Penanggung Jawab Kegiatan</b></th>
                <th><b>Kepala Lembaga/RT</b></th>
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
        <b>Laporan ini dibuat sebagai bentuk pertanggungjawaban atas penggunaan dana kegiatan.</b>
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
            'pemberi' => $item->toko ?? 'Sdr. BENDUM (Bendahara Umum)', // Menggunakan $item->toko
            'terbilang' => $item->terbilang ?? 'Nilai Terbilang Tidak Disediakan', 
            'deskripsi' => $item->ket,
            'total' => $item->nominal, // Menggunakan kolom nominal
            'kota' => $kegiatan->kota ?? 'Semarang',
            'tanggal' => $item->tgl_formatted, // Menggunakan tanggal yang sudah diformat
        ])
    @endforeach
    
</body>
</html>
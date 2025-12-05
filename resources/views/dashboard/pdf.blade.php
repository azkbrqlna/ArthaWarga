<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Laporan Transaksi</title>
    <style>
        body { font-family: DejaVu Sans, Helvetica, Arial, sans-serif; font-size: 11px; color: #111; }
        .header-wrapper { position: relative; width: 100%; margin-bottom: 20px; }
        .logo-pemkot { position: absolute; left: 0; top: 0; width: 65px; height: auto; }
        .header-text { text-align: center; text-transform: uppercase; padding-left: 50px; padding-right: 50px; }
        .header-main { font-size: 14px; font-weight: bold; line-height: 1.2; }
        .header-rtrw { font-size: 14px; font-weight: bold; margin-top: 5px; }
        hr.separator { border: 0; border-bottom: 3px solid #000; margin-top: 10px; margin-bottom: 2px; }
        hr.separator-thin { border: 0; border-bottom: 1px solid #000; margin-bottom: 15px; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 10px; 
            table-layout: fixed; 
        }

        th, td { 
            border: 1px solid #000; 
            vertical-align: middle; /* Ubah ke middle agar lebih rapi vertikalnya */
            word-wrap: break-word; 
        }

        /* PENTING: Update di sini */
        th { 
            background: #f0f0f0; 
            font-weight: bold; 
            text-align: center; 
            font-size: 10px; /* Perkecil sedikit dari 11px ke 10px */
            padding: 4px 2px; /* Kurangi padding kiri-kanan agar teks punya ruang */
        }

        td { 
            font-size: 10px; 
            padding: 4px 4px; 
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        img.note { width: 90%; height: auto; display: block; margin: 0 auto; border: 1px solid #ccc; }
        .meta-info { margin-bottom: 10px; font-size: 11px; }
    </style>
</head>
<body>

    @php
        $pathLogo = public_path('images/Lambang_Kota_Semarang.png');
        $logoSrc = ''; 
        if (file_exists($pathLogo)) {
            $type = pathinfo($pathLogo, PATHINFO_EXTENSION);
            $data = file_get_contents($pathLogo);
            $logoSrc = 'data:image/' . $type . ';base64,' . base64_encode($data);
        }

        // --- AMBIL DATA DARI RELASI (Safety Check pakai optional) ---
        // Asumsi: User -> Kelurahan -> Kecamatan -> Kota
        $namaKelurahan = optional($user->kelurahan)->nama_kelurahan ?? '-';
        $namaKecamatan = optional(optional($user->kelurahan)->kecamatan)->nama_kecamatan ?? '-';
        
        // Ambil nama kota dari relasi, jika tidak ada, default ke Semarang
        $namaKota = optional(optional(optional($user->kelurahan)->kecamatan)->kota)->nama_kota ?? 'KOTA SEMARANG';
        
        // Cek jika nama kota belum ada kata "PEMERINTAH", tambahkan manual (opsional)
        $headerKota = str_contains(strtoupper($namaKota), 'PEMERINTAH') ? $namaKota : 'PEMERINTAH ' . $namaKota;
    @endphp

    <div class="header-wrapper">
        @if(!empty($logoSrc))
            <img src="{{ $logoSrc }}" class="logo-pemkot" alt="Logo Pemkot">
        @endif

        <div class="header-text">
            <div class="header-main">{{ strtoupper($headerKota) }}</div>
            
            <div class="header-main">KECAMATAN {{ strtoupper($namaKecamatan) }}</div>
            
            <div class="header-main">KELURAHAN {{ strtoupper($namaKelurahan) }}</div>
            
            <div class="header-rtrw">
                RW {{ $user->rw ?? '...' }} RT {{ $user->rt ?? '...' }}
            </div>
        </div>
    </div>
    
    <hr class="separator">
    <hr class="separator-thin">

    <div style="margin-bottom: 20px; font-size: 11px;">
        <div style="text-align: center; font-weight: bold; font-size: 12px; margin-bottom: 15px; text-transform: uppercase;">
            LAPORAN KEUANGAN RT {{ $user->rt ?? '...' }} RW {{ $user->rw ?? '...' }}
        </div>

        <table style="width: 100%; border: none;">
            <tr>
                <td style="width: 160px; border: none; padding: 2px 0;">TANGGAL CETAK</td>
                <td style="border: none; padding: 2px 0; font-weight: normal;">
                    : {{ \Carbon\Carbon::now('Asia/Jakarta')->locale('id')->isoFormat('D MMMM Y, H:mm') }}
                </td>
            </tr>
            <tr>
                <td style="border: none; padding: 2px 0;">DICETAK OLEH</td>
                <td style="border: none; padding: 2px 0;">: {{ $user->nm_lengkap ?? 'Admin' }}</td> 
            </tr>
            <tr>
                <td style="border: none; padding: 2px 0;">PERIODE BULAN/TAHUN</td>
                <td style="border: none; padding: 2px 0;">: {{ $periodeLabel ?? '-' }}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 2px 0;">KECAMATAN</td>
                <td style="border: none; padding: 2px 0;">: {{ $namaKecamatan }}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 2px 0;">KELURAHAN</td>
                <td style="border: none; padding: 2px 0;">: {{ $namaKelurahan }}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 2px 0;">RW</td>
                <td style="border: none; padding: 2px 0;">: {{ $user->rw ?? '-' }}</td>
            </tr>
            <tr>
                <td style="border: none; padding: 2px 0;">RT</td>
                <td style="border: none; padding: 2px 0;">: {{ $user->rt ?? '-' }}</td>
            </tr>
        </table>
    </div>

    <table style="margin-top: 5px;"> 
        <thead>
            <tr>
                <th style="width: 10%;">Tanggal</th>
                
                <th style="width: 12%;">Kategori</th>
                
                <th style="width: 13%;">Jumlah Awal</th>
                
                <th style="width: 12%;">Pemasukan</th>
                <th style="width: 12%;">Pengeluaran</th>
                
                <th style="width: 13%;">Saldo Akhir</th>
                
                <th style="width: 18%;">Keterangan</th>
                
                <th style="width: 10%;">Bukti Nota</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transaksi as $t)
                @php
                    $jumlahPemasukan = $t['status'] === 'Pemasukan' ? ($t['jumlah_sisa'] - $t['jumlah_awal']) : 0;
                    $jumlahPengeluaran = $t['status'] === 'Pengeluaran' ? $t['jumlah_digunakan'] : 0;
                    
                    $imgSrc = $t['bkt_nota'] ?? null;
                    if ($imgSrc && Str::startsWith($imgSrc, '/')) {
                        $imgSrc = 'file://' . $imgSrc;
                    }
                @endphp
                <tr>
                    <td class="text-center">{{ $t['tgl'] }}</td>
                    <td class="text-center">{{ $t['kategori'] }}</td>
                    <td class="text-right">Rp {{ number_format($t['jumlah_awal'] ?? 0, 0, ',', '.') }}</td>
                    <td class="text-right">
                        @if($jumlahPemasukan > 0) Rp {{ number_format($jumlahPemasukan, 0, ',', '.') }} @else - @endif
                    </td>
                    <td class="text-right">
                        @if($jumlahPengeluaran > 0) Rp {{ number_format($jumlahPengeluaran, 0, ',', '.') }} @else - @endif
                    </td>
                    <td class="text-right">Rp {{ number_format($t['jumlah_sisa'] ?? 0, 0, ',', '.') }}</td>
                    
                    <td>{!! nl2br(e($t['ket'] ?? '-')) !!}</td>

                    <td class="text-center">
                        @if(!empty($imgSrc) && $t['kategori'] === 'BOP')
                            <img src="{{ $imgSrc }}" alt="Bukti Nota" class="note" />
                        @else
                            -
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center">Tidak ada data transaksi.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</body>
</html>
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DownloadPdfRequest extends FormRequest
{
    /**
     * Tentukan apakah user boleh akses request ini.
     */
    public function authorize(): bool
    {
        return true; // Autorisasi sudah dihandle middleware route
    }

    /**
     * Rules validasi. Scramble akan membaca ini sebagai parameter API.
     */
    public function rules(): array
    {
        return [
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'year'  => ['nullable', 'integer', 'min:2000', 'max:' . (date('Y') + 1)],
        ];
    }

    /**
     * Deskripsi parameter untuk dokumentasi Scramble.
     */
    public function bodyParameters(): array
    {
        return [
            'month' => [
                'description' => 'Filter berdasarkan bulan (1-12). Kosongkan untuk setahun penuh.',
                'example' => 11,
            ],
            'year' => [
                'description' => 'Filter berdasarkan tahun. Jika bulan diisi tapi tahun kosong, otomatis tahun ini.',
                'example' => 2025,
            ],
        ];
    }
}
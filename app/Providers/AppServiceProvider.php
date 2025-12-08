<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

// Tambahkan import Scramble di sini
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Support\Facades\Gate;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Bagian Inertia tetap
        Inertia::share([
            'auth' => fn () => [
                'user' => Auth::user(),
            ],
        ]);
        
        Gate::define('viewApiDocs', function ($user = null) {
            // Izinkan jika user login (opsional) ATAU jika session password benar
            return request()->session()->get('api_docs_access') === true 
                   || app()->environment('local'); // Selalu boleh di local
        });

        // Tambahkan konfigurasi Scramble
        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi) {
                $openApi->secure(
                    SecurityScheme::http('bearer')
                );
            });
    }
}

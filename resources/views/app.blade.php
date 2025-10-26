<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title inertia>{{ config('app.name', 'Laravel') }}</title>

      <meta name="csrf-token" content="{{ csrf_token() }}">

      {{-- Ziggy untuk route() di Inertia React --}}
      @routes

      {{-- Vite + React --}}
      @viteReactRefresh
      @vite(['resources/css/app.css', 'resources/js/app.jsx'])

      @inertiaHead
  </head>

  <body class="antialiased">
      @inertia
  </body>
</html>

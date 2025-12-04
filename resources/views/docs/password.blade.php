<!DOCTYPE html>
<html>
<head>
    <title>Akses Dokumentasi API</title>
</head>
<body>
    <h1>Akses Dokumentasi API</h1>

    @if ($errors->any())
        <div style="color: red;">
            Kata sandi salah. Silakan coba lagi.
        </div>
    @endif

    <form method="POST" action="{{ route('docs.password.process') }}">
        @csrf
        
        <label for="password">Masukkan Password:</label><br>
        <input type="password" id="password" name="password" required>
        
        <button type="submit">Akses</button>
    </form>
</body>
</html>
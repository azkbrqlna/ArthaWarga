<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthApiController extends Controller
{
     /**
     * Login 
     * @unauthenticated
    */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'status' => false,
                'message' => 'Email atau password salah.',
            ], 401);
        }

        $user = Auth::user();

        $token = $user->createToken(name: 'api_token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login berhasil.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Logout 
     * @authenticated
    */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil.',
        ]);
    }
}

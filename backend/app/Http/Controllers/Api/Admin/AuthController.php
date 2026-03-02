<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $admin = Admin::where('email', strtolower($credentials['email']))
            ->where('is_active', true)
            ->first();

        if (! $admin || ! Hash::check($credentials['password'], $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create Sanctum API token
        $token = $admin->createToken('admin-token')->plainTextToken;

        // Update last login
        $admin->forceFill(['last_login_at' => now()])->save();

        return response()->json([
            'message' => 'Authenticated.',
            'token' => $token,
            'admin' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the current token
        if ($request->user('sanctum')) {
            $request->user('sanctum')->currentAccessToken()->delete();
        }

        return response()->json(['message' => 'Logged out.']);
    }
}

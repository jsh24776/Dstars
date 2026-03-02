<?php

namespace App\Services\Auth;

use App\Models\Member;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function register(array $data): Member
    {
        return Member::create([
            'full_name' => $data['name'],
            'email' => strtolower($data['email']),
            'phone' => $data['phone'] ?? '',
            'password' => $data['password'],
            'role' => 'member',
            'is_active' => false,
        ]);
    }

    public function attemptLogin(string $email, string $password): ?Member
    {
        $user = Member::where('email', strtolower($email))->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }
}

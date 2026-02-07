<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Api\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends ApiController
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return $this->success([], 'Logged out successfully.');
    }
}

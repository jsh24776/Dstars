<?php

namespace App\Http\Controllers\Api\Members;

use App\Http\Controllers\Api\ApiController;
use App\Models\Member;
use App\Services\Members\MemberCardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MemberCardController extends ApiController
{
    public function __construct(
        protected MemberCardService $cardService
    ) {
    }

    public function download(Member $member): BinaryFileResponse|JsonResponse
    {
        if (! $member->is_verified) {
            return $this->error('Member is not verified.', 403);
        }

        if (! $member->membership_id) {
            return $this->error('Membership ID missing.', 422);
        }

        $path = $this->cardService->buildCard($member);

        if (! Storage::disk('local')->exists($path)) {
            return $this->error('Virtual card could not be generated.', 500);
        }

        $filename = 'DStars-Virtual-ID-' . $member->membership_id . '.pdf';
        $absolutePath = Storage::disk('local')->path($path);

        return response()->download($absolutePath, $filename, [
            'Content-Type' => 'application/pdf',
        ]);
    }
}

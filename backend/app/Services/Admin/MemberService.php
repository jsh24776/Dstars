<?php

namespace App\Services\Admin;

use App\Enums\MemberStatus;
use App\Models\Member;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MemberService
{
    public function create(array $data): Member
    {
        return DB::transaction(function () use ($data) {
            $member = Member::create([
                'full_name' => $data['full_name'],
                'username' => $data['username'] ?? null,
                'email' => strtolower($data['email']),
                'phone' => $data['phone'],
                'status' => $data['status'] ?? MemberStatus::Inactive,
                'membership_plan_id' => $data['membership_plan_id'] ?? null,
                'is_verified' => $data['is_verified'] ?? false,
            ]);

            $member->forceFill([
                'membership_id' => $this->formatMembershipId($member->id),
            ])->save();

            if (! empty($data['avatar'])) {
                $member->forceFill([
                    'profile_image_path' => $this->storeAvatar($data['avatar']),
                ])->save();
            }

            return $member;
        });
    }

    public function update(Member $member, array $data): Member
    {
        return DB::transaction(function () use ($member, $data) {
            $member->fill([
                'full_name' => $data['full_name'] ?? $member->full_name,
                'username' => array_key_exists('username', $data) ? $data['username'] : $member->username,
                'email' => array_key_exists('email', $data) ? strtolower($data['email']) : $member->email,
                'phone' => $data['phone'] ?? $member->phone,
                'status' => $data['status'] ?? $member->status,
                'membership_plan_id' => array_key_exists('membership_plan_id', $data)
                    ? $data['membership_plan_id']
                    : $member->membership_plan_id,
                'is_verified' => array_key_exists('is_verified', $data) ? (bool) $data['is_verified'] : $member->is_verified,
            ]);

            if (! empty($data['avatar'])) {
                $this->deleteAvatar($member->profile_image_path);
                $member->profile_image_path = $this->storeAvatar($data['avatar']);
            }

            $member->save();

            return $member;
        });
    }

    public function updateStatus(Member $member, string $status): Member
    {
        $member->status = $status;
        $member->save();

        return $member;
    }

    public function delete(Member $member): void
    {
        $member->delete();
    }

    protected function storeAvatar(UploadedFile $file): string
    {
        $filename = Str::uuid()->toString().'.'.$file->getClientOriginalExtension();

        return $file->storeAs('members/avatars', $filename, 'public');
    }

    protected function deleteAvatar(?string $path): void
    {
        if (! $path) {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    protected function formatMembershipId(int $id): string
    {
        return 'DSTARS-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }
}

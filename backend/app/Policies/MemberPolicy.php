<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Member;
use App\Models\User;

class MemberPolicy
{
    public function before(Admin|User $user, string $ability): bool|null
    {
        return ($user instanceof Admin || $user->isAdmin()) ? true : null;
    }

    public function viewAny(Admin|User $user): bool
    {
        return $user instanceof Admin || $user->isAdmin();
    }

    public function view(Admin|User $user, Member $member): bool
    {
        return $user instanceof Admin || $user->isAdmin();
    }

    public function create(Admin|User $user): bool
    {
        return $user instanceof Admin || $user->isAdmin();
    }

    public function update(Admin|User $user, Member $member): bool
    {
        return $user instanceof Admin || $user->isAdmin();
    }

    public function delete(Admin|User $user, Member $member): bool
    {
        return $user instanceof Admin || $user->isAdmin();
    }
}

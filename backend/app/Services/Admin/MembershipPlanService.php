<?php

namespace App\Services\Admin;

use App\Models\MembershipPlan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class MembershipPlanService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = MembershipPlan::query();

        if (! empty($filters['search'])) {
            $search = trim((string) $filters['search']);
            $query->where('name', 'like', '%'.$search.'%');
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $sortBy = $filters['sort_by'] ?? 'price';
        $sortDir = $filters['sort_dir'] ?? 'asc';
        $perPage = $filters['per_page'] ?? 10;

        return $query
            ->orderBy($sortBy, $sortDir)
            ->paginate((int) $perPage);
    }

    public function create(array $data): MembershipPlan
    {
        $slug = $this->generateUniqueSlug($data['name']);

        $plan = MembershipPlan::create([
            'name' => $data['name'],
            'duration' => $data['duration'],
            'duration_count' => $data['duration_count'],
            'slug' => $slug,
            'price' => $data['price'],
            'status' => $data['status'],
            'billing_cycle' => $data['duration'] === 'day' ? 'daily' : 'monthly',
            'is_active' => $data['status'] === 'active',
            'description' => $data['description'] ?? null,
            'features' => $data['features'] ?? [],
        ]);

        $this->flushContextCache();

        return $plan;
    }

    public function update(MembershipPlan $plan, array $data): MembershipPlan
    {
        $nextName = $data['name'] ?? $plan->name;

        $plan->fill([
            'name' => $nextName,
            'duration' => $data['duration'] ?? $plan->duration,
            'duration_count' => $data['duration_count'] ?? $plan->duration_count,
            'price' => $data['price'] ?? $plan->price,
            'status' => $data['status'] ?? $plan->status,
            'description' => array_key_exists('description', $data) ? $data['description'] : $plan->description,
            'features' => array_key_exists('features', $data) ? ($data['features'] ?? []) : $plan->features,
        ]);

        if ($nextName !== $plan->getOriginal('name')) {
            $plan->slug = $this->generateUniqueSlug($nextName, $plan->id);
        }

        $plan->billing_cycle = $plan->duration === 'day' ? 'daily' : 'monthly';
        $plan->is_active = $plan->status === 'active';
        $plan->save();

        $this->flushContextCache();

        return $plan->refresh();
    }

    public function updateStatus(MembershipPlan $plan, string $status): MembershipPlan
    {
        $plan->forceFill([
            'status' => $status,
            'is_active' => $status === 'active',
        ])->save();

        $this->flushContextCache();

        return $plan->refresh();
    }

    public function delete(MembershipPlan $plan): void
    {
        if ($plan->members()->exists()) {
            throw new \RuntimeException('Cannot delete a plan currently assigned to members.');
        }

        $plan->delete();
        $this->flushContextCache();
    }

    protected function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base ?: 'plan';
        $counter = 2;

        while ($this->slugExists($slug, $ignoreId)) {
            $slug = ($base ?: 'plan').'-'.$counter;
            $counter++;
        }

        return $slug;
    }

    protected function slugExists(string $slug, ?int $ignoreId): bool
    {
        return MembershipPlan::query()
            ->where('slug', $slug)
            ->when($ignoreId, static fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists();
    }

    protected function flushContextCache(): void
    {
        Cache::forget('ai_concierge_membership_plans');
    }
}

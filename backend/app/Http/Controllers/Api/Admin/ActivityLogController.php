<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Admin\ActivityLogs\IndexActivityLogRequest;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends ApiController
{
    public function index(IndexActivityLogRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $limit = (int) ($validated['per_page'] ?? 10);

        $items = ActivityLog::query()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->map(static function (ActivityLog $log) {
                return [
                    'id' => $log->id,
                    'actor_type' => $log->actor_type,
                    'actor_id' => $log->actor_id ? (int) $log->actor_id : null,
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'entity_id' => $log->entity_id ? (int) $log->entity_id : null,
                    'details' => $log->details,
                    'created_at' => $log->created_at?->toIso8601String(),
                ];
            })
            ->values();

        return $this->success([
            'items' => $items,
        ]);
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('membership_id', 20)->nullable()->unique()->after('phone');
            $table->string('virtual_card_path')->nullable()->after('membership_id');
            $table->string('download_token_hash')->nullable()->after('verification_expires_at');
            $table->timestamp('download_token_expires_at')->nullable()->after('download_token_hash');
        });

        DB::table('members')
            ->whereNull('membership_id')
            ->orderBy('id')
            ->chunkById(100, function ($members) {
                foreach ($members as $member) {
                    DB::table('members')
                        ->where('id', $member->id)
                        ->update([
                            'membership_id' => 'DSTARS-' . str_pad((string) $member->id, 6, '0', STR_PAD_LEFT),
                        ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn([
                'membership_id',
                'virtual_card_path',
                'download_token_hash',
                'download_token_expires_at',
            ]);
        });
    }
};

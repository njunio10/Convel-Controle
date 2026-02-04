<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('leads')) {
            Schema::table('leads', function (Blueprint $table) {
                if (!Schema::hasColumn('leads', 'responsible_name')) {
                    $table->string('responsible_name')->after('name');
                }
                if (!Schema::hasColumn('leads', 'origin')) {
                    $table->string('origin', 30)->default('outro')->after('phone');
                }
                if (!Schema::hasColumn('leads', 'referred_by')) {
                    $table->string('referred_by')->nullable()->after('origin');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['responsible_name', 'origin', 'referred_by']);
        });
    }
};

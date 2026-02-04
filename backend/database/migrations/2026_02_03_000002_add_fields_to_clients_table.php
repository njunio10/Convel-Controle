<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('clients')) {
            Schema::table('clients', function (Blueprint $table) {
                if (!Schema::hasColumn('clients', 'responsible_name')) {
                    $table->string('responsible_name')->nullable()->after('name');
                }
                if (!Schema::hasColumn('clients', 'monthly_fee')) {
                    $table->decimal('monthly_fee', 12, 2)->nullable()->after('referred_by');
                }
            });
        }
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['responsible_name', 'monthly_fee']);
        });
    }
};

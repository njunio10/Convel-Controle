<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->string('responsible_name')->nullable()->after('name');
            $table->decimal('monthly_fee', 12, 2)->nullable()->after('referred_by');
        });
    }

    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropColumn(['responsible_name', 'monthly_fee']);
        });
    }
};

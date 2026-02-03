<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->string('responsible_name')->after('name');
            $table->string('origin', 30)->default('outro')->after('phone');
            $table->string('referred_by')->nullable()->after('origin');
        });
    }

    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropColumn(['responsible_name', 'origin', 'referred_by']);
        });
    }
};

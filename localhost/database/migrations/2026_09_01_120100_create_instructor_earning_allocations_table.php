<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructor_earning_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_earning_id')->constrained('instructor_earnings')->cascadeOnDelete();
            $table->foreignId('payout_request_id')->constrained('payout_requests')->cascadeOnDelete();
            $table->decimal('amount', 10, 2);
            $table->timestamps();
            $table->unique(
                ['instructor_earning_id', 'payout_request_id'],
                'earning_payout_unique'
            );
            $table->index(['payout_request_id'], 'allocation_payout_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_earning_allocations');
    }
};

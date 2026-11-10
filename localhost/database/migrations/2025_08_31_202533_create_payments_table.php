<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('order_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->string('idempotency_key', 100)->nullable();

            $table->decimal('amount', 10, 2);

            $table->enum('status', [
                'pending',
                'paid',
                'failed',
                'canceled'
            ])->default('pending');

            $table->string('gateway')->nullable(); 
            // paypal | stripe | mollie | ...

            $table->string('transaction_id')->nullable();

            $table->foreignId('coupon_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->decimal('coupon_amount', 10, 2)->default(0);

            $table->json('meta')->nullable(); // response gateway

            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'idempotency_key']);
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};

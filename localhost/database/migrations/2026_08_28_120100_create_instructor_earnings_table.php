<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructor_earnings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            // payout_requests is created by the next migration, and MySQL
            // refuses a foreign key whose referenced table does not exist yet
            // (errno 150). The column is plain here and the constraint is
            // added at the end of that migration.
            $table->foreignId('payout_request_id')->nullable();
            $table->decimal('gross_amount', 10, 2);
            $table->decimal('commission_percent', 5, 2);
            $table->decimal('commission_amount', 10, 2);
            $table->decimal('net_amount', 10, 2);
            $table->decimal('available_amount', 10, 2)->nullable();
            $table->enum('status', ['available', 'requested', 'paid', 'reversed'])->default('available');
            $table->timestamps();
            $table->unique(['payment_id', 'order_item_id']);
            $table->index(['instructor_id', 'status']);
            $table->index('payout_request_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_earnings');
    }
};

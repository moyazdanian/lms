
<?php
require __DIR__."/vendor/autoload.php";
$app = require_once __DIR__."/bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "=== getInstructors query ===\n";
try {
    $instructors = User::whereIn("role", ["instructor", "admin"])
        ->with(["instructor"])
        ->withCount(["courses"])
        ->addSelect([
            "total_students" => function ($query) {
                $query->selectRaw("COUNT(DISTINCT enrollments.user_id)")
                    ->from("courses")
                    ->join("enrollments", "courses.id", "=", "enrollments.course_id")
                    ->whereColumn("courses.instructor_id", "users.id");
            },
        ])
        ->latest()
        ->get();
    echo "COUNT: " . $instructors->count() . "\n";
    echo substr($instructors->toJson(), 0, 800) . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "FILE: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== base users by role ===\n";
try {
    echo "instructor role count: " . User::where("role","instructor")->count() . "\n";
    echo "admin role count: " . User::where("role","admin")->count() . "\n";
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== instructors_profiles rows ===\n";
try {
    $profiles = \App\Models\Instructors_profile::all();
    echo "profile count: " . $profiles->count() . "\n";
    foreach ($profiles as $p) {
        echo "id={$p->id} user_id={$p->user_id} status=" . ($p->status ?? "NULL") . "\n";
    }
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}


<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use Illuminate\Http\Request;

/**
 * Certificates: the owner's list/download and the public verification page
 * data. PDF rendering uses dompdf when available and degrades gracefully.
 */
class CertificateController extends Controller
{
    public function index(Request $request)
    {
        $certificates = Certificate::query()
            ->where('user_id', $request->user()->id)
            ->with('course:id,title,slug,thumbnail')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Certificate $certificate) => $this->present($certificate));

        return response()->json(['data' => $certificates]);
    }

    public function download(Request $request, Certificate $certificate)
    {
        // Only the owner (or an admin) may download the PDF.
        abort_unless(
            (int) $certificate->user_id === (int) $request->user()->id
                || $request->user()->role === 'admin',
            403
        );

        abort_unless($certificate->isValid(), 403, 'This certificate has been revoked.');

        return $this->streamPdf($certificate);
    }

    /**
     * Public verification payload — no authentication, the code is an
     * unguessable UUID so only holders of the exact link can look it up.
     */
    public function verify(string $code)
    {
        $certificate = Certificate::query()
            ->with('course:id,title,slug,thumbnail')
            ->where('code', $code)
            ->firstOrFail();

        return response()->json([
            'certificate' => [
                'serial' => $certificate->serial,
                'status' => $certificate->isValid() ? 'valid' : 'revoked',
                'student_name' => $certificate->snapshot['student_name'] ?? null,
                'course_title' => $certificate->snapshot['course_title']
                    ?? $certificate->course?->title,
                'instructor_name' => $certificate->snapshot['instructor_name'] ?? null,
                'site_name' => $certificate->snapshot['site_name'] ?? null,
                'issued_at' => $certificate->issued_at?->toIso8601String(),
                'revoked_at' => $certificate->revoked_at?->toIso8601String(),
            ],
        ]);
    }

    protected function streamPdf(Certificate $certificate)
    {
        if (!class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            // Package not installed (optional dependency) — fail loudly but
            // leave every other feature working.
            abort(503, 'PDF generation is not available. Install barryvdh/laravel-dompdf.');
        }

        $data = [
            'certificate' => $certificate,
            'studentName' => $certificate->snapshot['student_name'] ?? '—',
            'courseTitle' => $certificate->snapshot['course_title'] ?? $certificate->course?->title,
            'instructorName' => $certificate->snapshot['instructor_name'] ?? null,
            'siteName' => $certificate->snapshot['site_name'] ?? config('app.name'),
            'verifyUrl' => rtrim(config('app.frontend_url'), '/')."/certificates/{$certificate->code}",
        ];

        return \Barryvdh\DomPDF\Facade\Pdf::loadView('certificates.pdf', $data)
            ->setPaper('a4', 'landscape')
            ->download("certificate-{$certificate->serial}.pdf");
    }

    protected function present(Certificate $certificate): array
    {
        return [
            'id' => $certificate->id,
            'code' => $certificate->code,
            'serial' => $certificate->serial,
            'status' => $certificate->isValid() ? 'valid' : 'revoked',
            'course_title' => $certificate->snapshot['course_title'] ?? $certificate->course?->title,
            'course_slug' => $certificate->course?->slug,
            'instructor_name' => $certificate->snapshot['instructor_name'] ?? null,
            'issued_at' => $certificate->issued_at?->toIso8601String(),
            'revoked_at' => $certificate->revoked_at?->toIso8601String(),
            'verify_url' => rtrim(config('app.frontend_url'), '/')."/certificates/{$certificate->code}",
            'download_url' => route('certificates.download', ['certificate' => $certificate->code]),
        ];
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $certificate->serial }}</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1f2937;
            margin: 0;
        }
        .frame {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 14px solid #4f46e5;
            padding: 60px 70px;
            text-align: center;
        }
        .inner-frame {
            border: 2px solid #c7d2fe;
            padding: 40px 30px 30px;
        }
        .site-name {
            font-size: 22px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #4f46e5;
            font-weight: bold;
        }
        .heading {
            font-size: 46px;
            font-weight: bold;
            margin: 26px 0 6px;
            color: #111827;
        }
        .subtitle {
            font-size: 15px;
            color: #6b7280;
            letter-spacing: 1px;
        }
        .student {
            font-size: 34px;
            font-weight: bold;
            color: #4f46e5;
            margin: 30px 0 8px;
        }
        .course {
            font-size: 22px;
            font-weight: bold;
            margin: 18px auto 0;
            max-width: 600px;
        }
        .meta {
            margin-top: 40px;
            font-size: 13px;
            color: #4b5563;
        }
        .serial {
            margin-top: 8px;
            font-size: 15px;
            font-weight: bold;
            color: #111827;
        }
        .verify {
            margin-top: 18px;
            font-size: 11px;
            color: #6b7280;
            word-wrap: break-word;
        }
        .footer {
            margin-top: 46px;
            font-size: 12px;
            color: #9ca3af;
        }
    </style>
</head>
<body>
    <div class="frame">
        <div class="inner-frame">
            <div class="site-name">{{ $siteName }}</div>
            <div class="heading">Certificate of Completion</div>
            <div class="subtitle">THIS CERTIFICATE IS PROUDLY PRESENTED TO</div>

            <div class="student">{{ $studentName }}</div>

            <div class="subtitle">FOR SUCCESSFULLY COMPLETING THE COURSE</div>

            <div class="course">“{{ $courseTitle }}”</div>

            @if($instructorName)
                <div class="meta">Instructor: <strong>{{ $instructorName }}</strong></div>
            @endif

            <div class="meta">
                Issued on {{ optional($certificate->issued_at)->format('F j, Y') }}
            </div>
            <div class="serial">Serial: {{ $certificate->serial }}</div>
            <div class="verify">
                Verify this certificate at: {{ $verifyUrl }}
            </div>

            <div class="footer">
                This certificate can be verified online using the serial number above.
            </div>
        </div>
    </div>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <style>
            @page { margin: 0; }
            body {
                margin: 0;
                font-family: Arial, sans-serif;
                color: #0f172a;
            }
            .card {
                width: 640px;
                height: 400px;
                padding: 28px 32px;
                background: #f8fafc;
                box-sizing: border-box;
                position: relative;
                border-radius: 24px;
            }
            .brand {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            .logo {
                width: 220px;
                height: 54px;
            }
            .status {
                margin-left: auto;
                padding: 6px 14px;
                border-radius: 999px;
                background: #dcfce7;
                color: #15803d;
                font-size: 12px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }
            .content {
                display: flex;
                gap: 28px;
                margin-top: 24px;
            }
            .details {
                flex: 1;
            }
            .label {
                font-size: 11px;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                color: #64748b;
                margin-bottom: 6px;
            }
            .name {
                font-size: 24px;
                font-weight: 700;
                margin: 0 0 12px 0;
            }
            .row {
                font-size: 13px;
                color: #1f2937;
                margin-bottom: 8px;
            }
            .qr {
                width: 140px;
                height: 140px;
                background: #ffffff;
                padding: 10px;
                border-radius: 16px;
                box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
            }
            .footer {
                position: absolute;
                bottom: 22px;
                left: 32px;
                right: 32px;
                display: flex;
                justify-content: space-between;
                font-size: 11px;
                color: #94a3b8;
            }
            .meta {
                font-weight: 700;
                color: #0f172a;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="brand">
                <img class="logo" src="data:image/svg+xml;base64,{{ $logoBase64 }}" alt="DStars Premium Fitness">
                <div class="status">Verified</div>
            </div>

            <div class="content">
                <div class="details">
                    <div class="label">Member</div>
                    <p class="name">{{ $member->full_name }}</p>
                    <div class="row"><span class="label">Membership ID</span><br><span class="meta">{{ $member->membership_id }}</span></div>
                    <div class="row"><span class="label">Email</span><br>{{ $member->email }}</div>
                    @if(!empty($member->phone))
                        <div class="row"><span class="label">Phone</span><br>{{ $member->phone }}</div>
                    @endif
                    <div class="row"><span class="label">Join Date</span><br>{{ optional($member->created_at)->format('M d, Y') }}</div>
                </div>

                <div class="qr">
                    <img src="data:image/png;base64,{{ $qrBase64 }}" width="140" height="140" alt="QR Code">
                </div>
            </div>

            <div class="footer">
                <span>Status: <strong>Active</strong></span>
                <span>Scan QR for validation</span>
            </div>
        </div>
    </body>
</html>

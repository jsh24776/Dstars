<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your DStars Member Portal Access</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f3f4f6; padding: 24px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
    <tr>
        <td style="background-color: #111827; padding: 24px 32px; color: #ffffff;">
            <h1 style="margin: 0; font-size: 20px; font-weight: 800;">Welcome to DStars Member Portal</h1>
            <p style="margin: 8px 0 0; font-size: 13px; color: #9ca3af;">
                Your account has been created by the DStars team.
            </p>
        </td>
    </tr>
    <tr>
        <td style="padding: 24px 32px; color: #111827; font-size: 14px;">
            <p style="margin-top: 0;">Hi {{ $member->full_name }},</p>
            <p>
                You can now access the DStars member portal using the credentials below. For security, we recommend
                changing your password after your first login.
            </p>

            <table cellpadding="0" cellspacing="0" style="width: 100%; margin: 16px 0; font-size: 13px;">
                <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Portal URL</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #111827;">
                        {{ config('app.frontend_url', 'http://localhost:3000') }}/member/login
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Email</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #111827;">
                        {{ $member->email }}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #6b7280;">Temporary password</td>
                    <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #111827;">
                        {{ $plainPassword }}
                    </td>
                </tr>
            </table>

            <p style="margin-top: 16px;">
                After signing in, go to the <strong>Profile → Change Password</strong> section to set a new password
                only you know.
            </p>

            <p style="margin-top: 24px; font-size: 12px; color: #6b7280;">
                If you did not expect this email, you can safely ignore it.
            </p>
        </td>
    </tr>
</table>
</body>
</html>


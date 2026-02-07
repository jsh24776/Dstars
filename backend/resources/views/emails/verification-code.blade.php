<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Email Verification</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f7fb;">
        <div style="max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 10px; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
            <h2 style="margin-top: 0; color: #1f2937;">Verify your email</h2>
            <p style="color: #4b5563; line-height: 1.6;">
                Hi {{ $user->name ?? 'there' }},<br>
                Use the verification code below to finish creating your DStars Fitness account.
            </p>

            <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center;">
                <span style="font-size: 28px; letter-spacing: 6px; font-weight: 700; color: #111827;">
                    {{ $code }}
                </span>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                This code expires in 10 minutes. If you did not request this, you can safely ignore this email.
            </p>

            <p style="color: #9ca3af; font-size: 12px;">
                DStars Premium Fitness
            </p>
        </div>
    </body>
</html>

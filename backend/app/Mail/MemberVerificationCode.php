<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MemberVerificationCode extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $fullName,
        public string $code
    ) {
    }

    public function build(): self
    {
        return $this
            ->subject('Your DStars Fitness Verification Code')
            ->view('emails.member-verification-code');
    }
}

<?php

namespace App\Mail;

use App\Models\Member;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MemberCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Member $member,
        public string $plainPassword
    ) {
    }

    public function build(): self
    {
        return $this
            ->subject('Your DStars Member Portal Access')
            ->view('emails.member-credentials');
    }
}


<?php

namespace App\Services\Members;

use App\Models\Member;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class MemberCardService
{
    public function buildCard(Member $member): string
    {
        if (! $member->membership_id) {
            $member->forceFill([
                'membership_id' => $this->formatMembershipId($member->id),
            ])->save();
        }

        $path = $member->virtual_card_path ?: $this->defaultPath($member);

        if ($member->virtual_card_path && Storage::disk('local')->exists($path)) {
            return $path;
        }

        $qrUrl = URL::temporarySignedRoute(
            'members.validate',
            now()->addYear(),
            ['member' => $member->id]
        );

        $qrBase64 = $this->buildQrBase64($qrUrl);
        $logoBase64 = $this->buildLogoBase64();

        $pdf = Pdf::loadView('pdfs.member-card', [
            'member' => $member,
            'qrBase64' => $qrBase64,
            'logoBase64' => $logoBase64,
        ])->setPaper([0, 0, 640, 400]);

        Storage::disk('local')->makeDirectory('member-cards');
        $written = Storage::disk('local')->put($path, $pdf->output());

        if (! $written) {
            throw new \RuntimeException('Unable to write virtual card file.');
        }

        if (! $member->virtual_card_path) {
            $member->forceFill([
                'virtual_card_path' => $path,
            ])->save();
        }

        return $path;
    }

    protected function defaultPath(Member $member): string
    {
        return 'member-cards/' . $member->membership_id . '.pdf';
    }

    protected function formatMembershipId(int $id): string
    {
        return 'DSTARS-' . str_pad((string) $id, 6, '0', STR_PAD_LEFT);
    }

    protected function buildQrBase64(string $text): string
    {
        $result = (new Builder(
            writer: new PngWriter(),
            data: $text,
            encoding: new Encoding('UTF-8'),
            size: 240,
            margin: 0
        ))->build();

        return base64_encode($result->getString());
    }

    protected function buildLogoBase64(): string
    {
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="220" height="54" viewBox="0 0 220 54">
  <rect width="220" height="54" rx="12" fill="#0f172a"/>
  <text x="20" y="35" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#ffffff">DSTARS</text>
  <circle cx="190" cy="27" r="6" fill="#f97316"/>
</svg>
SVG;

        return base64_encode($svg);
    }
}

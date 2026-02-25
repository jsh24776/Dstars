<?php

return [
    /*
    |----------------------------------------------------------------------
    | Concierge Catalog
    |----------------------------------------------------------------------
    |
    | Keep non-database concierge context here for now (trainers/classes/
    | offers). Membership plans are loaded from the database at runtime.
    |
    */
    'trainers' => [
        [
            'name' => 'Marcus Thorne',
            'specialty' => 'Powerlifting and strength progression',
            'experience_level' => ['intermediate', 'advanced'],
            'achievements' => ['Regional powerlifting champion'],
            'availability' => ['Mon 8:00 AM', 'Wed 6:00 PM', 'Fri 7:00 AM'],
        ],
        [
            'name' => 'Julian Ross',
            'specialty' => 'Body recomposition and conditioning',
            'experience_level' => ['beginner', 'intermediate'],
            'achievements' => ['Certified strength and conditioning specialist'],
            'availability' => ['Tue 10:30 AM', 'Thu 5:30 PM', 'Sat 9:00 AM'],
        ],
        [
            'name' => 'Elena Vance',
            'specialty' => 'Mobility, recovery, and endurance support',
            'experience_level' => ['beginner', 'intermediate'],
            'achievements' => ['Sports rehab and mobility specialist'],
            'availability' => ['Mon 4:00 PM', 'Wed 4:00 PM', 'Sat 11:00 AM'],
        ],
    ],

    'class_schedule' => [
        ['time' => '08:00 AM', 'activity' => 'Powerlifting Fundamentals', 'trainer' => 'Marcus Thorne', 'capacity' => '12/15'],
        ['time' => '10:30 AM', 'activity' => 'Metabolic Conditioning', 'trainer' => 'Julian Ross', 'capacity' => '18/20'],
        ['time' => '04:00 PM', 'activity' => 'Mobility and Flow', 'trainer' => 'Elena Vance', 'capacity' => '10/10'],
        ['time' => '06:00 PM', 'activity' => 'Elite Performance', 'trainer' => 'Marcus Thorne', 'capacity' => '08/15'],
    ],

    'promotions' => [
        [
            'title' => 'Starter Offer',
            'details' => 'Free onboarding consultation when signing up for Professional or Elite.',
            'valid_until' => null,
        ],
    ],
];

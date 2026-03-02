<?php

return [
    // For development, apply CORS to all routes
    'paths' => ['*'],
    
    'allowed_methods' => ['*'],
    
    // Hardcode for development
    'allowed_origins' => [
        'http://localhost:3000',
        'http://localhost:5173', // If using Vite default port
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => ['*'],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
];
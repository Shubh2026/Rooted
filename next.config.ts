import type { NextConfig } from 'next';

// ─── Content-Security-Policy ──────────────────────────────────────────────────
// Allows: self, Google Fonts, inline styles for Framer Motion, recharts data URIs
const ContentSecurityPolicy = `
  default-src 'self';
  script-src  'self' 'unsafe-eval' 'unsafe-inline';
  style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src    'self' https://fonts.gstatic.com;
  img-src     'self' data: blob:;
  connect-src 'self';
  frame-ancestors 'none';
  base-uri    'self';
  form-action 'self';
`
  .replace(/\s{2,}/g, ' ')
  .trim();

const securityHeaders = [
  {
    // Prevents browsers from MIME-sniffing a response away from the declared content-type
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Blocks all framing — stronger than SAMEORIGIN for a pure SPA
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Enforces HTTPS for 2 years, includes sub-domains, eligible for preload
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    // Stops the browser sending full URL in Referer header cross-origin
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Restricts access to browser features not used by this app
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to every route
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

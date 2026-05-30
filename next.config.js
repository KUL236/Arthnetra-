/** @type {import('next').NextConfig} */
const nextConfig = {
  // Do NOT use output: 'standalone' — incompatible with @netlify/plugin-nextjs
  
  // Disable Next.js font optimization — it tries to fetch & inline Google Fonts
  // at build time which fails in Netlify's sandboxed build environment.
  // Fonts are loaded normally via <link> tags in layout.tsx instead.
  optimizeFonts: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gjgtbdoaqgbazbluytxr.supabase.co',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

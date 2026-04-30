/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value:
                            "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://api.mapbox.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://api.mapbox.com https://images.unsplash.com; connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://api.unsplash.com;",
                    },
                ],
            },
            {
                source: '/login',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
            {
                source: '/register',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups',
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig

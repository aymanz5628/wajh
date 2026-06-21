import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    turbopack: {
        root: path.resolve(__dirname),
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'plus.unsplash.com' },
            { protocol: 'https', hostname: 'ui-avatars.com' },
            { protocol: 'http', hostname: '127.0.0.1' },
            { protocol: 'http', hostname: 'localhost' },
            { protocol: 'https', hostname: 'res.cloudinary.com' },
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;

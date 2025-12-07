/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['yourapp.vercel.app'],
    },
    webpack: (config) => {
        config.externals.push('pino-pretty', 'lokijs', 'encoding', '@react-native-async-storage/async-storage')
        return config
    },
}

module.exports = nextConfig

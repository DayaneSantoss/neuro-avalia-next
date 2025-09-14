/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sbliphearljgdtlcknnk.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/files/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    
  },
};

export default nextConfig;
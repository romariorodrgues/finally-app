import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move serverComponentsExternalPackages to the new location
  serverExternalPackages: ['@auth/supabase-adapter']
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const repoName = "techcombank-challenge-v2";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.NODE_ENV === "production" ? `/${repoName}` : "",
  assetPrefix: process.env.NODE_ENV === "production" ? `/${repoName}/` : "",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;

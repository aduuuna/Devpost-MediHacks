// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   images: {
//     domains: ['images.unsplash.com'],
//   },
// };

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // Optional: Uncomment and set if using a base path
  // basePath: '/<your-repository-name>',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;

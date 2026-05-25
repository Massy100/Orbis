const nextConfig = {
  output: 'standalone',  
  images: {
    unoptimized: true,  
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig

module.exports = nextConfig
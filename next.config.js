// Import statements using ECMAScript module syntax
import DuplicatePackageCheckerPlugin from '@cerner/duplicate-package-checker-webpack-plugin'
import bundleAnalyzer from '@next/bundle-analyzer'
import { castToSass } from './libs/sass-utils/index.js'
import sassVars from './styles/config.js'

// Exported configuration object
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
    nextScriptWorkers: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development',
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'a-us.storyblok.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.darkroom.engineering',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  sassOptions: {
    includePaths: ['styles'],
    prependData: `
      @import 'styles/_functions';
    `,
    functions: {
      'get($keys)': function (keys) {
        keys = keys.getValue().split('.')
        let result = sassVars
        for (let i = 0; i < keys.length; i++) {
          result = result[keys[i]]
        }
        result = castToSass(result)

        return result
      },
      // 'getColors()': function () {
      //   return castToSass(sassVars.colors)
      // },
      // 'getThemes()': function () {
      //   return castToSass(sassVars.themes)
      // },
    },
  },
  webpack: (config, options) => {
    const { dir } = options

    config.module.rules.push(
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              memo: true,
              dimensions: false,
              svgoConfig: {
                multipass: true,
                plugins: [
                  'removeDimensions',
                  'removeOffCanvasPaths',
                  'reusePaths',
                  'removeElementsByAttr',
                  'removeStyleElement',
                  'removeScriptElement',
                  'prefixIds',
                  'cleanupIds',
                  {
                    name: 'cleanupNumericValues',
                    params: {
                      floatPrecision: 1,
                    },
                  },
                  {
                    name: 'convertPathData',
                    params: {
                      floatPrecision: 1,
                    },
                  },
                  {
                    name: 'convertTransform',
                    params: {
                      floatPrecision: 1,
                    },
                  },
                  {
                    name: 'cleanupListOfValues',
                    params: {
                      floatPrecision: 1,
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(graphql|gql)$/,
        include: [dir],
        exclude: /node_modules/,
        use: [
          {
            loader: 'graphql-tag/loader',
          },
        ],
      },
    )

    config.plugins.push(
      new DuplicatePackageCheckerPlugin({
        verbose: true,
        emitError: true,
        showHelp: true,
        strict: false,
        exclude: (instance) => instance.name === 'fbjs',
        alwaysEmitErrorsFor: ['react', 'react-router'],
      }),
    )

    return config
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://app.storyblok.com/",
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  redirects: async () => {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  rewrites: async () => {
    return [
      {
        source: '/',
        destination: '/home',
      },
    ]
  },
}

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withBundleAnalyzer(nextConfig)

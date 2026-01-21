import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'blocks/index': 'src/blocks/index.ts',
    'blocks/rental-objects/index': 'src/blocks/rental-objects/index.ts',
    'blocks/booking/index': 'src/blocks/booking/index.ts',
    'blocks/seasons/index': 'src/blocks/seasons/index.ts',
    'booking-engine/index': 'src/booking-engine/index.ts',
    'features/index': 'src/features/index.ts',
    'features/rental-objects/index': 'src/features/rental-objects/index.ts',
    'features/booking/index': 'src/features/booking/index.ts',
    'features/seasons/index': 'src/features/seasons/index.ts',
  },
  format: ['cjs', 'esm'],
  // DTS disabled due to circular dependency with @xalatechnologies/platform/ui
  // Types are available via TypeScript's direct source access when using bundlers
  // TODO: Re-enable once @xalatechnologies/platform/ui no longer depends on @digilist/ui
  dts: false,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    'react',
    'react-dom',
    '@xalatechnologies/platform/ui',
    '@xala/i18n',
    '@digilist/contracts',
    // Mapbox dependencies - marked as external since they require an API key
    // and should be optional peer dependencies
    'react-map-gl',
    'react-map-gl/mapbox',
    'mapbox-gl',
    'mapbox-gl/dist/mapbox-gl.css',
  ],
});

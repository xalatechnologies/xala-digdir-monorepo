import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'compat/index': 'src/compat/index.ts',
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
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    // Designsystemet - provided externally
    '@digdir/designsystemet-react',
    // Platform package - marked as external (provided by apps)
    /^@xalatechnologies\/platform/,
    '@xala/i18n',
    '@digilist/contracts',
    '@digilist/runtime',
    // Mapbox dependencies - marked as external since they require an API key
    // and should be optional peer dependencies
    'react-map-gl',
    'react-map-gl/mapbox',
    'mapbox-gl',
    'mapbox-gl/dist/mapbox-gl.css',
    // TanStack React Query
    '@tanstack/react-query',
  ],
});

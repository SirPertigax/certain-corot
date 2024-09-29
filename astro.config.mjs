import { defineConfig } from 'astro/config';
import { convertCsvToJson } from './scripts/csvToJson.mjs';

export default defineConfig({
  // Tus otras configuraciones de Astro aquí
  vite: {
    logLevel: 'info',
    define: {
      'process.env.DEBUG': true,
    },
    plugins: [
      {
        name: 'csv-to-json',
        buildStart: async () => {
          console.log('Iniciando conversión de CSV a JSON...');
          await convertCsvToJson();
        },
      },
    ],
  },
});
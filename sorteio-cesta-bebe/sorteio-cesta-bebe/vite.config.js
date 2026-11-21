import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// `npm run build:demo` gera uma prévia de arquivo único com dados de exemplo (sem Supabase).
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];
  if (mode === 'demo') {
    const { viteSingleFile } = await import('vite-plugin-singlefile');
    const swap = {
      '/src/lib/supabase.js': path.resolve('src/demo/supabase.demo.js'),
      '/src/lib/api.js': path.resolve('src/demo/api.demo.js'),
    };
    plugins.push({
      name: 'demo-swap',
      enforce: 'pre',
      async resolveId(src, importer) {
        const r = await this.resolve(src, importer, { skipSelf: true });
        if (!r) return null;
        const hit = Object.keys(swap).find((k) => r.id.endsWith(k));
        return hit ? swap[hit] : null;
      },
    }, viteSingleFile());
  }
  return { plugins, build: mode === 'demo' ? { outDir: 'dist-demo', assetsInlineLimit: 100000000 } : {} };
});

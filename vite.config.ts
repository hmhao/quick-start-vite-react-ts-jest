import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteEslint from 'vite-plugin-eslint';
import path from 'path';
import viteFmpa from './scripts/vite-plugin-fmpa';

function _resolve(dir: string) {
  return path.resolve(__dirname, dir);
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    // 配置项目别名
    alias: {
      '@': _resolve('src'),
    },
  },
  plugins: [
    react(),
    viteEslint({
      failOnError: false,
    }),
    viteFmpa({
      dir: 'src/pages',
      // publicPath: _resolve('dist'),
      entry: 'main.tsx',
      publicTemplateSrc: _resolve('index.html'),
      replace: {
        title: 'Vite + React + TS',
      },
    }),
  ],
});

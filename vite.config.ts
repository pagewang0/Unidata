import { defineConfig } from 'vite';
import path from 'path';
import { version } from './package.json';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'Unidata',
            formats: ['umd'],
            fileName: () => `unidata.js`,
        },
    },
    define: {
        SDK_VERSION: JSON.stringify(version),
        global: 'window',
    },
    server: {
        base: '/demo/',
    },
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    resolve: {
        alias: {
            'node-fetch': 'isomorphic-fetch',
        },
    },
});

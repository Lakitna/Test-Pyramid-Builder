import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import CleanCSS from 'clean-css';
import cleanup from 'rollup-plugin-cleanup';
import del from 'rollup-plugin-delete';
import copy from 'rollup-plugin-copy';
import { minify as minifyHtml } from 'html-minifier-terser';

/**
 * Minify the static assets that `copy` drops next to the web bundle (HTML + CSS).
 * Runs in writeBundle, after the copied files and the terser'd JS are on disk.
 */
function minifyStaticAssets() {
    return {
        name: 'minify-static-assets',
        async writeBundle(outputOptions) {
            const dir = dirname(outputOptions.file ?? outputOptions.dir);
            const cssPath = resolve(dir, 'styles.css');
            await writeFile(cssPath, new CleanCSS({ level: 1 }).minify(await readFile(cssPath, 'utf8')).styles);
            const htmlPath = resolve(dir, 'index.html');
            await writeFile(
                htmlPath,
                await minifyHtml(await readFile(htmlPath, 'utf8'), {
                    collapseWhitespace: true,
                    conservativeCollapse: true, // keep one space where whitespace is semantic
                    removeComments: true,
                    removeOptionalTags: true,
                })
            );
        },
    };
}

/**
 * @type {import('rollup').RollupOptions[]}
 */
export default [
    {
        input: './src/index.ts',
        output: [{ file: 'dist/web/generator.js', format: 'es' }],
        plugins: [
            del({
                targets: 'dist/web/*',
            }),

            typescript({
                tsconfig: './tsconfig.json',
            }),

            cleanup({
                extensions: ['.ts', '.js'],
            }),

            terser({
                format: { comments: false },
            }),

            copy({
                targets: [
                    { src: 'src/index.html', dest: 'dist/web' },
                    { src: 'src/styles.css', dest: 'dist/web' },
                    { src: 'src/fonts/*.woff2', dest: 'dist/web/fonts' },
                ],
            }),

            minifyStaticAssets(),
        ],
    },
];

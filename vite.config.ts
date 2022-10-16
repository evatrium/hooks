// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference types="vitest/config" />
/// <reference types="vite/client" />
import { resolve as pathResolve } from 'node:path';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';
import { configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
// @ts-ignore
import packageJson from './package.json';

const resolve = (path: string) => pathResolve(__dirname, path);

const getPackageName = (name = ''): string => {
	let nameToUse = name;
	if (name.startsWith('@')) nameToUse = name.split('/')[1];
	return nameToUse.replace(/-./g, (char) => char[1].toUpperCase());
};

const { name, types, dependencies } = packageJson;

// app
const appDir = 'app';
const appFile = 'index.ts';

// lib
const libDir = 'src';
const libFile = 'index.ts';
const libEntry = resolve('src/index.ts');

const pkgName = getPackageName(name);
const fileNames = {
	es: `${pkgName}.mjs`,
	cjs: `${pkgName}.cjs`,
	iife: `${pkgName}.iife.js`
};

const formats = Object.keys(fileNames);
const external = Object.keys(dependencies);

// @ts-ignore
export default defineConfig((ConfigEnv) => {
	return {
		resolve: {
			alias: {
				'~': resolve('src')
			}
		},
		plugins: [
			tsConfigPaths(),
			react(),
			dts({
				// // @ts-ignore
				insertTypesEntry: true,
				exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/_testUtils.ts', 'app'],
				beforeWriteFile: (filePath, content) => {
					return {
						filePath: filePath.replace(libDir, 'types'),
						content
					};
				}
			})
		],
		test: {
			globals: true,
			watch: false,
			environment: 'jsdom',
			setupFiles: './vitest.setup.ts',
			resolveSnapshotPath: (testPath, snapExtension) => testPath + snapExtension,
			include: ['src/**/*.test.ts', 'src/**/*.test.tsx']
		},
		build: {
			lib: {
				entry: libEntry,
				name: pkgName,
				formats,
				fileName: (format) => fileNames[format]
			},
			rollupOptions: { external }
		}
	};
});

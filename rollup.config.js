import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import copy from 'rollup-plugin-copy';

const target = process.env.BUILD_TARGET;
const version = process.env.VERSION;

if (!version) {
    console.error('VERSION is required. Use build.js or set VERSION env var.');
    process.exit(1);
}

// Userscript banner
const userscriptBanner = `// ==UserScript==
// @name            EngineBlock
// @namespace       https://github.com/Hogwai/EngineBlock/
// @version         ${version}
// @description     Remove vehicles cards on lacentrale.fr containing vehicles with specified engines and also ads containers
// @description:fr  Enlève les annonces sur lacentrale.fr contenant les véhicules avec des motorisations spécifiques, ainsi que les conteneurs de publicités
// @author          Hogwai
// @license         MIT
// @match           https://lacentrale.fr/*
// @match           https://www.lacentrale.fr/*
// @grant           none
// ==/UserScript==
`;

function manifestWithVersion(src, dest) {
    return {
        name: `manifest-version(${dest})`,
        writeBundle() {
            const manifest = JSON.parse(readFileSync(src, 'utf8'));
            manifest.version = version;
            mkdirSync(dest, { recursive: true });
            writeFileSync(`${dest}/manifest.json`, JSON.stringify(manifest, null, 2) + '\n');
        }
    };
}

function copySharedAssets(dest) {
    return copy({
        targets: [
            { src: 'static/shared/popup.html', dest },
            { src: 'static/shared/popup.css', dest },
            { src: 'static/shared/icons/*', dest },
            { src: 'static/shared/_locales', dest },
            { src: 'LICENSE', dest },
        ],
        hook: 'writeBundle',
    });
}

const chromeBundles = [
    {
        input: 'src/extension/content.js',
        output: { file: 'dist/chrome/content.js', format: 'iife' },
    },
    {
        input: 'src/extension/background.js',
        output: { file: 'dist/chrome/background.js', format: 'iife' },
    },
    {
        input: 'src/extension/popup.js',
        output: { file: 'dist/chrome/popup.js', format: 'iife' },
        plugins: [
            copySharedAssets('dist/chrome'),
            manifestWithVersion('static/chrome/manifest.json', 'dist/chrome'),
        ],
    },
];

const firefoxBundles = [
    {
        input: 'src/extension/content.js',
        output: { file: 'dist/firefox/content.js', format: 'iife' },
    },
    {
        input: 'src/extension/background.js',
        output: { file: 'dist/firefox/background.js', format: 'iife' },
    },
    {
        input: 'src/extension/popup.js',
        output: { file: 'dist/firefox/popup.js', format: 'iife' },
        plugins: [
            copySharedAssets('dist/firefox'),
            manifestWithVersion('static/firefox/manifest.json', 'dist/firefox'),
        ],
    },
];

const userscriptBundles = [
    {
        input: 'src/userscript/content.js',
        output: {
            file: 'dist/userscript/EngineBlock.user.js',
            format: 'iife',
            banner: userscriptBanner,
            intro: `const __VERSION__ = '${version}';`,
        },
    },
];

const targets = {
    chrome: chromeBundles,
    firefox: firefoxBundles,
    userscript: userscriptBundles,
};

if (target && !targets[target]) {
    console.error(`Unknown BUILD_TARGET="${target}". Expected: chrome, firefox, userscript`);
    process.exit(1);
}

export default target ? targets[target] : [...chromeBundles, ...firefoxBundles, ...userscriptBundles];

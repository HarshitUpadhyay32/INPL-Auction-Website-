/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const path = 'src/components/player-auction-card.tsx';
let code = fs.readFileSync(path, 'utf8');

// Replace sm: with @3xl: to use container queries for the layout break
// This prevents it from breaking when placed in narrow containers on wide screens
code = code.replace(/<div className={`relative w-full/g, '<div className={`@container relative w-full');
code = code.replace(/sm:/g, '@3xl:');

// Ensure base price box uses absolute on large containers, but static/relative on small containers if needed, 
// actually @3xl handles it.

fs.writeFileSync(path, code);

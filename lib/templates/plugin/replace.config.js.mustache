const pkg = require( './package.json' );
let from = [];
let to = [];

// Place any from Regular expressions that require variables here
const versionConstant = new RegExp(
	`define\\( '${ pkg.config.slugSnakeCase.toUpperCase() }_PLUGIN_VERSION', '[0-9\.]+' \\);`,
	'g'
);

// All 'from' regex's
from = [
	/^(\*\*|)Stable tag:(\*\*|)(\s*?)[a-zA-Z0-9.-]+(\s*?)$/im,
	/Version:(\s*?)[0-9\.]+$/m,
	versionConstant,
];

// All 'to' regex's
// These are sequentially listed and correspond to the same place in the 'from'
to = [
	() => `Stable tag: ${ pkg.version }`,
	() => `Version: ${ pkg.version }`,
	() => `define( '${ pkg.config.slugSnakeCase.toUpperCase() }_PLUGIN_VERSION', '${ pkg.version }' );`,
];

// replaces from and to sequentially
const config = {
	files: [
		'./readme.txt',
		`./${ pkg.config.slug }.php`,
		`./composer.json`,
	],
	from,
	to,
	countMatches: true,
};

module.exports = config;

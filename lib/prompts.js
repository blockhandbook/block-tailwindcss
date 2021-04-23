// Prompts to ask the user when to generate scaffolding files.
// Prompt types: https://www.npmjs.com/package/inquirer#question

/**
 * External dependencies
 */
const { isEmpty, upperFirst } = require( 'lodash' );

const template = {
	type: 'checkbox',
	name: 'template',
	message: `The plugin template(s) you'd like to use:`,
	choices: [
		'blockPattern', 'dynamicBlock', 'dynamicTeamCustomPostTypeBlock', 'dynamicTestimonialCustomPostTypeWithMetaBlock', 'filter', 'format', 'frontendBlock', 'innerBlock', 'innerBlockWithVariations', 'richTextBlock', 'richTextBlockWithPluginSidebar', 'richTextBlockWithDeprecated', 'richTextBlockWithTransforms', 'staticBlock', 'staticBlockWithStyles', 'default'
	],
	validate( input ) {
		if ( input.length < 1 ) {
			return 'Please select a plugin template.';
		}

		return true;
	},
};

const slug = {
	type: 'input',
	name: 'slug',
	message:
		'The plugin slug used for identification (also the plugin and output folder name):',
	validate( input ) {
		if ( ! /^[a-z][a-z0-9\-]*$/.test( input ) ) {
			return 'Invalid plugin slug specified. Block slug can contain only lowercase alphanumeric characters or dashes, and start with a letter.';
		}

		return true;
	},
};

const namespace = {
	type: 'input',
	name: 'namespace',
	message:
		'The internal namespace for the plugin name (something unique for your products):',
	validate( input ) {
		if ( ! /^[a-z][a-z0-9\-]*$/.test( input ) ) {
			return 'Invalid block namespace specified. Block namespace can contain only lowercase alphanumeric characters or dashes, and start with a letter.';
		}

		return true;
	},
};

const title = {
	type: 'input',
	name: 'title',
	message: 'The display title for your plugin:',
	filter( input ) {
		return input && upperFirst( input );
	},
};

const description = {
	type: 'input',
	name: 'description',
	message: 'The short description for your plugin (optional):',
	filter( input ) {
		return input && upperFirst( input );
	},
};

// const dashicon = {
// 	type: 'input',
// 	name: 'dashicon',
// 	message:
// 		'The dashicon to make it easier to identify your block (optional):',
// 	validate( input ) {
// 		if ( ! isEmpty( input ) && ! /^[a-z][a-z0-9\-]*$/.test( input ) ) {
// 			return 'Invalid dashicon name specified. Visit https://developer.wordpress.org/resource/dashicons/ to discover available names.';
// 		}

// 		return true;
// 	},
// 	filter( input ) {
// 		return input && input.replace( /dashicon(s)?-/, '' );
// 	},
// };

// const category = {
// 	type: 'list',
// 	name: 'category',
// 	message: 'The category name to help users browse and discover your block:',
// 	choices: [ 'common', 'embed', 'formatting', 'layout', 'widgets' ],
// };

const author = {
	type: 'input',
	name: 'author',
	message:
		'The name of the plugin author (optional). Multiple authors may be listed using commas:',
};

const authorURI = {
	type: 'input',
	name: 'authorURI',
	message: 'A link to the plugin authors website (optional):',
};

const authorEmail = {
	type: 'input',
	name: 'authorEmail',
	message:
		'The email address used for language translation contacts (optional):',
	validate( input ) {
		if ( ! /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test( input ) ) {
			return 'Invalid email address.';
		}

		return true;
	},
};

const pluginURI = {
	type: 'input',
	name: 'pluginURI',
	message: 'A link to the plugin\'s website (optional):',
};

const license = {
	type: 'input',
	name: 'license',
	message: 'The short name of the plugin’s license (optional):',
};

const licenseURI = {
	type: 'input',
	name: 'licenseURI',
	message: 'A link to the full text of the license (optional):',
};

const version = {
	type: 'input',
	name: 'version',
	message: 'The current version number of the plugin:',
	validate( input ) {
		// Regular expression was copied from https://semver.org.
		const validSemVerPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
		if ( ! validSemVerPattern.test( input ) ) {
			return 'Invalid Semantic Version provided. Visit https://regex101.com/r/vkijKf/1/ to discover all valid patterns.';
		}

		return true;
	},
};

const cssFramework = {
	type: 'list',
	name: 'cssFramework',
	message: 'Would you like to use a css framework?',
	choices: [ 'Tailwindcss', 'None' ],
	default: 'public',
};

const server = {
		type: 'confirm',
		name: 'server',
		message: 'Would you like a development server?',
	};

const port = {
	type: 'input',
	name: 'port',
	message: 'What port would you like the server on?',
	when: (answers) => answers.server,
	validate( input ) {
		// Regular expression was copied from https://stackoverflow.com/questions/42674717/regex-match-exactly-4-digits.
		const validSemVerPattern = /^SW\d{4}$/;
		if ( validSemVerPattern.test( input ) ) {
			return 'Invalid Port Number provided. Visit https://developer.wordpress.org/block-editor/packages/packages-env/#2-check-the-port-number see learn more about ports.';
		}

		return true;
	},
};

const git = {
		type: 'confirm',
		name: 'git',
		message: 'Would you like to create a repository on github?',
	};

module.exports = {
	template,
	slug,
	namespace,
	title,
	description,
	// dashicon,
	// category,
	author,
	authorEmail,
	license,
	licenseURI,
	authorURI,
	pluginURI,
	version,
	cssFramework,
	server,
	port,
	git,
};

// Scaffold generates all template files based on user input & defaults.
/**
 * External dependencies
 */
const { dirname, join } = require( 'path' );
const makeDir = require( 'make-dir' );
const { readFile, writeFile } = require( 'fs' ).promises;
const { render } = require( 'mustache' );
const { snakeCase, camelCase } = require( 'lodash' );
const pascalcase = require('pascalcase');

/**
 * Internal dependencies
 */
const { getOutputFiles } = require( './templates' );
const { copyFile } = require('fs');

module.exports = async function(
	templateName,
	{
		cssFramework,
		namespace,
		slug,
		title,
		description,
		dashicon,
		category,
		author,
		authorEmail,
		authorURI,
		pluginURI,
		license,
		licenseURI,
		version,
		server,
		port,
		'@blockhandbook/tailwindcss': tailwindcssVersion,
		'@blockhandbook/tailwindcss-controls': tailwindcssControlsVersion,
		'@blockhandbook/bootstrap': bootstrapVersion,
		'@blockhandbook/bootstrap-controls':bootstrapControlsVersion,
		'@blockhandbook/controls': controlsVersion,
		'@blockhandbook/data':dataVersion,
		'@blockhandbook/block-hot-loader': blockHotLoaderVersion,
		'@blockhandbook/block-fast-refresh': blockFastRefreshVersion,
		load_dynamic_blocks,
		register_block_patterns,
		register_blocks,
		register_team_custom_post_type,
		register_testimonial_custom_post_type,
		register_plugin_settings,
		register_rest_api,
		registerBlocks,
		registerCategories,
		registerPlugins,
		registerFilters,
		registerFormats,
		registerFrontend,
		registerStores,
		registerVariations,
		softwareLicensing,
	}
) {

	const bootstrap = cssFramework.toLowerCase() === 'bootstrap',
				tailwindcss = cssFramework.toLowerCase() === 'tailwindcss',
				noCssFramework = cssFramework.toLowerCase() === 'none';
	slug = slug.toLowerCase();
	namespace = namespace.toLowerCase();
	const phpClassName = pascalcase( namespace );

	let view = {
		bootstrap,
		tailwindcss,
		noCssFramework,
		namespace,
		namespaceSnakeCase: snakeCase( namespace ),
		phpClassName,
		slug,
		slugConstant: snakeCase( slug ).toUpperCase(),
		slugSnakeCase: snakeCase( slug ),
		slugCamelCase: camelCase( slug ),
		title,
		description,
		dashicon,
		category,
		version,
		author,
		authorEmail,
		authorURI,
		pluginURI,
		license,
		licenseURI,
		textdomain: namespace,
		port,
		testsPort: parseInt( port ) + 1,
		server,
		tailwindcssVersion,
		tailwindcssControlsVersion,
		bootstrapVersion,
		bootstrapControlsVersion,
		controlsVersion,
		dataVersion,
		blockHotLoaderVersion,
		blockFastRefreshVersion,
		load_dynamic_blocks,
		register_block_patterns,
		register_blocks,
		register_team_custom_post_type,
		register_testimonial_custom_post_type,
		register_plugin_settings,
		register_rest_api,
		registerBlocks,
		registerCategories,
		registerPlugins,
		registerFilters,
		registerFormats,
		registerFrontend,
		registerStores,
		registerVariations,
		softwareLicensing,
	};

	// Output template files
	await Promise.all(
		getOutputFiles( templateName )
			.filter( ( file ) => {
				// Here are a few cases where we filter out certain template files that are included in template.js but should not be rendered b/c of user choices.
				if( file.includes( 'bootstrap' ) && ! bootstrap ) {
					return false;
				}
				if( file.includes( 'tailwind' ) && ! tailwindcss ) {
					return false;
				}
				// When using noCssFramework, if building single block plugins that registerBlocks we need this filter. Otherwise we'll have an empty class-enqueue-assets.php file b/c assets get registered in class-register-blocks.php.
				// Also originally I enqueued frontend.js assets from class-enqueue-assets so I also had a flag ! registerFrontend.  I've since moved frontend.js to be enqueued by class-register-blocks.php
				if( file.includes( 'EnqueueAssets' ) && registerBlocks && noCssFramework ) {
					return false;
				}
				return true;
			} )
			.map( async ( file ) => {

				if( file.includes( '.png' ) ) {
					const imgFilePath = join(
						__dirname,
						`${ file }`
					);

					const outputFilePath = join( `${ slug }/${ file.replace(
						/\$slug/g,
						slug
					) }` );

					await makeDir( dirname( outputFilePath ) );
					copyFile( imgFilePath, outputFilePath, ( err ) => {
						if (err) {
							throw err
						} else {
						}
					} );
				} else {
					const template = await readFile(
						join(
							__dirname,
							`templates/plugin/${ file }.mustache`
						),
						'utf8'
					);

					// Output files can have names that depend on the slug provided.
					const outputFilePath = `${ slug }/${ file.replace(
						/\$slug/g,
						slug
					) }`;

					await makeDir( dirname( outputFilePath ) );
					writeFile( outputFilePath, render( template, view ) );
				}
			} )
	);
};

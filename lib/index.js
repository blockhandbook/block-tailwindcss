/**
 * External dependencies
 */
const inquirer = require( 'inquirer' );
const program = require( 'commander' );
const { join } = require( 'path' );
const fs = require('fs');
const chalk = require('chalk');
const { command } = require( 'execa' );
const CLI = require('clui');
const Spinner = CLI.Spinner;
const { startCase } = require( 'lodash' );

/**
 * Internal dependencies
 */
const checkSystemRequirements = require( './check-system-requirements' );
const CLIError = require( './cli-error' );
const log = require( './log' );
const { engines, version } = require( '../package.json' );
const scaffold = require( './scaffold' );
const { getDefaultValues, getPrompts, getVersions } = require( './templates' );
const { code, info, success } = require( './log' );
const gitInit = require( './git-init' );
const status = new Spinner(`This might take a few minutes.`);

const commandName = `create-plugin`;
program
	.name( commandName )
	.description(
		'Quickly generate starter plugins for the WordPress block editor, aka Gutenberg.  Choose from a handful of starter plugin templates. Use 1, a couple, a bunch, or all templates simultaneously. \n\n' +
			'The [slug] is optional. When provided it triggers the quick mode where it is used ' +
			'as the block slug used for its identification, the output location for scaffolded files, ' +
			'and the name of the WordPress plugin. The rest of the configuration is set to all default values.'
	)
	.version( version )
	.arguments( '[slug]' )
	.option(
		'-t, --template <items>',
		'comma separated list',
		[ 'default' ]
	)
	.option(
		'-c, --css <name>',
		'CSS framework type, allowed values: "tailwindcss", "bootstrap", "none"',
		'none'
	)
	.option(
		'-s, --server <port>',
		'Server port number, allowed values: "Any usable port number"'
	)
	.option(
		'-g, --git',
		'Add a git repo, allowed values: "Add git flag to initialize git repo"'
	)
	.action( async ( slug, { css, git, server: port, template }	) => {
		// Use for testing options, I can't get command options to run locally...
		// let cssFramework = 'bootstrap';
		// let portNumber = true;
		// let slugName = 'test';
		// let templateName = 'innerBlockWithVariations,richTextBlock,dynamicBlock';
		// let gitRepo = undefined;

		// Need to rename destructured arguments.  If they have the same name as variables defined below in try/catch block, they get overridden by those variable declarations...
		let cssFramework = css;
		let portNumber = port;
		let slugName = slug;
		let templateName = template;
		let gitRepo = git;

		await checkSystemRequirements( engines );
		try {
			let answers;

			if( slugName ) {
				// If templateName is an array we're using [ 'default' ]
				if( ! Array.isArray( templateName ) ) {
					// If templateName includes commas, we're using a comma separated list
					if( templateName.includes( ',' ) ) {
						templateName = templateName.split( ',' );
					} else {
						// If templateName doesn't include commas, we're using a single templateName value
						templateName = [ templateName ];
					}
				}

				answers = {
					template: templateName,
					cssFramework,
					slug: slugName,
					port: !! portNumber ? portNumber : '8888',
					server: !! portNumber,
					title: startCase( slugName ),
					git: !! gitRepo,
				};
			} else {
				answers = await inquirer.prompt( getPrompts( 'default' ) );
			}

			const {
				git,
				port,
				server,
				slug,
				template
			} = answers;

			const dependencies = [
				'@blockhandbook/block-hot-loader',
				'@blockhandbook/block-fast-refresh',
				'@blockhandbook/tailwindcss',
				'@blockhandbook/tailwindcss-controls',
				'@blockhandbook/bootstrap',
				'@blockhandbook/bootstrap-controls',
				'@blockhandbook/controls',
				'@blockhandbook/data',
			];

			// Get latest internal dependency versions for mustache rendered package.json
			// Is there another way to keep these versions up-to-date?
			status.start();
			const versions = await getVersions( dependencies );
			status.stop();

			// Merge template values so we generate the right files
			let mergedDefaultValues = getDefaultValues( template[0] );

			for( let i = 0; i < template.length; i++ ) {
				const defaultValues = getDefaultValues( template[i] );
				for (let [key, value] of Object.entries(defaultValues)) {
					if( mergedDefaultValues[key] ) {
						continue;
					}
					if( defaultValues[key] ) {
						mergedDefaultValues[key] = value;
					}
				}

				await scaffold( template[i], {
					...mergedDefaultValues,
					...answers,
					...versions,
				} );
			}

			const cwd = join( process.cwd(), slug );

			if( git && fs.existsSync('.git') ) {
				console.log(chalk.red('Sorry, this is already a Git repository!'));
			}

			if( git && ! fs.existsSync('.git') ) {
				 await gitInit( slug, answers );
			}

			if( ! git ) {
				code( 'Creating plugin files.' );
			}

			if( ! server ) {
				info( '' );
				code( 'Installing dependencies & compiling plugin files.' );
				status.start();
				await command( 'npm run setup', {
					cwd,
				} );
			}

			if( server ) {
				info( '' );
				code( 'Installing dependencies, compiling plugin files, installing WordPress & firing up a server.' );
				status.start();
				await command( 'npm run server:setup', {
					cwd,
				} );
			}

			await command( 'npm run format:js', {
				cwd,
			} );

			status.stop();

			info('');
			success(`Plugin created in the "${slug}" folder!`);
			info('');

			if( server ) {
				info( `Server launched with WordPress, TwentyTwenty theme, and your plugin installed!` )
				code( `  Go to localhost:${ port }` );
				info( '' );
				info( `Login at localhost:${ port }/wp-admin` );
				code( `  username: admin` );
				code( `  password: password` );
				info( '' );
			}

			info( `Ready to start building?` );
			code( 'You can start by typing:' );
			code( `  cd ${ slug }` );
			code( `  npm run start` );

		} catch ( error ) {
			if ( error instanceof CLIError ) {
				log.error( error.message );
				process.exit( 1 );
			} else {
				throw error;
			}
		}
	} )
	.on( '--help', function() {
		log.info( '' );
		log.info( 'Examples:' );
		log.info( `  npx ${ commandName }` );
		log.info( `  npx ${ commandName } my-plugin` );
		log.info( `  npx ${ commandName } --template blockPattern my-single-template-plugin` );
		log.info( `  npx ${ commandName } -t blockPattern,dynamicBlock,staticBlockWithStyles my-multi-template-plugin` );
		log.info( `  npx ${ commandName } --css tailwindcss my-plugin-with-tailwindcss` );
		log.info( `  npx ${ commandName } -c bootstrap my-plugin-with-bootstrap` );
		log.info( `  npx ${ commandName } --server 8000 my-plugin-with-a-server-at-port-8000` );
		log.info( `  npx ${ commandName } -s 8888 my-plugin-with-a-server-at-port-8888` );
		log.info( `  npx ${ commandName } --git my-plugin-with-a-git-repo` );
	} )
	.parse( process.argv );

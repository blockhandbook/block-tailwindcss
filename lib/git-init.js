// Initialize local and remote github repos
/**
 * External Dependencies
 */
const CLI = require('clui');
const Spinner = CLI.Spinner;
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const Configstore = require('configstore');

/**
 * Internal Dependencies
 */
const { code, info, success } = require( './log' );
const {
	createRemoteRepo,
	getGithubToken,
	githubAuth,
	setupRepo,
} = require('./git-scripts');
const pkg = require('../package.json');

clear();

console.log(
  chalk.yellow(
    figlet.textSync('Create', { horizontalLayout: 'universal smushing', verticalLayout: 'universal smushing' })
  )
);

module.exports = async function gitInit( slug, previousAnswers ) {
  try {
		// Retrieve & Set Authentication Token
		const token = await getGithubToken();
		githubAuth(token);

    // Create remote repository
		const url = await createRemoteRepo( slug, previousAnswers );

		info( '' );
		code( 'Creating plugin files, initializing local git repo & pushing to remote repo.' );
		const status = new Spinner(`This might take a few minutes.`);
		status.start();

		// Set up local repository and push to remote
		await setupRepo(url, slug);
		status.stop();

		info('');
		success(`Github repository created at https://github.com/${ url.replace( 'git@github.com:', '') }`);
  } catch(err) {
		if (err) {
			switch (err.status) {
				case 401:
					console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
					break;
				case 422:
					console.log(chalk.red('There is already a remote repository or token with the same name'));
					break;
				default:
					console.log(chalk.red(err));
			}
			return err;
		}
  }
};

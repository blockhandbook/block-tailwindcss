/**
 * External Dependencies
 */
const CLI = require('clui');
const Configstore = require('configstore');
const { Octokit } = require('@octokit/rest');
const Spinner = CLI.Spinner;
const { createTokenAuth } = require("@octokit/auth");
const git = require('simple-git/promise')();
const { join } = require( 'path' );

/**
 * Internal Dependencies
 */
const gitPrompts = require('./git-prompts');
const { code, info, success } = require( './log' );
const pkg = require('../package.json');
const conf = new Configstore(pkg.name);

let octokit;

const getInstance = () => {
	return octokit;
};

const getStoredGithubToken = () => {
	// uncomment this to test authentication
	// conf.delete('github.token');
	return conf.get('github.token');
};

const getPersonalAccessToken = async () => {
	const credentials = await gitPrompts.askGithubCredentials();
	const status = new Spinner('Authenticating you, please wait...');

	status.start();

	// createTokenAuth
	const auth = createTokenAuth( credentials.token );
	// needed to update to createTokenAuth as createBasicAuth has been deprecated
	// const auth = createBasicAuth({
	//   username: credentials.username,
	//   password: credentials.password,
	//   async on2Fa() {
	//     status.stop();
	//     const res = await inquirer.getTwoFactorAuthenticationCode();
	//     status.start();
	//     return res.twoFactorAuthenticationCode;
	//   },
	//   token: {
	//     scopes: ['user', 'public_repo', 'repo', 'repo:status'],
	//     note: 'Blockhandbook - quickly build WordPress plugins for the block editor.'
	//   }
	// });

	try {
		const response = await auth();

		if(response.token) {
			conf.set('github.token', response.token);
			return response.token;
		} else {
			throw new Error("GitHub token was not found in the response");
		}
	} finally {
		status.stop();
	}
};

module.exports = {

	getGithubToken: async () => {
		// Fetch token from config store
		let token = getStoredGithubToken();
		if(token) {
			// Ask user if they want to use existing token or add a new one
			// This is a little janky, but works until I find a better solution
			const answers = await gitPrompts.useExistingToken();
			const { useToken } = answers;

			if( useToken ) {
				return token;
			} else {
				conf.delete('github.token');
			}
		}

		// No token found, use credentials to access GitHub account
		token = await getPersonalAccessToken();

		return token;
	},

	githubAuth: (token) => {
		octokit = new Octokit({
			auth: token
		});
	},

	createRemoteRepo: async (slug, previousAnswers ) => {
		const github = getInstance();
		const { data: orgData } = await github.orgs.listForAuthenticatedUser();
		const orgs = orgData.map( org => {
			const { login } = org;
			return login;
		} )
		const answers = await gitPrompts.askRepoDetails(slug, orgs, previousAnswers);

		const data = {
			name: answers.name,
			description: answers.description,
			owner: answers.owner,
			org: answers.owner,
			private: (answers.visibility === 'private')
		};

		info( '' );
		code( 'Creating remote repo on github.' );
		const status = new Spinner(`This might take a few minutes.`);
		status.start();

		try {
			let response = '';
			if( answers.owner === 'Personal' ) {
				response = await github.repos.createForAuthenticatedUser(data);
			} else {
				response = await github.repos.createInOrg(data);
			}
			return response.data.ssh_url;
		} finally {
			status.stop();
		}
	},

	setupRepo: async (url, slug) => {
		await git.cwd( join( process.cwd(), slug ) );
		await git.init();
		await git.add( `./*` );
		await git.commit('Initial commit');
		await git.addRemote('origin', url);
		await git.push('origin', 'master');
	},
};

const inquirer = require('inquirer');

module.exports = {

  askGithubCredentials: () => {
    const questions = [
			{
        name: 'token',
				type: 'input',
				default: 'Login to github to generate your token.  Go to Settings > Developer Settings > Personal access tokens > Generate new token > Select Scopes > Check all for "repo".',
				message: 'Enter your github token:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your token.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  getTwoFactorAuthenticationCode: () => {
    return inquirer.prompt({
      name: 'twoFactorAuthenticationCode',
      type: 'input',
      message: 'Enter your two-factor authentication code:',
      validate: function(value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your two-factor authentication code.';
        }
      }
    });
  },

  askRepoDetails: (slug, orgs, previousAnswers ) => {
    const argv = require('minimist')(process.argv.slice(2));

    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for the repository:',
        default: argv._[0] || slug,
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter a name for the repository.';
          }
        }
      },
      {
        type: 'input',
        name: 'description',
        default: previousAnswers.description,
        message: 'Optionally enter a description of the repository:'
			},
			{
        type: 'list',
        name: 'owner',
        message: 'Personal or Organization:',
        choices: [ 'personal', ...orgs ],
        default: 'personal'
      },
      {
        type: 'list',
        name: 'visibility',
        message: 'Public or Private:',
        choices: [ 'public', 'private' ],
        default: 'public'
      }
    ];
    return inquirer.prompt(questions);
	},

	useExistingToken: () => {
		const questions = [
			{
				type: 'confirm',
				name: 'useToken',
				message: 'Use existing github access token?',
			},
		];
		return inquirer.prompt(questions);
	},

};

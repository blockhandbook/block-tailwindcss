/* eslint-disable no-console */
/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const chalkAnimation = require( 'chalk-animation' );

const animate = ( input ) => {
	const rainbow = chalkAnimation.rainbow( input );
	setTimeout( ( input ) => {
		if( !! input ) {
			console.log( rainbow.start() ); // Animation resumes
		} 
	}, 2000);
};

const code = ( input ) => {
	console.log( chalk.cyan( input ) );
};

const error = ( input ) => {
	console.log( chalk.bold.red( input ) );
};

const info = ( input ) => {
	console.log( input );
};
const success = ( input ) => {
	console.log( chalk.bold.green( input ) );
};

module.exports = {
	animate,
	code,
	error,
	info,
	success,
};
/* eslint-enable no-console */
const Promise = require( 'bluebird' );
const mongoose = require( 'mongoose' );
mongoose.Promise = Promise;

const DATABASE_URL = process.env.MONGODB_URI || 'mongodb://localhost/tribal';

mongoose.connect( DATABASE_URL )
  .then( () => {
    console.log( `Connected to database at ${DATABASE_URL}.` );
  })
  .catch( (err) => {
    console.log( err );
  });

module.exports = mongoose;
module.exports.DATABASE_URL = DATABASE_URL;

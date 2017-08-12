
const crypto 		= require( 'crypto' );
const MongoDB 	= require( 'mongodb' ).Db;
const Server 		= require( 'mongodb' ).Server;
const moment 		= require( 'moment' );

/*
	ESTABLISH DATABASE CONNECTION
*/

const dbName = process.env.DB_NAME || 'node-login';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 27017;

const db = new MongoDB( dbName, new Server( dbHost, dbPort, { auto_reconnect: true } ), { w: 1 } );

db.open( ( e, d )=>{

  if ( e ){

    console.log( e );
  
  } else if ( process.env.NODE_ENV == 'live' ){

    db.authenticate( process.env.DB_USER, process.env.DB_PASS, ( e, res )=>{

      if ( e ){

        console.log( 'mongo :: error: not authenticated', e );
      
      }				else {

        console.log( `mongo :: authenticated and connected to database :: "${  dbName  }"` );
      
      }

    } );
  
  }	else{

    console.log( `mongo :: connected to database :: "${  dbName  }"` );
  
  }

} );

const accounts = db.collection( 'accounts' );

/* login validation methods */

exports.autoLogin = function( user, pass, callback ){

  accounts.findOne( { user }, ( e, o )=>{

    if ( o ){

      o.pass == pass ? callback( o ) : callback( null );
    
    }	else{

      callback( null );

    }

  } );

};

exports.manualLogin = function( user, pass, callback ){

  accounts.findOne( { user }, ( e, o )=>{

    if ( o == null ){

      callback( 'user-not-found' );

    }	else{

      validatePassword( pass, o.pass, ( err, res )=>{

        if ( res ){

          callback( null, o );

        }	else{

          callback( 'invalid-password' );

        }

      } );
    
    }
  
  } );

};

/* record insertion, update & deletion methods */

exports.addNewAccount = function( newData, callback ){

  accounts.findOne( { user: newData.user }, ( e, o )=>{

    if ( o ){

      callback( 'username-taken' );
    
    }	else{

      accounts.findOne( { email: newData.email }, ( e, o )=>{

        if ( o ){

          callback( 'email-taken' );
        
        }	else{

          saltAndHash( newData.pass, ( hash )=>{

            newData.pass = hash;
					// append date stamp when record was created //
            newData.date = moment().format( 'MMMM Do YYYY, h:mm:ss a' );
            accounts.insert( newData, { safe: true }, callback );

          } );

        }
      
      } );

    }

  } );

};

exports.updateAccount = function( newData, callback ){

  accounts.findOne( { _id: getObjectId( newData.id ) }, ( e, o )=>{

    o.name 		= newData.name;
    o.email 	= newData.email;
    o.country 	= newData.country;
    if ( newData.pass == '' ){

      accounts.save( o, { safe: true }, ( e )=>{

        if ( e ) callback( e );
        else callback( null, o );
      
      } );
    
    }	else{

      saltAndHash( newData.pass, ( hash )=>{

        o.pass = hash;
        accounts.save( o, { safe: true }, ( e )=>{

          if ( e ) callback( e );
          else callback( null, o );
        
        } );

      } );

    }
  
  } );

};

exports.updatePassword = function( email, newPass, callback ){

  accounts.findOne( { email }, ( e, o )=>{

    if ( e ){

      callback( e, null );

    }	else{

      saltAndHash( newPass, ( hash )=>{

		        o.pass = hash;
		        accounts.save( o, { safe: true }, callback );

      } );

    }

  } );

};

/* account lookup methods */

exports.deleteAccount = function( id, callback ){

  accounts.remove( { _id: getObjectId( id ) }, callback );

};

exports.getAccountByEmail = function( email, callback ){

  accounts.findOne( { email }, ( e, o )=>{

    callback( o ); 
  
  } );

};

exports.validateResetLink = function( email, passHash, callback ){

  accounts.find( { $and: [{ email, pass: passHash }] }, ( e, o )=>{

    callback( o ? 'ok' : null );

  } );

};

exports.getAllRecords = function( callback ){

  accounts.find().toArray(
		( e, res )=>{

  if ( e ) callback( e );
  else callback( null, res );

} );

};

exports.delAllRecords = function( callback ){

  accounts.remove( {}, callback ); // reset accounts collection for testing //

};

/* private encryption & validation methods */

const generateSalt = function(){

  const set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
  let salt = '';

  for ( let i = 0; i < 10; i++ ){

    const p = Math.floor( Math.random() * set.length );

    salt += set[p];

  }
  return salt;

};

const md5 = function( str ){

  return crypto.createHash( 'md5' ).update( str ).digest( 'hex' );

};

var saltAndHash = function( pass, callback ){

  const salt = generateSalt();

  callback( salt + md5( pass + salt ) );

};

var validatePassword = function( plainPass, hashedPass, callback ){

  const salt = hashedPass.substr( 0, 10 );
  const validHash = salt + md5( plainPass + salt );

  callback( null, hashedPass === validHash );

};

var getObjectId = function( id ){

  return new require( 'mongodb' ).ObjectID( id );

};

const findById = function( id, callback ){

  accounts.findOne( { _id: getObjectId( id ) },
		( e, res )=>{

  if ( e ) callback( e );
  else callback( null, res );

} );

};

const findByMultipleFields = function( a, callback ){

// this takes an array of name/val pairs to search against {fieldName : 'value'} //
  accounts.find( { $or: a } ).toArray(
		( e, results )=>{

  if ( e ) callback( e );
  else callback( null, results );

} );

};

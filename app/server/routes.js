
const CT = require( './modules/country-list' );
const AM = require( './modules/account-manager' );
const EM = require( './modules/email-dispatcher' );

module.exports = function( app ){

// main login page //
  app.get( '/', ( req, res )=>{

	// check if the user's credentials are saved in a cookie //
    if ( req.cookies.user == undefined || req.cookies.pass == undefined ){

      res.render( 'login', { title: 'Hello - Please Login To Your Account' } );
    
    }	else{

	// attempt automatic login //
      AM.autoLogin( req.cookies.user, req.cookies.pass, ( o )=>{

        if ( o != null ){

				    req.session.user = o;
          res.redirect( '/home' );

        }	else{

          res.render( 'login', { title: 'Hello - Please Login To Your Account' } );
        
        }
      
      } );

    }

  } );
	
  app.post( '/', ( req, res )=>{

    AM.manualLogin( req.body['user'], req.body['pass'], ( e, o )=>{

      if ( !o ){

        res.status( 400 ).send( e );

      }	else{

        req.session.user = o;
        if ( req.body['remember-me'] == 'true' ){

          res.cookie( 'user', o.user, { maxAge: 900000 } );
          res.cookie( 'pass', o.pass, { maxAge: 900000 } );
        
        }
        res.status( 200 ).send( o );
      
      }
    
    } );
  
  } );
	
// logged-in user homepage //
	
  app.get( '/home', ( req, res )=>{

    if ( req.session.user == null ){

	// if user is not logged-in redirect back to login page //
      res.redirect( '/' );
    
    }	else{

      res.render( 'home', {
        title:     'Control Panel',
        countries: CT,
        udata:     req.session.user
      } );

    }
  
  } );
	
  app.post( '/home', ( req, res )=>{

    if ( req.session.user == null ){

      res.redirect( '/' );
    
    }	else{

      AM.updateAccount( {
        id:      req.session.user._id,
        name:    req.body['name'],
        email:   req.body['email'],
        pass:    req.body['pass'],
        country: req.body['country']
      }, ( e, o )=>{

        if ( e ){

          res.status( 400 ).send( 'error-updating-account' );
        
        }	else{

          req.session.user = o;
			// update the user's login cookies if they exists //
          if ( req.cookies.user != undefined && req.cookies.pass != undefined ){

            res.cookie( 'user', o.user, { maxAge: 900000 } );
            res.cookie( 'pass', o.pass, { maxAge: 900000 } );	
          
          }
          res.status( 200 ).send( 'ok' );

        }
      
      } );
    
    }

  } );

  app.post( '/logout', ( req, res )=>{

    res.clearCookie( 'user' );
    res.clearCookie( 'pass' );
    req.session.destroy( ( e )=>{

      res.status( 200 ).send( 'ok' ); 

    } );

  } );
	
// creating new accounts //
	
  app.get( '/signup', ( req, res )=>{

    res.render( 'signup', {  title: 'Signup', countries: CT } );

  } );
	
  app.post( '/signup', ( req, res )=>{

    AM.addNewAccount( {
      name:    req.body['name'],
      email:   req.body['email'],
      user:    req.body['user'],
      pass:    req.body['pass'],
      country: req.body['country']
    }, ( e )=>{

      if ( e ){

        res.status( 400 ).send( e );

      }	else{

        res.status( 200 ).send( 'ok' );

      }

    } );
  
  } );

// password reset //

  app.post( '/lost-password', ( req, res )=>{

	// look up the user's account via their email //
    AM.getAccountByEmail( req.body['email'], ( o )=>{

      if ( o ){

        EM.dispatchResetPasswordLink( o, ( e, m )=>{

				// this callback takes a moment to return //
				// TODO add an ajax loader to give user feedback //
          if ( !e ){

            res.status( 200 ).send( 'ok' );

          }	else{

            for ( k in e ) console.log( 'ERROR : ', k, e[k] );
            res.status( 400 ).send( 'unable to dispatch password reset' );

          }

        } );
      
      }	else{

        res.status( 400 ).send( 'email-not-found' );
      
      }

    } );
  
  } );

  app.get( '/reset-password', ( req, res )=>{

    const email = req.query['e'];
    const passH = req.query['p'];

    AM.validateResetLink( email, passH, ( e )=>{

      if ( e != 'ok' ){

        res.redirect( '/' );
  
      } else{

	// save the user's email in a session instead of sending to the client //
        req.session.reset = { email, passHash: passH };
        res.render( 'reset', { title: 'Reset Password' } );
  
      }

    } );

  } );
	
  app.post( '/reset-password', ( req, res )=>{

    const nPass = req.body['pass'];
	// retrieve the user's email from the session to lookup their account and reset password //
    const email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //

    req.session.destroy();
    AM.updatePassword( email, nPass, ( e, o )=>{

      if ( o ){

        res.status( 200 ).send( 'ok' );
      
      }	else{

        res.status( 400 ).send( 'unable to update password' );

      }

    } );

  } );
	
// view & delete accounts //
	
  app.get( '/print', ( req, res )=>{

    AM.getAllRecords( ( e, accounts )=>{

      res.render( 'print', { title: 'Account List', accts: accounts } );
    
    } );
  
  } );
	
  app.post( '/delete', ( req, res )=>{

    AM.deleteAccount( req.body.id, ( e, obj )=>{

      if ( !e ){

        res.clearCookie( 'user' );
        res.clearCookie( 'pass' );
        req.session.destroy( ( e )=>{

          res.status( 200 ).send( 'ok' ); 
        
        } );
      
      }	else{

        res.status( 400 ).send( 'record not found' );

      }
	    
    } );

  } );
	
  app.get( '/reset', ( req, res )=>{

    AM.delAllRecords( ()=>{

      res.redirect( '/print' );	

    } );
  
  } );
	
  app.get( '*', ( req, res )=>{

    res.render( '404', { title: 'Page Not Found' } ); 
  
  } );

};

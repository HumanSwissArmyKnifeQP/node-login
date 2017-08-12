
function HomeController(){

// bind event listeners to button clicks //
  const that = this;

// handle user logout //
  $( '#btn-logout' ).click( ()=>{

    that.attemptLogout(); 
  
  } );

// confirm account deletion //
  $( '#account-form-btn1' ).click( ()=>{

    $( '.modal-confirm' ).modal( 'show' );

  } );

// handle account deletion //
  $( '.modal-confirm .submit' ).click( ()=>{

    that.deleteAccount(); 
  
  } );

  this.deleteAccount = function(){

    $( '.modal-confirm' ).modal( 'hide' );
    const that = this;

    $.ajax( {
      url:  '/delete',
      type: 'POST',
      data: { id: $( '#userId' ).val() },
      success( data ){

	 			that.showLockedAlert( 'Your account has been deleted.<br>Redirecting you back to the homepage.' );

      },
      error( jqXHR ){

        console.log( `${ jqXHR.responseText  } :: ${  jqXHR.statusText }` );
      
      }
    } );
  
  };

  this.attemptLogout = function(){

    const that = this;

    $.ajax( {
      url:  '/logout',
      type: 'POST',
      data: { logout: true },
      success( data ){

	 			that.showLockedAlert( 'You are now logged out.<br>Redirecting you back to the homepage.' );

      },
      error( jqXHR ){

        console.log( `${ jqXHR.responseText  } :: ${  jqXHR.statusText }` );

      }
    } );
  
  };

  this.showLockedAlert = function( msg ){

    $( '.modal-alert' ).modal( { show: false, keyboard: false, backdrop: 'static' } );
    $( '.modal-alert .modal-header h4' ).text( 'Success!' );
    $( '.modal-alert .modal-body p' ).html( msg );
    $( '.modal-alert' ).modal( 'show' );
    $( '.modal-alert button' ).click( ()=>{

      window.location.href = '/';
    
    } );
    setTimeout( ()=>{

      window.location.href = '/';
    
    }, 3000 );
  
  };

}

HomeController.prototype.onUpdateSuccess = function(){

  $( '.modal-alert' ).modal( { show: false, keyboard: true, backdrop: true } );
  $( '.modal-alert .modal-header h4' ).text( 'Success!' );
  $( '.modal-alert .modal-body p' ).html( 'Your account has been updated.' );
  $( '.modal-alert' ).modal( 'show' );
  $( '.modal-alert button' ).off( 'click' );

};

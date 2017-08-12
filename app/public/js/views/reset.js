
$( document ).ready( ()=>{
	
  const rv = new ResetValidator();
	
  $( '#set-password-form' ).ajaxForm( {
    beforeSubmit( formData, jqForm, options ){

      rv.hideAlert();
      if ( rv.validatePassword( $( '#pass-tf' ).val() ) == false ){

        return false;
      
      } 	else{

        return true;

      }

    },
    success( responseText, status, xhr, $form ){

      rv.showSuccess( 'Your password has been reset.' );
      setTimeout( ()=>{

        window.location.href = '/'; 

      }, 3000 );
    
    },
    error(){

      rv.showAlert( 'I\'m sorry something went wrong, please try again.' );

    }
  } );

  $( '#set-password' ).modal( 'show' );
  $( '#set-password' ).on( 'shown', ()=>{

    $( '#pass-tf' ).focus(); 

  } );

} );

// Code taken from: http://markdawson.tumblr.com/post/18359176420/asynchronous-file-uploading-using-express-and-node-js
  
$(document).ready(function() { 
    status('Choose a file :)');
 
    // Check to see when a user has selected a file                                                                                                                

	var inputId = 'userPhotoInput';
	var formId = 'uploadForm';
	
	// Reset the file upload field, and wait to send a new file to the server.
	function acceptUpload(){
		var timerId;
		$('#' + inputId).val('');
		timerId = setInterval(function() {
			if($('#' + inputId).val() !== '') {
					clearInterval(timerId);
		 
					$('#' + formId).submit();
			}
		}, 500);
	}
 
	// Callback function for when a form is submitted.
    $('#'+formId).submit(function() {
        status('uploading the file ...');

		//The function used to submit forms to the Node server.
		//Find more information on: http://malsup.com/jquery/form/		
		$(this).ajaxSubmit({
			error: function(xhr) {
				status('Error: ' + xhr.status);
			},		 
			success: function(response) {
				if(response.error) {
					status('Opps, something bad happened');
					return;
				}
				var imageUrlOnServer = response.path;				
				status('Success, file uploaded to:' + imageUrlOnServer);

				// Clear the loaded file, and get ready to accept a new one.
				acceptUpload();
			}
		}); 
		
		// Have to stop the form from submitting and causing                                                                                                       
		// a page refresh - don't forget this                                                                                                                      
		return false;
    });
 
    function status(message) {
		$('#status').text(message);
    }
	
	// Make the button ready to accept submissions.
	acceptUpload();
});
// 15-237 DEMO: File Upload
// Author: Anand Pattabiraman

// CHANGE THIS TO YOUR OWN PROJECT FILE PATH!
var projectFilePath = '/Users/Mochi/15-237/DemoFileUpload/';

var serverStartMessage = "Node server started.....";
var imageSavedMessage = "Image saved...";


var express = require("express"); // imports express
var app = express();        // create a new instance of express

// imports the fs module (reading and writing to a text file)
var fs = require("fs");

// the bodyParser middleware allows us to parse the
// body of a request
app.use(express.bodyParser());

// The global datastore for this example
var listings;

// Asynchronously read file contents, then call callbackFn
function readFile(filename, defaultData, callbackFn) {
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.log("Error reading file: ", filename);
      data = defaultData;
    } else {
      console.log("Success reading file: ", filename);
    }
    if (callbackFn) callbackFn(err, data);
  });
}

// Asynchronously write file contents, then call callbackFn
function writeFile(filename, data, callbackFn) {
  fs.writeFile(filename, data, function(err) {
    if (err) {
      console.log("Error writing file: ", filename);
    } else {
      console.log("Success writing file: ", filename);
    }
    if (callbackFn) callbackFn(err);
  });
}

// This is for serving files in the static directory
app.get("/static/:staticFilename", function (request, response) {
    response.sendfile("static/" + request.params.staticFilename);
});

function initServer() {
	console.log(serverStartMessage);
}

// Here is the route for uploading a file!
// There is a default temporary location where files are saved on the server.
// We simply move the file from wherever it is stored to our own storage method.
app.post('/upload', function(request, response) {

	// req.files has the files which were uploaded by the form.	
	var name = request.files.userPhoto.name;
	
	// Where the file will be saved and under what name
    var serverPath = 'images/' + name;
 
	// Move the file from temporary storage to our own storage solution.
	// Temporary storage path: request.files.userPhoto.path
    fs.rename(request.files.userPhoto.path, 
		projectFilePath + serverPath,
		function(error) {
				if(error) {
					response.send({
						error: 'Ah crap! Something bad happened'
					});
					return;
				}
	 
				console.log(imageSavedMessage + name);
	 
				response.send({
					path: serverPath
				});
		}
    );
});

// Finally, initialize the server, then activate the server at port 8889
initServer();
app.listen(8889);

//Access using url: 		http://localhost:8889/static/index.html

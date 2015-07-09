//helper for including js files
global.base_dir = __dirname;
global.abs_path = function(path) {
    return base_dir + path;
};
global.include = function(file) {
    return require(abs_path('/' + file));
};

//get the core cfenv application environment
var cfenv = null;
try { 
  cfenv = require('cfenv');
}
catch(err) {
}
var port = 3000;
var host = "http://localhost"+ ":" + port;
if (cfenv) {
  var appEnv = cfenv.getAppEnv();
  port = appEnv.port;
  host = appEnv.url;
}

var express = require('express');
var app = express();
app.set('view engine', 'jade');

var credentials = {};

if (process.env.hasOwnProperty("VCAP_SERVICES")) {
    // Running on Bluemix. Parse out the port and host that we've been assigned.
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var host = process.env.VCAP_APP_HOST; 
    var port = process.env.VCAP_APP_PORT;
   
    credentials = env['cloudantNoSQLDB'][0].credentials;  
}
else {
    
    //for local node.js server instance
    credentials.username = "74156ff4-aa0c-477f-8260-65fbd9e606a0-bluemix";
    credentials.password = "b00898bdb9018c8814ae717261af47fbbea2fba31989cbc76be7ad3f21820044";
    credentials.url = "https://74156ff4-aa0c-477f-8260-65fbd9e606a0-bluemix:b00898bdb9018c8814ae717261af47fbbea2fba31989cbc76be7ad3f21820044@74156ff4-aa0c-477f-8260-65fbd9e606a0-bluemix.cloudant.com";
    credentials.port = 443;
}

var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI('7534dcdfb599a42690823504ae475f30c25c67d1');

//var database = 'hackathon';
//var cloudant = require('cloudant')(credentials.url);
//cloudant.db.create('hackathon', function(err,res) {
//	if (err) { 
//		console.log("could not crate db");
//	}
//});
//var hackdb = cloudant.use("hackathon");

var pics = include("/db/pics.js");
var blogDB = new pics.Blog(credentials.url, credentials.port);
var res = blogDB.findAll(function(err, result) {
  console.log(result);
});

var prepareData = function(res, template) {
    
	var results = [];
	
	blogDB.findAll(function(err, result) {
		  console.log(result);
		  
          console.log('Found %d documents with type com.geopix.entry', result.length);

          for (var x=0; x<result.length; x++) {
              var obj = result[x];

              for (var key in obj._attachments) {
                  obj.image = credentials.url + "/" + "hackathon" + "/" + obj._id +"/" + key;    
                  console.log(obj.image);
                  break;
              }

              results.push( obj ); 
          }
          res.render(template, { results:results});
	});

};

app.get('/', function(req, res){
    prepareData(res, 'list');
});


app.get('/list', function(req, res){
    prepareData(res, 'list');
});

app.get('/analyze', function(req, res){
    console.log(req.query.pic);
    var data = req.query.pic;
    alchemy.imageKeywords(data, {}, function(err, response) {
    	
    	  if (err) 
    		  throw err;

    	  // See http://www.alchemyapi.com/api/image-tagging/urls.html for format of returned object
    	  var imageKeywords = response.imageKeywords;
    	  console.log(imageKeywords);
    	  
    	  res.send(imageKeywords);
    });
});

// create a public static content service
app.use("/public", express.static(__dirname + '/public'));


var port = (process.env.VCAP_APP_PORT || 3000);
app.listen(port);
console.log("mobile backend app is listening at " + port);
var express = require('express');
var passport = require('passport');

var ImfBackendStrategy = require('passport-imf-token-validation').ImfBackendStrategy;
var imf = require('imf-oauth-user-sdk');

try {
    passport.use(new ImfBackendStrategy());
} catch ( e ) {
    console.log(e);
}

var app = express();
app.use(passport.initialize());

app.set('view engine', 'jade');

var host = "localhost";
var port = 3030;
var cloudant = {
		 		 url : "https://917a0cf2-d75a-4937-8e63-f8933f6457a1-bluemix:417d47a69f58051c73b69f167c688e850ce71ac33fc2298195275b22fd142305@917a0cf2-d75a-4937-8e63-f8933f6457a1-bluemix.cloudant.com" // TODO: Update		 		 
};
var database = "geopix"

if (process.env.hasOwnProperty("VCAP_SERVICES")) {
  // Running on Bluemix. Parse out the port and host that we've been assigned.
  var env = JSON.parse(process.env.VCAP_SERVICES);
  var host = process.env.VCAP_APP_HOST; 
  var port = process.env.VCAP_APP_PORT;

  console.log('VCAP_SERVICES: %s', process.env.VCAP_SERVICES);    

  // Also parse out Cloudant settings.
  cloudant = env['cloudantNoSQLDB'][0].credentials;  
}

console.log(cloudant.url);

var nano   = require('nano')(cloudant.url)
  , db     = nano.use(database);


//redirect to mobile backend application doc page when accessing the root context
app.get('/', function(req, res){
    
    
    var results = [];

    db.list({include_docs: true, descending: true}, function(error,body,headers) {
      //console.log(body);
        
        for (var x=0; x<body.rows.length; x++) {
            //console.log( body.rows[x].doc ); 
            var obj = body.rows[x].doc;
            
            for (var key in obj._attachments) {
                
                //console.log(obj._id +"/" + key);
                obj.image = "https://917a0cf2-d75a-4937-8e63-f8933f6457a1-bluemix.cloudant.com/" + database + "/" + obj._id +"/" + key;    
                break;
            }
            
            results.push( obj ); 
        }
        
        
        //console.log(results);
        res.render('index', { results:results});
        //res.send( JSON.stringify(results) );
    });
});

// create a public static content service
app.use("/public", express.static(__dirname + '/public'));

// create another static content service, and protect it with imf-backend-strategy
app.use("/protected", passport.authenticate('imf-backend-strategy', {session: false }));
app.use("/protected", express.static(__dirname + '/protected'));

// create a backend service endpoint
app.get('/publicServices/generateToken', function(req, res){
		// use imf-oauth-user-sdk to get the authorization header, which can be used to access the protected resource/endpoint by imf-backend-strategy
		imf.getAuthorizationHeader().then(function(token) {
			res.send(200, token);
		}, function(err) {
			console.log(err);
		});
	}
);

//create another backend service endpoint, and protect it with imf-backend-strategy
app.get('/protectedServices/test', passport.authenticate('imf-backend-strategy', {session: false }),
		function(req, res){
			res.send(200, "Successfully access to protected backend endpoint.");
		}
);

var port = (process.env.VCAP_APP_PORT || 3000);
app.listen(port);
console.log("mobile backend app is listening at " + port);
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
var credentials = {};

var database = "geopix"

if (process.env.hasOwnProperty("VCAP_SERVICES")) {
    // Running on Bluemix. Parse out the port and host that we've been assigned.
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var host = process.env.VCAP_APP_HOST; 
    var port = process.env.VCAP_APP_PORT;
   
    credentials = env['cloudantNoSQLDB'][0].credentials;  
}
else {
    
    //for local node.js server instance
    credentials.username = "put your cloudant username here"
    credentials.password = "put your cloudant password here";
}

var Cloudant = require('cloudant')

var me = '917a0cf2-d75a-4937-8e63-f8933f6457a1-bluemix' 
var geopix;

Cloudant({account:credentials.username, password:credentials.password}, function(err, cloudant) {
    console.log('Connected to Cloudant')
    geopix = cloudant.use(database);
})


app.get('/', function(req, res){
    
    var results = [];
    
    var selector = {sort:{"$gt":0}};
    geopix.find({selector:selector, sort:["sort"]}, function(er, result) {
        if (er) {
            throw er;
        }

        console.log('Found %d documents with type com.geopix.entry', result.docs.length)
        
        for (var x=0; x<result.docs.length; x++) {
            var obj = result.docs[x];
            
            for (var key in obj._attachments) {
                obj.image = "https://917a0cf2-d75a-4937-8e63-f8933f6457a1-bluemix.cloudant.com/" + database + "/" + obj._id +"/" + key;    
                break;
            }
            
            results.push( obj ); 
        }
        res.render('index', { results:results});
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
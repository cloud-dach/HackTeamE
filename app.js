var express = require('express');
var passport = require('passport');
var ImfBackendStrategy = require('passport-imf-token-validation').ImfBackendStrategy;
var imf = require('imf-oauth-user-sdk');

passport.use(new ImfBackendStrategy());

var app = express();
app.use(passport.initialize());

//redirect to mobile backend application doc page when accessing the root context
app.get('/', function(req, res){
	res.sendfile('public/index.html');
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
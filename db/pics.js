var cradle = require('cradle');
var async = require("async");

Blog = function(host, port) {
  this.connection = new (cradle.Connection)(host, port, {
    cache: true,
    raw: false
  });
  console.log(host);
  console.log(port);
  this.db = this.connection.database('hackathon');
  this.create();
};

Blog.prototype.create = function() {
  var self = this;
  console.log("init db");
  self.db.exists( function (err, exists) {
    if (err) console.log('something awful happened with the database.', err);
    else {
      console.log("marker 1");
      if (!exists){
	      // self.db.create(function(err) {
    	  console.log("create index");
	      self.db.save('_design/blog', {
	          views: {
	            all: {
	              map: 'function (doc) {emit(doc.id, doc);}'
	            }
	          }
	      }, function(error, result) {
	          if( error ) 
	        	console.log("bla bla");
	            console.log(error);
	          }
	      );
	    //});
      }
    }
  });
};

Blog.prototype.findAll = function(callback) {
    this.db.view('blog/all',function(error, result) {
      if( error ){
        callback(error);
      }else{
        var docs = [];
        result.forEach(function (row){
          docs.push(row);
        });
        callback(null, docs);
      }
    });
};


exports.Blog = Blog;

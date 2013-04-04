/*
	To work on openshift, edit /node_modules/share/node_modules/redis/index.js, so the
	default ip address will read from the openshift environment variable, or fall
	back to localhost if it isn't present.
	
	default_host = process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1';
	
	See http://jmesnil.net/weblog/2012/05/02/nodejs-redis-on-openshift/ for details
	on install redis in openshift. The default redis.conf (as created by the procedure listed on 
	that blog) will set the port to 0. This	needs to be changed to 35500 (see
	https://www.openshift.com/kb/kb-e1038-i-cant-bind-to-a-port for details on port choices).
*/
var ShareJS, ShareJSOpts, connect, port, server;

connect = require('connect');

ShareJS = require('share').server;

ShareJSOpts = {
  browserChannel: {
    cors: "*"
  },
  db: "none"
};

server = connect.createServer();

server.use(connect['static'](__dirname + "/static"));

ShareJS.attach(server, ShareJSOpts);

port = process.env.OPENSHIFT_INTERNAL_PORT || 5000;
ip = process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1';

server.listen(port, ip, function() {
  return console.log("Listening on " + port);
});

var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);

app.use(express.logger());
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

app.get('/', function(request, response) {
	response.render('home.jade');
});

server.listen(8080);
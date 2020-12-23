var express = require("express");
var http = require("http");;
var websocket = require("ws");
var url = require("url");
var path = require("path");
const { throws, AssertionError } = require("assert");

var app = express();
let port = process.env.PORT || 8080;
var server = http.createServer(app).listen(port);
const MAX_GAMES = 2;
var colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff'];

var players = [];

var ids = 0;
var games = [];
games.size = 0;
/*
Game object needs:

array of players
identifying code
identifier for host
*/

function Game() {
	this.host = undefined;
	this.id = undefined;
	this.players = {};
	this.size = 0;
	this.waiting_for_players = true;
	this.closed = false;

	this.generate = function(host, id){
		this.host=host;
		this.id=id;
		size++;
		this.players.push(host);
	}

	this.addPlayer = function(player){
		if(size==8) return 1;
		size++;
		this.players.push(player);
		return 0;
	}


};


function Player(id, p_websocket) {
	this.id = id;
	this.p_websocket = p_websocket;
};

app.use(express.static(__dirname + "/public"));

const wss = new websocket.Server({server});

app.get("/", function(req, res)
{

	res.sendFile(__dirname + "/public/splash.html");	
	
});

app.get("/play", function(req, res)
{
	//console.log(req.cookies.Username)
	res.sendFile(__dirname + "/public/main.html");
});

app.get("/create", function(req, res)
{
	if(games.size == MAX_GAMES){
		res.send("We are full");
		return;
	}
	var serum = true;
	var code ='';
	while(serum){
		for(var i = 0 ; i<3; i++){
			code+=String.fromCharCode(64+Math.floor((Math.random() * 20) + 1));
		}
		
		if(games[code]==undefined){
			serum=false;
		}
	}
	games[code] = 3;
	games.size++;
	console.log(games.size)
	
	res.redirect("/play/?game="+code);

});

app.get("/*", function(req, res)
{
	res.send("404, lost your way kiddo?")
});


wss.on("connection", function(ws, require)
{
	console.log("connection");

	ws.on('close', function close() {
	
	});

	ws.on("message", function incoming(message)
	{
		
	});
});



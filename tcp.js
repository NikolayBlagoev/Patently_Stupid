var express = require("express");
var http = require("http");;
var websocket = require("ws");
var url = require("url");
var path = require("path");
var cookieParser = require('cookie-parser')
const { throws, AssertionError } = require("assert");

var app = express();
app.use(cookieParser())

let port = process.env.PORT || 80;
var server = http.createServer(app).listen(port);

const MAX_GAMES = 2;
var games = [];
games.size = 0;

/*
Game object needs:

array of players
identifying code
identifier for host
*/

class Game {
	constructor(host_socket){
		this.size = 1;
		this.players = [];
		this.ids = [];

		this.waiting_for_players = true;
		this.closed = false;
	
		var id = this.generateId();
		this.host = new Player(id, host_socket);
		this.host.id = id;

		this.players[id] = (this.host);
	}

	addPlayer(p_websocket){
		if(this.size==8) throw new Error("Game is full.");
		var id = this.generateId();

		this.players[this.generateId()] = new Player(id, p_websocket);
		this.size++;

		return id;
	}

	generateId(){
		do{
			var id = '';
			for(var i = 0; i < 20; i++) {
				var r = Math.random();
				if(r <= 0.33)
					id += Math.floor(Math.random()*10);
				else if(r <= 0.66)
					id += String.fromCharCode(Math.floor((Math.random() * (91-65)) + 65))
				else
					id += String.fromCharCode(Math.floor((Math.random() * (123-97)) + 97))
			}
		}while(this.ids.includes(id));
		this.ids.push(id);

		return id;
	}

	broadcast(message){
		for(var player in this.players){
			this.players[player].ws.send(JSON.stringify(message));
		}
	}
}

class Player {
	constructor(id, ws){
		this.ws = ws;
		this.closed = false;	
		console.log(id);
		ws.send(JSON.stringify({status: "initial", id: id}));
	}

	close(){
		this.console = true;
	}

	open(){
		this.closed = false;
	}
};

app.use(express.static(__dirname + "/public"));

const wss = new websocket.Server({server});

app.get("/", function(req, res)
{
	res.sendFile(__dirname + "/public/splash.html");	
	
});

app.get("/play", function(req, res)
{
	if(games[req.query.game] == undefined) res.send("Room does not exist");
	res.sendFile(__dirname + "/public/main.html");
});

app.get("/create", function(req, res)
{
	if(games.size == MAX_GAMES){
		res.send("We are full");
		return;
	}

	var serum = true;
	var code = '';
	while(serum){
		for(var i = 0 ; i<3; i++) code += String.fromCharCode(64 + Math.floor((Math.random() * 20) + 1));
		
		if(games[code] == undefined) serum=false;
	}

	games[code] = 1;
	games.size++;

	res.redirect("/play/?game=" + code);

});

app.get("/*", function(req, res)
{
	res.send("404, lost your way kiddo?");
});


wss.on("connection", function(ws, require)
{
	var room;
	var id;

	ws.on('close', function close() {
		try{
			games[room].players[id].close();
		}catch(e){console.log(e)}
	});

	ws.on("message", function incoming(message)
	{
		try
		{
			message = JSON.parse(message);
			switch(message.status){
				case "open":
					//TODO make sure room exists
					room = message.room;
					
					if(games[room] == 1){
						games[room] = new Game(ws);
						id = games[room].host.id;
						console.log("host, " + id + ", just joined room: " + room);
					}

					else if(games[room].waiting_for_players){
						console.log("player joined room: " + room)
						try{
							if(!recon(message)) id = games[room].addPlayer(ws);
						}catch(e){/*game is full; or person already exists*/ console.log(e)}
					}else{/*game already started; TODO handle reconnecting players*/
						recon(message);
					}
					break;
				case "start":
					if(games[room].host.ws == ws){
						console.log("broadcasting start")
						games[room].broadcast({status: "start"})
						games[room].waiting_for_players = false;
					}else{console.log("rejected a person from starting")}
			}
		}catch(e){console.log(e);}
		
	});

	function recon(message){
		if(games[room].players[message.id] != undefined && !games[room].players[message.id].closed) {
			games[room].players[message.id].ws = ws;

			// edge case where host disconnected post start
			if(games[room].host.id == message.id){
				games[room].host.ws = ws;
			}

			games[room].players[message.id].open();
			id = message.id;

			console.log("reconnected.");
			return 1;
		}

		return 0;
	}
});




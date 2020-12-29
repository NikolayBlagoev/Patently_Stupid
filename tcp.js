var express = require("express");
var http = require("http");;
var websocket = require("ws");
var cookieParser = require('cookie-parser')
const { throws, AssertionError } = require("assert");

var app = express();
app.use(cookieParser())

let port = process.env.PORT || 80;
var server = http.createServer(app).listen(port);

app.use(express.static(__dirname + "/public"));

const wss = new websocket.Server({server});

const MAX_GAMES = 40;
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

	addPlayer(p_websocket, name){
		if(this.isFull()) throw new Error("Game is full.");
		
		var id = this.generateId();
		this.players[id] = new Player(id, p_websocket, name);
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
			if(!player.closed) this.players[player].ws.send(JSON.stringify(message));
		}
	}

	getNames(){
		var names = [];
		for(var player in this.players) if(!this.players[player].closed) names.push(this.players[player].name);
		return names;
	}

	isFull(){
		return this.size >= 8;
	}
}

class Player {
	constructor(id, ws, name){
		this.ws = ws;
		this.name = name;
		this.closed = false;	
		console.log(id);
		ws.send(JSON.stringify({status: "initial", id: id}));
	}

	close(){
		this.closed = true;
	}

	open(){
		this.closed = false;
	}
}

app.get("/", function(req, res)
{
	res.sendFile(__dirname + "/public/splash.html");	
	
});

app.get("/play", function(req, res)
{
	if(games[req.query.game] == undefined) res.sendFile(__dirname + "/public/404.html");
	else{
		if(games[req.query.game] != 1 && games[req.query.game].isFull()) res.send("game is full >_<");
		else{
			if(req.cookies==undefined || req.cookies.user==undefined || req.cookies.user=="" ){
				res.redirect(req.url.toString().replace("/play",""));
				return;
			}else{
				if(req.cookies.user.length>20){
					res.sendFile(__dirname + "/public/Invalid.html");
					return;
				}
				res.sendFile(__dirname + "/public/main.html");
			}
			
		} 
	}
});

app.get("/create", function(req, res)
{
	if(req.cookies==undefined||req.cookies.user==undefined||req.cookies.user==""||req.cookies.user.length>20){
		res.sendFile(__dirname + "/public/Invalid.html");
		return;
	}
	if(games.size == MAX_GAMES){
		res.send("We are full");
		return;
	}

	var serum = true;
	var code = '';
	while(serum){
		//Three character codes (around 20*20*20 possible options)
		//To avoid collisions MAX ROOM SIZE should be less than 10% of possible room codes
		for(var i = 0 ; i<3; i++) code += String.fromCharCode(64 + Math.floor((Math.random() * 20) + 1));
		if(games[code] == undefined) serum=false;
	}

	games[code] = 1;
	games.size++;

	res.redirect("/play/?game=" + code);

});

app.get("/exists", function(req, res){
	if(games[req.query.game] == undefined) res.send(false);
	else res.send(true);
	res.end;
});

app.get("/*", function(req, res)
{
	res.sendFile(__dirname + "/public/404.html");
});



class Handler {
	constructor(){
		this.functions = [];
	}

	add(func){
		this.functions[func.name] = func;
	}

	exec(name, parameters){
		this.functions[name](parameters);
	}
}

wss.on("connection", function(ws, require)
{
	var room;
	var id;

	var handler = new Handler();
	
	handler.add(function open(message){
		room = message.room;
		
		if(games[room] == undefined) ws.close;
		
		if(games[room] == 1){
			games[room] = new Game(ws);
			id = games[room].host.id;
			games[room].players[id].name = message.name;
			console.log("host, " + message.name + ", just joined room: " + room);
		}
	
		else if(games[room].waiting_for_players){
			console.log("player joined room: " + room)
			try{
				if(recon(message) == 0) 
					id = games[room].addPlayer(ws, message.name);
			}catch(e){/*game is full; or person already exists*/ console.log(e)}
		}else{/*game already started; TODO handle reconnecting players*/
			recon(message);
		 }

		games[room].broadcast({status: "names", names: games[room].getNames()})

	});
	
	handler.add(function start(){
		if(games[room].host.ws == ws){
			console.log("broadcasting start")
			games[room].broadcast({status: "start"})
			games[room].waiting_for_players = false;
		}else{console.log("rejected a person from starting")}
	
	});


	ws.on('close', function close() {
		try{
			if(games[room].host.id==id){
				//special case where host disconnects. Need to close room.
			}else{
				games[room].players[id].close();
				games[room].broadcast({status: "names", names: games[room].getNames()})
			}
		}catch(e){console.log(e)}

	});

	ws.on("message", function incoming(message)
	{
		try
		{
			message = JSON.parse(message);
			
			if(message.status == "open") handler.exec("open", message);
			else if(games[room].players[id] != undefined) handler.exec(message.status, message);
			else console.log("unauthorized");
		}catch(e){console.log(e);}
		
	});

	function recon(message){
		//uncomment the second clause to prevent hijacking while still in (unlikely as fuck)
		//at the cost of a person spamming new tabs (likely af, happened in fake artist, never again.)
		if(games[room].players[message.id] != undefined 
			/*&& games[room].players[message.id].closed*/) {
			games[room].players[message.id].ws = ws;

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



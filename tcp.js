var express = require("express");
var http = require("http");;
var websocket = require("ws");
var url = require("url");
var path = require("path");
const { throws, AssertionError } = require("assert");

var app = express();
let port = process.env.PORT || 80;
var server = http.createServer(app).listen(port);

var colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff'];

var players = [];

var ids = 0;

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
	res.sendFile(__dirname + "/public/main.html");
});

app.get("/*", function(req, res)
{
	res.send("404, lost your way kiddo?")
});

var last_move;

wss.on("connection", function(ws, require)
{
	var id = ids++;
	var color;
	var win;
	var name;

	ws.on('close', function close() {
		for(var i = 0; i < players.length; i++)
		{
			if(players[i].id == id){
				colors.push(players[i].color);
				players.splice(i, 1);
				i=1000;
			}else{
				players[i].ws.send(JSON.stringify({
					status: "left",
					color: color,
					name: name
				}));
			}
		}
	});

	ws.on("message", function incoming(message)
	{
		try
		{
			message = JSON.parse(message);
			switch(message.status){
				case "play":
					var index = Math.floor((Math.random()*colors.length));
					win = message.window;
					name = message.name;
					players.push({
						id: id,
						ws: ws,
						color: colors[index],
						name: name,
						win: win
					});

					color = colors[index];
					
					ws.send(JSON.stringify({
						status: "color",
						color: color
					}));

					for(var i = 0; i < players.length; i++){
						if(id != players[i].id){
							ws.send(JSON.stringify({
								status: "new",
								name: players[i].name,
								color: players[i].color
							}));
							players[i].ws.send(JSON.stringify({
								status: "new",
								name: name,
								color: color
							}));
						}
					}
					colors.splice(index, 1);
					break;

				case "move":
					for(var i = 0; i < players.length; i++){
						if(last_move != id){
							players[i].ws.send(JSON.stringify({
								status: "move",
								x: message.x/win.x*players[i].win.x,
								y: message.y/win.y*players[i].win.y,
								x1: message.x1/win.x*players[i].win.x,
								y1: message.y1/win.y*players[i].win.y,
								color: color
							}));
						}else if(players[i].id != id){
							players[i].ws.send(JSON.stringify({
								status: "move",
								x: message.x/win.x*players[i].win.x,
								y: message.y/win.y*players[i].win.y,
								x1: message.x1/win.x*players[i].win.x,
								y1: message.y1/win.y*players[i].win.y,
							}));
						}
					}
					break;

				case "reset":
					for(var i = 0; i < players.length; i++){
						players[i].ws.send(JSON.stringify({
							status: "reset"
						}));
					}
					break;

				case "clear":
					for(var i = 0; i < players.length; i++){
						players[i].ws.send(JSON.stringify({
							status: "clear"
						}));
					}
					break;
				
			}
		}
		catch(error)
		{
			console.log(error);			
		}

	});
});



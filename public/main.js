var host = location.origin.replace(/^http/, 'ws')
var socket = new WebSocket(host);

let spermies = [];
var spermie_count = 300;
let players = [];


function Player(id, p_websocket) {
	this.id = id;
	this.p_websocket = p_websocket;
};

function setup(){
	var canvas = createCanvas(window.innerWidth, window.innerHeight);
	canvas.parent("canvas");

	for(var i = 0; i < spermie_count; i++)
		spermies[i] = new spermie(random(width), random(height), 4, 5);

	noStroke();
}

var speed = 4;
function draw(){
	setBg("#1e264055");
	fill("#f3eac0");

	deathRate = spermie_count/200;
	
	spermies.forEach(x => {
		x.show();
		x.update();
		x.steer(350);
	});

	if(spermies.length == 0){
		//setBg("#1e2640");
	}
}

function setBg(col){
	fill(col);
	rect(0, 0, width, height);
}

class spermie{
	constructor(x, y, speed, size, index){
		this.pos = {x: x, y: y};
		this.speed = speed;
		this.size = size;
		this. index = index;
		this.exploded = false;
	}

	update(){
		if(!this.exploded){
			this.pos.x += random(-speed, speed);
			this.pos.y += random(-speed, speed);		
		
			if(Math.floor(random(200)) == 1){
				this.pos.x = random(width);
				this.pos.y = random(height);
			}
		}else{
			this.pos.x += (width/2 - this.pos.x)/-10;
			this.pos.y += (height/2 - this.pos.y)/-10;
		}


		//an-hero
		if(this.pos.x > width || this.pos.y > height || this.pos.x < 0 || this.pos.y < 0)
			spermies.splice(this.index, 1);
	}

	steer(mult){
		this.pos.x += (mouseX-this.pos.x+random(10))/mult;
		this.pos.y += (mouseY-this.pos.y+random(10))/mult;
	}

	explode(){
		this.exploded = true;
	}

	show(){
		ellipse(this.pos.x, this.pos.y, this.size, this.size);
	}
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

window.onload = function(){
	document.getElementById("code").innerHTML = new URL(window.location.href).searchParams.get("game");;
	
}

function copyCode(){
	navigator.clipboard.writeText(window.location)
}

function doNext(){
	document.getElementById("main").style.visibility = "hidden"; 
	spermies.forEach(x => {
		x.explode();
	});
}

function start(){
	socket.send(JSON.stringify({
		status: "start"
	}));
}

let id;

socket.onopen = function(){
	socket.send(JSON.stringify({
		status: "open",
		room: new URL(window.location.href).searchParams.get("game"),
		id: parseCookie("sessionId")
	}));
}

socket.onmessage = function(event){
	var stats = JSON.parse(event.data);	
	switch(stats.status){
		case "initial":
			id = stats.id;
			document.cookie = "sessionId=" + id + ";";
			break;
		case "start":
			doNext();
			break;
	}
}

function parseCookie(name){
	var all = document.cookie.split(/[\s,;=]+/);
	var i = all.indexOf(name);

	if(i >= 0)
		return all[all.indexOf(name)+1];
	
	return -1;
}

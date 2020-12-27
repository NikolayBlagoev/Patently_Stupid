var host = location.origin.replace(/^http/, 'ws')
var socket = new WebSocket(host);

let spermies = [];
var spermie_count = 300;
let players = [];

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

function Player(id, p_websocket) {
	this.id = id;
	this.p_websocket = p_websocket;
}

class state_machine{
	constructor(){
		this.functions = [];
		this.head = 0;
		this.iterator = 0;
	}

	add(func, iterations, intermediate){
		this.functions.push({function: func, iterations: iterations, intermediate: intermediate});
	}

	exec(index){
		this.functions[index]();
	}

	execHead(){
		if(this.functions[this.head].iterations == undefined)
			this.functions[this.head].function();
		else{
			if(this.iterator <= this.functions[this.head].iterations){
				this.functions[this.head].function();
				this.iterator++;
			}
			else this.doNext(this.functions[this.head].intermediate);
		}
	}

	doNext(intermediate){
		if(intermediate != undefined) intermediate();
		this.iterator = 0;
		this.head++;
	}

}

let sm = new state_machine();

var speed = 4;
sm.add(function spermGang(){
	setBg("#1e264055");
	fill("#f3eac0");

	deathRate = spermie_count/200;
	
	spermies.forEach(x => {
		x.show();
		x.update();
		x.steer(350);
	});

	if(spermies.length == 0){
		sm.doNext();
	}
});

sm.add(function transition(){
	setBg("#353b4222");
}, 15, function(){setBg("#353b42"); fill("#eedcb2")});

var prev;
var part2_size = 5;
sm.add(function part2(){
	if(mouseIsPressed){
		if(prev == undefined){
			ellipse(mouseX, mouseY, part2_size, part2_size);
		}
		else{
			for(var i = 1; i <= 3.2; i += 0.015){
				ellipse(prev.x * 1 / i + mouseX * (1 - 1 / i)
					, prev.y * 1 / i + mouseY * (1 - 1 / i)
					, part2_size, part2_size);

				ellipse(prev.x * (1 - 1 / i) + mouseX * ( 1 / i)
					, prev.y * (1 - 1 / i) + mouseY * (1 / i)
					, part2_size, part2_size);
			}
		}
		prev = {x: mouseX, y: mouseY};
	}
	else{
		prev = undefined;
	}
});

function setup(){
	var canvas = createCanvas(window.innerWidth, window.innerHeight);
	canvas.parent("canvas");

	for(var i = 0; i < spermie_count; i++)
		spermies[i] = new spermie(random(width), random(height), 4, 5);

	noStroke();
}

function draw(){
	sm.execHead();
}

function setBg(col){
	_CurrentBG = col;
	fill(col);
	rect(0, 0, width, height);
}

function setFill(col){
	fill(col);
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
		if(this.exploded && (this.pos.x > width || this.pos.y > height || this.pos.x < 0 || this.pos.y < 0))
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

let _CurrentBG = 255;
function windowResized() {
	var old = new Image();
	var canvas = document.getElementById("defaultCanvas0");
	old.src = canvas.toDataURL();
  	
	
	old.onload = function() {
		resizeCanvas(windowWidth, windowHeight);
		push();
		setBg(_CurrentBG);
        canvas.getContext('2d').drawImage(this, 0, 0);
		pop();
    };

}

window.onload = function(){
	document.getElementById("code").innerHTML = new URL(window.location.href).searchParams.get("game");;
	
}

function copyCode(){
	var link = window.location.toString();
	navigator.clipboard.writeText(link.replace("/play", ""));
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
		id: parseCookie("sessionId"),
		name: parseCookie("user")
	}));
}

socket.onmessage = function(event){
	var stats = JSON.parse(event.data);
	var handler = new Handler();

	handler.add(function initial(){
		id = stats.id;
		document.cookie = "sessionId=" + id + ";";
	});
	handler.add(function start(){
		doNext();
	});
	handler.add(function names(){
		var content = "";
		var count = 0;
		stats.names.forEach(name => {
			content += "<ol>" + (count+1)+". "+name + "</ol>";
			count++;
		});
		while(count<8){
			content += "<ol>"+ (count+1)+". "+" </ol>";
			count++;
		}
		document.getElementById("players").innerHTML = content;
	});

	handler.exec(stats.status);

}

function parseCookie(name){
	var all = document.cookie.split(/[\s,;=]+/);
	var i = all.indexOf(name);

	if(i >= 0)
		return all[all.indexOf(name)+1];
	
	return -1;
}

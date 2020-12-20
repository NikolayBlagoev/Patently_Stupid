var host = location.origin.replace(/^http/, 'ws')
var socket = new WebSocket(host);

var bar;
var rate = 0.015;

var size = 5;
function add(x, y, x1, y1){
	put(x, y, x1, y1);
	socket.send(JSON.stringify({
		status: "move",
		x: x,
		y: y,
		x1: x1,
		y1: y1
	}));
}

function put(x, y, x1, y1){
	//if(x!=x1 || y!=y1)
	for(var i = 1; i <= 3.2; i+=rate){
		ellipse(x*1/i+x1*(1-1/i), y*1/i+y1*(1-1/i), size, size);
		ellipse(x*(1-1/i)+x1*(1/i), y*(1-1/i)+y1*(1/i), size, size);
	}
}
let name;
window.addEventListener('load', (event) => {
	name = new URL(window.location.href).searchParams.get("name");
	bar = document.getElementById("homebar");	
    var main = document.body;
	
    main.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0] // reference first touch point (ie: first finger)
		add(touchobj.clientX, touchobj.clientY, touchobj.clientX, touchobj.clientY, true);
		before = {x: touchobj.clientX, y: touchobj.clientY};
        e.preventDefault()
    }, false)
 
    main.addEventListener('touchmove', function(e){
        var touchobj = e.changedTouches[0]; // reference first touch point for this event
		add(before.x, before.y, touchobj.clientX, touchobj.clientY, true);
		before = {x: touchobj.clientX, y: touchobj.clientY};
        e.preventDefault()
    }, false)

    main.addEventListener('touchend', function(e){
        e.preventDefault()
    }, false)
});

socket.onopen= function()
{
	setTimeout(function()
	{
		socket.send(JSON.stringify({
			status: "play",
			window: {x: window.innerWidth, y: window.innerHeight},
			name: name
		}));
	}, 000);

}

var color = "ff0000";
socket.onmessage = function(event)
{
	var stats = JSON.parse(event.data);	
	switch(stats.status){
		case "color":
			color = stats.color;
			bar.innerHTML += "<li style=\"color: " + color + ";\">" + name + "</li>";
			fill(color);
			break;

		case "new":
			bar.innerHTML += "<li style=\"color: " + stats.color + ";\">" + stats.name + "</li>";
			break;

		case "move":
			if(stats.color != undefined) fill(stats.color);
			put(stats.x, stats.y, stats.x1, stats.y1);
			break;

		case "left":
			bar.innerHTML = bar.innerHTML.replace("<li style=\"color: " + stats.color + ";\">" + stats.name + "</li>", "");
			break;
		case "clear":
			fill(15);
			rect(0,0, width, height);
			fill(color);
			break;
	}
};


function setup(){
	createCanvas(window.innerWidth,window.innerHeight);
	frameRate(200);
	background(15);
	noStroke();
}

var mouseDown = false;

var before;
function down(){
	mouseDown = true;
	add(mouseX, mouseY, mouseX, mouseY);
	before = {x: mouseX, y: mouseY};
}
function move(){
	if(mouseDown){
		add(before.x,before.y, mouseX, mouseY);
		before = {x: mouseX, y: mouseY};
	}
}

function up(){
	mouseDown = false;
	socket.send(JSON.stringify({
		status: "reset"
	}))
}

function clean(){
	socket.send(JSON.stringify({
		status: "clear"
	}));
}

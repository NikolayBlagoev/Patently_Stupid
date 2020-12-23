let spermies = [];
var spermie_count = 300;

function setup(){
	var canvas = createCanvas(window.innerWidth, window.innerHeight);
	canvas.parent("canvas");

	for(var i = 0; i < spermie_count; i++)
		spermies[i] = new spermie(random(width), random(height), 4, 5);

	noStroke();
}

var speed = 4;
function draw(){
	fill("#1e264055");
	rect(0, 0, width, height);
	fill("#f3eac0");

	deathRate = spermie_count/200;
	
	spermies.forEach(x => {
		x.show();
		x.update();
		x.steer(350);
	});

	for(var i = 0; i < deathRate; i++) spermies[floor(random(spermies.length))] = new spermie(random(width), random(height), 4, 5);
}

class spermie{
	constructor(x, y, speed, size){
		this.pos = {x: x, y: y};
		this.speed = speed;
		this.size = size;
	}

	update(){
		this.pos.x += random(-speed, speed);
		this.pos.y += random(-speed, speed);		
	}

	steer(mult){
		this.pos.x += (mouseX-this.pos.x+random(10))/mult;
		this.pos.y += (mouseY-this.pos.y+random(10))/mult;
	}

	show(){
		ellipse(this.pos.x, this.pos.y, this.size, this.size);
	}
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

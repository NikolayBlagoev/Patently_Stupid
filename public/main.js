let blobs = [];
var blob_count = 300;

function setup(){
	var canvas = createCanvas(window.innerWidth, window.innerHeight);
	canvas.parent("canvas");
	for(var i = 0; i < blob_count; i++){
		blobs[i] = {
			x: random(0, width),
			y: random(0, height)
		}
	}
	noStroke();
}

var speed = 4;
function draw(){
	fill("#1e264055");
	rect(0, 0, width, height);
	fill("#f3eac0");

	deathRate = blob_count/200;

	for(var i = 0; i < blobs.length; i++){
		ellipse(blobs[i].x, blobs[i].y, 5, 5);
		blobs[i].x += random(-speed, speed);
		blobs[i].y += random(-speed, speed);
		steer(blobs[i], 350);
	}

	for(var i = 0; i < deathRate; i++){
		blobs[floor(random(blobs.length))] = {
				x: random(0, width),
				y: random(0, height)
		}
	}
}

function steer(blob, mult){
	blob.x += (mouseX-blob.x+random(10))/mult;
	blob.y += (mouseY-blob.y+random(10))/mult;
}

function press(event) {
    if (event.keyCode == 13) play(); 
}

function play(){
	var name = document.getElementById("uname").value;
	var roomcode = document.getElementById("roomcode").value;

	if(roomcode == ""){
		alert("Please, enter a room code");
		return;
	} 
	
	if(name != ""){
		document.cookie = "user=" + name + ";";
		window.location.href = '../play/?game=' + roomcode;
	} 
	else alert("enter a username");
}

function create(){
	var name = document.getElementById("uname").value;
	if(name != ""){
		document.cookie = "user=" + name + ";";
		window.location.href = '../create';
	} 
	else alert("enter a username");
}

window.onload = function()
{
	document.getElementById("uname").value = "";
	document.getElementById("roomcode").value = "";

	var modal = document.getElementById("myModal");
	
	var btn = document.getElementById("myBtn");
	
	var span = document.getElementsByClassName("close")[0];
	
	btn.onclick = function() {
		modal.style.display = "block";
	}	

	span.onclick = function() { 
		modal.style.display = "none";
	}

	window.onclick = function(event) {
		if (event.target == modal) { 
			modal.style.display = "none"; 
		}
	}
}


function roomcodeChanged(){
	var roomcode = document.getElementById("roomcode");
	roomcode.value = roomcode.value.toUpperCase();

	if(roomcode.value.includes("GAME")){
		roomcode.value = roomcode.value.split("?GAME=")[1];
	}

	if(roomcode.value.length >= 3) {
		roomcode.value = roomcode.value.substr(0,3);
	} 	
}

function selectUname(){
	document.getElementById("uname").focus();
}

function selectRoomCode(){
	document.getElementById("roomcode").focus();
}

function press(event) {
    if (event.keyCode == 13) play(); 
}

function play(){
	var name = document.getElementById("uname").value;
	var roomcode = document.getElementById("roomcode").value;

	if(document.getElementById("start").state == "join"){
		if(name != ""){
			fetch(window.location.href + "exists/?game=" + roomcode)
			.then(response => response.json())
			.then(data => function(){
				if(data){
					document.cookie = "user=" + name + ";";
					window.location.href = '../play/?game=' + roomcode;
				}
				else{
					alert("room does not exist");
				}
			}());
		} 
		else alert("enter a username");
	}
	else{
		create();
	}

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
	var username = parseCookie("user"); 
	document.getElementById("uname").value = "";
	document.getElementById("roomcode").value = "";

	if(username != ""){
		document.getElementById("uname").value = username;
		document.getElementById("roomcode").focus();
	}

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

	if(roomcode.value.length > 0){
		document.getElementById("start").innerHTML = "Join Game!"
		document.getElementById("start").state = "join";
		if(roomcode.value.length >= 3) {
			roomcode.value = roomcode.value.substr(0,3);
		} 	
	}
	else{
		document.getElementById("start").innerHTML = "Create Game!"	
		document.getElementById("start").state = "create";
	}
}

function selectUname(){
	document.getElementById("uname").focus();
}

function selectRoomCode(){
	document.getElementById("roomcode").focus();
}

function parseCookie(name){
	var all = document.cookie.split(/[\s,;=]+/);
	var i = all.indexOf(name);

	if(i >= 0)
		return all[all.indexOf(name)+1];
	
	return "";
}


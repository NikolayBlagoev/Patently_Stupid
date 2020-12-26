function press(event) {
    if (event.keyCode == 13) {
		play();
    }
}

function play(){
	console.log("hekk")
	var name = document.getElementById("uname").value;
	var roomcode = document.getElementById("roomcode").value.toUpperCase();
	if(roomcode==""){
		alert("Please, enter a room code");
		return;
	} 
	if(roomcode.includes("GAME")){
		roomcode = roomcode.split("?GAME=")[1];
	
	}
	//this method doesnt work
	if(roomcode.length>3) {
		alert("Invalid room code");
		return;
	} 
	
	if(name != ""){
		var d = new Date();
  		d.setTime(d.getTime() + (4*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie;
		document.cookie = "user=" + name + ";";
		document.cookie;

		window.location.href='../play/?game='+roomcode;
	} else alert("enter a username");
}

function create(){
	var name = document.getElementById("uname").value;
	if(name != ""){
		var d = new Date();
  		d.setTime(d.getTime() + (4*24*60*60*1000));
  		var expires = "expires="+ d.toUTCString();
		document.cookie;
		document.cookie = "user=" + name + ";";
		document.cookie;
		window.location.href='../create';
	} else alert("enter a username");
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




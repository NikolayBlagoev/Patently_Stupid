function press(event) {
    if (event.keyCode == 13) {
		play();
    }
}

function play(){
	console.log("hekk")
	var name = document.getElementById("uname").value;
	var roomcode = document.getElementById("roomcode").value;
	if(roomcode==""){
		alert("Please, enter a room code");
		return;
	} 
	
	if(name != ""){
		var d = new Date();
  		d.setTime(d.getTime() + (4*24*60*60*1000));
  		var expires = "expires="+ d.toUTCString();
		document.cookie = "Username=" + name + ";" + expires + ";path=/";
		console.log(document.cookie)
		window.location.href='../play/?game='+roomcode;
	} else alert("enter a username");
}

function create(){
	var name = document.getElementById("uname").value;
	if(name != ""){
		var d = new Date();
  		d.setTime(d.getTime() + (4*24*60*60*1000));
  		var expires = "expires="+ d.toUTCString();
		document.cookie = "Username=" + name + ";" + expires + ";path=/";
		console.log(document.cookie)
		window.location.href='../create';
	} else alert("enter a username");
}



window.onload = function()
{
	document.getElementById("uname").value = "";
	document.getElementById("room").value = "";

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




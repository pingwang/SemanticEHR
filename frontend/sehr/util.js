function vizEHR() {
window.location = "http://localhost/sehr/vizEHR.html?"+curMPID;
}

function checkEHR() {
//alert("In checkEHR, curMPID: "+curMPID);
window.location = "http://localhost/sehr/checkEHR.html?"+curMPID;
}

function initViz() {
 //colorArr = ['#FF2400', '#0000CD', '#FFB90F', 'green', '#CD1076', '#104E8B'];
 colorArr = ['blue', 'green', 'red', '#FFB90F', '#CD1076', '#104E8B'];
 //
 curMPID="";
 if(curMPID=="")
	setMPID();
}

function setMPID(){
	var searchStr = window.location.search;
  // Skip the leading ?, which should always be there,
  // but be careful anyway
  if (searchStr.substring(0, 1) == '?') {
    curMPID = unescape(searchStr.substring(1));
  }
	document.getElementById('mpid').innerHTML = "MPID: "+curMPID; //"MPID: " + 
}

function hideExistingViz(vizType) {
	for (var i=0;i<4;i++){
		var curId = vizType+i;
		document.getElementById(curId).style.display = 'none';
	}
}

function append_selection_element(select, value, html){
  var element = document.createElement("option");
  element.setAttribute("value",value);
  element.innerHTML = html; 
  select.appendChild(element);
}


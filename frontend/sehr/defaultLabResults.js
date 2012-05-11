function sendDefaultLabResultQuery(inputMPID){
 var sparqlLabResult="PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
		"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#>\r\n"+
		"\r\n"+
		"SELECT DISTINCT ?labResultName\r\n"+ 
		"WHERE {\r\n"+
		" ?mp rdf:type health-role:MedicalPractitioner .\r\n"+
		" ?mp health-role:hasMPID ?mpid .\r\n"+
		//" ?mp health-role:hasMPID "1001" .\r\n"+
		"?mp health-role:hasMPID \"" + inputMPID + "\" .\r\n"+
		" ?mp health-role:hasSpecialty ?spt .\r\n"+
		" ?spt health-role:treatsProblem ?problemName .\r\n"+
		" ?problemLab health-role:hasProblemName ?problemName .\r\n"+
		" ?problemLab health-role:hasRelatedLabResultName ?labResultName .\r\n"+
		"}";

 //alert(sparqlLabResult);
       $.ajax({type: "GET",
          url: thisserviceagent,
          data: "query="+encodeURIComponent(sparqlLabResult),
          dataType: "xml", 
          success: processDefaultLabResults,
         	error: function (jqXHR, textStatus, errorThrown){
              if(jqXHR.status == 200) {
                processDefaultLabResults(jqXHR.responseXML);
              }
						alert(jqXHR.status+", "+textStatus+", "+ errorThrown);
         	}
     });
} 

function processDefaultLabResults(data) {
	//alert("In processDefaultLabResults");
	var defLabNames = new Array();

	$(data).find('result').each(function(){
	var curLabName="";
	$(this).find("binding").each(function(){
	  if($(this).attr("name")=="labResultName")
	  {
	    curLabName=($(this).find("literal").text());
			//alert(curLabName);
			if(curLabName!="")
				defLabNames.push(curLabName);
	  }
	});
	});

	genLabResultBoxes(defLabNames);
}

function genLabResultBoxes(defLabNames) {
	defLabNames.sort();
	for (var i = 0; i < defLabNames.length; i++) {
		//<INPUT TYPE="checkbox" NAME="check1" Value="Check1">Checkbox 1<BR>
		var box = "<INPUT TYPE=\"checkbox\" NAME=\"def-lab-result\" Value=\""+ defLabNames[i] + "\">"+ defLabNames[i] +"<BR>";	
 		document.getElementById('labResultCheckboxesID').innerHTML += box;
	}
 }


function sendDefaultLabResultQuery1(inputMPID){
 var sparqlproxy = "http://logd.tw.rpi.edu/ws/sparqlproxy.php";
 var queryloc = "http://www.cs.rpi.edu/~wangp5/health/sehr.sparql";    
 var service = "http://tw2.tw.rpi.edu:2025/sparql";
 var sparqlLabResult="PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
		"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#>\r\n"+
		"\r\n"+
		"SELECT DISTINCT ?labResultName\r\n"+ 
		"WHERE {\r\n"+
		" ?mp rdf:type health-role:MedicalPractitioner .\r\n"+
		" ?mp health-role:hasMPID ?mpid .\r\n"+
		//" ?mp health-role:hasMPID "1001" .\r\n"+
		"?mp health-role:hasMPID \"" + inputMPID + "\" .\r\n"+
		" ?mp health-role:hasSpecialty ?spt .\r\n"+
		" ?spt health-role:treatsProblem ?problemName .\r\n"+
		" ?problemLab health-role:hasProblemName ?problemName .\r\n"+
		" ?problemLab health-role:hasRelatedLabResultName ?labResultName .\r\n"+
		"}";

 //alert(sparqlLabResult);
 var queryurl = sparqlproxy
                + "?" + "output=gvds"
                + "&service-uri=" + encodeURIComponent(service)
		+ "&query=" + encodeURIComponent(sparqlLabResult);

 var query = new google.visualization.Query(queryurl); // Send the query.
 query.send(handleDefaultLabResultQueryResponse);
} 

function handleDefaultLabResultQueryResponse(response) {
  if (response.isError()) {
    alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
    return;
  }
  labResultData = response.getDataTable();
  genLabResultBoxes(labResultData);
}



/*
function index2IDForDrugList(curIndex) {
	return drugData.getValue(curIndex, 0);
}
*/




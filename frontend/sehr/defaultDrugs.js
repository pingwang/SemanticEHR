
google.setOnLoadCallback(drawDefaultDrugVisualization);



function drawDefaultDrugVisualization() {
	//alert("In drawDefaultDrugVisualization");
	//var curMPID="1001";
	initViz();
  sendDefaultDrugQuery(curMPID);
	//sendDefaultLabResultQuery(curMPID);
}

function sendDefaultDrugQuery(inputMPID){
 var sparqlDrug = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
		"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#>\r\n"+
		"\r\n"+
		"SELECT DISTINCT ?drugName\r\n"+ //?drugCode 
		"WHERE {\r\n"+
		" ?mp rdf:type health-role:MedicalPractitioner .\r\n"+
		//" ?mp health-role:hasMPID "1001" .\r\n"+
		"?mp health-role:hasMPID \"" + inputMPID + "\" .\r\n"+
		" ?mp health-role:hasSpecialty ?spt .\r\n"+
 		" ?spt health-role:treatsProblem ?problemName .\r\n"+
 		" ?problem health-role:hasProblemName ?problemName .\r\n"+
 		" ?problem health-role:hasApplicableDrug ?drug .\r\n"+
 		" ?drug health-role:hasRxNorm ?drugCode .\r\n"+
 		" ?drug health-role:hasName ?drugName .\r\n"+
		"}";

	//alert(sparqlDrug);
       $.ajax({type: "GET",
          url: thisserviceagent,
          data: "query="+encodeURIComponent(sparqlDrug),
          dataType: "xml", 
          success: processDefaultDrugs,
         	error: function (jqXHR, textStatus, errorThrown){
						alert(jqXHR.status+", "+textStatus+", "+ errorThrown);
         	}
     });
}

function processDefaultDrugs(data) {
	//alert("In processDefaultDrug");
	var defDrugNames = new Array();

	$(data).find('result').each(function(){
	var curDrugName="";
	$(this).find("binding").each(function(){
	  if($(this).attr("name")=="drugName")
	  {
	    curDrugName=($(this).find("literal").text());
			//alert(curDrugName);
			if(curDrugName!="")
				defDrugNames.push(curDrugName);
	  }
	});
	});

	genDrugBoxes(defDrugNames);
	sendDefaultLabResultQuery(curMPID);
	drawPatientVisualization(curMPID);
}


function genDrugBoxes(defDrugNames) {
	defDrugNames.sort();
	for (var i = 0; i < defDrugNames.length; i++) {
		//<INPUT TYPE="checkbox" NAME="check1" Value="Check1">Checkbox 1<BR>
		var box = "<INPUT TYPE=\"checkbox\" NAME=\"def-drug\" Value=\""+ defDrugNames[i] + "\">"+ defDrugNames[i] +"<BR>";	
 		document.getElementById('drugCheckboxesID').innerHTML += box;
	}
 }

//function index2IDForDrugList(curIndex) {
//	return drugData.getValue(curIndex, 0);
//}




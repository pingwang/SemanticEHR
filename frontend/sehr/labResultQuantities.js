

function drawLabResultsVisualization(){
	var selectedLabs=getSelectedLabs();
	//alert(selectedLabs.length);
	if(selectedLabs.length<1){
		alert("Please select a lab result!");
		return;
	}
	//
	hideExistingViz('viz_lab_');
  for(var i=0; i<selectedLabs.length; i++){
		sendLabResultQuantityQuery(curPtID, selectedLabs[i]);
	}
}

function getSelectedLabs(){
 var selectedLabs = new Array();
 var lab_checkbox = document["labResultForm"]["def-lab-result"];
 vizId=0;
	if (typeof lab_checkbox.length === 'undefined') {
  	/*then there is just one checkbox with no array*/
  	if (lab_checkbox.checked == true )
			selectedLabs .push(lab_checkbox.value);
	}
	else {
		for(var i=0; i<lab_checkbox.length; i++){
			if(lab_checkbox[i].checked == true){
				//alert(lab_checkbox[i].value);
				selectedLabs.push(lab_checkbox[i].value);
			}
		}
	}
 return selectedLabs;
}

function sendLabResultQuantityQuery(inputPtID, labName){ 
 var sparqlQuery="PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
	"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#> \r\n"+
	"\r\n"+
	"SELECT DISTINCT ?labName ?date ?value ?low ?high ?unit\r\n"+
	"WHERE {\r\n"+
	" ?lab rdf:type health-role:LabResult .\r\n"+
	//" ?lab health-role:hasPatientID "1520204" .\r\n"+
	" ?lab health-role:hasPatientID \""+inputPtID+"\" .\r\n"+
	" ?lab health-role:hasName ?labName .\r\n"+
	" ?lab health-role:hasName \""+labName+"\" .\r\n"+
	" ?lab health-role:hasDate ?date .\r\n"+
	" ?lab health-role:hasValue ?value .\r\n"+
	" ?lab health-role:hasLow ?low .\r\n"+
	" ?lab health-role:hasHigh ?high .\r\n"+
	" ?lab health-role:hasUnits ?unit .\r\n"+
	"}";

 //alert(sparqlQuery);
       $.ajax({type: "GET",
          url: thisserviceagent,
          data: "query="+encodeURIComponent(sparqlQuery),
          dataType: "xml", 
          success: processLabResultQuantity,
         	error: function (jqXHR, textStatus, errorThrown){
						alert(jqXHR.status+", "+textStatus+", "+ errorThrown);
         	}
     });
} 

function processLabResultQuantity(data) {
	var str = extractLabResultQuantity(data);
  //alert(str);
	if(str!=""){
		var curDiv=document.getElementById("viz_lab_"+vizId);
		g = new Dygraph(curDiv, str, 
			{colors: colorArr});//panEdgeFraction : 0.1, 
		curDiv.style.display = 'block';
  	vizId++;
  	//alert(vizId);
	}
}


function extractLabResultQuantity(data) {
	//alert("In extractLabResultQuantity");
   //var str="Date, Value, Low, High\n";
	var str="";
	var labName="";
	var once=false;
	$(data).find('result').each(function(){
	var dateStr="", value="", low="", high="", unit="";
	$(this).find("binding").each(function(){
		var row  = Array();
	  if(once==false&&$(this).attr("name")=="labName")
	  {
	    labName=($(this).find("literal").text()); 
			once=true;
	  }
	  if($(this).attr("name")=="date")
	  {
	    dateStr=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="value")
	  {
	    value=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="low")
	  {
	    low=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="high")
	  {
	    high=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="unit")
	  {
	    unit=($(this).find("literal").text()); 
	  }
		if(dateStr !=""&&value !=""&&low !=""&&high !=""&&unit !=""){
			//alert(dateStr+", "+value+", "+low+", "+high+", "+unit);
			var curDate = new Date(dateStr);
			str+= curDate.format("yyyy-mm-dd")+", "+value+", "+low+", "+high+"\n";
		}
	});
	});

	if(labName!="")
		return "Date, "+labName+", Low, High\n"+str;
	else
		return "";
	//return str;
}

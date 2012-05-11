
function checkLabResults() {
	//alert("In checkLabResults");
	var selectedLabs=getSelectedLabs();
	if(selectedLabs.length<1){
		alert("Please select a lab result!");
		return;
	}
	sendCheckLabResultsQuery(curPtID, selectedLabs);
}


function sendCheckLabResultsQuery(inputPtID, selectedLabs){
 var sparqlCheckLab="PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
		"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#>\r\n"+ 
		"\r\n"+
		"SELECT DISTINCT ?labName ?date ?value ?low ?high ?unit\r\n"+
		"WHERE {\r\n"+
		" ?lab rdf:type health-role:LabResult .\r\n"+
		//" ?lab health-role:hasPatientID "1768562" .\r\n"+
		" ?lab health-role:hasPatientID \""+inputPtID+"\" .\r\n"+
 		" ?lab health-role:hasName ?labName .\r\n"+
		" ?lab health-role:hasDate ?date .\r\n"+
		" ?lab health-role:hasValue ?value .\r\n"+
		" ?lab health-role:hasLow ?low .\r\n"+
		" ?lab health-role:hasHigh ?high .\r\n"+
		" ?lab health-role:hasUnits ?unit .\r\n"+
		buildLabResultFilter(selectedLabs)+"}";

 	//alert(sparqlCheckLab);

       $.ajax({type: "GET",
          url: thisserviceagent,
          data: "query="+encodeURIComponent(sparqlCheckLab),
          dataType: "xml", 
          success: processCheckLab,
         	error: function (jqXHR, textStatus, errorThrown){
						alert(jqXHR.status+", "+textStatus+", "+ errorThrown);
         	}
     });
} 

function buildLabResultFilter(selectedLabs) {
 //FILTER ((str(?labName) = "BNP SerPl-mCnc" || str(?labName) = "RBC # Bld Auto") && (?value < ?low || ?value > ?high))
 var labResultFilter = "FILTER ((";

	for(var i=0; i<selectedLabs.length; i++){
		if(i==0)
			labResultFilter +="str(?labName) = \""+selectedLabs[i]+"\"";
		else
			labResultFilter +=" || str(?labName) = \""+selectedLabs[i]+"\"";
	}
	labResultFilter+=") && (?value < ?low || ?value > ?high))\r\n";
	//alert(labResultFilter);	
	return labResultFilter;
}

function processCheckLab(data){
 var dataTable = extractCheckLab(data);
	var table = new google.visualization.Table(document.getElementById('abnormalLabTable'));
  table.draw(dataTable, {showRowNumber: true});
}

function extractCheckLab(data) {
	//alert("In extractCheckLab");
	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'Lab Result');
	dataTable.addColumn('string', 'Date');
	dataTable.addColumn('string', 'Value');
	dataTable.addColumn('string', 'Low');
	dataTable.addColumn('string', 'High');
	dataTable.addColumn('string', 'Unit');

	$(data).find('result').each(function(){
	var labName="", dateStr="", value="", low="", high="", unit="";
	$(this).find("binding").each(function(){
		var row  = Array();
	  if($(this).attr("name")=="labName")
	  {
	    labName=($(this).find("literal").text()); 
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
		if(labName!=""&&dateStr !=""&&value !=""&&low !=""&&high !=""&&unit !=""){
			if(parseFloat(low)!=0||parseFloat(high)!=0){
				//alert(labName+", "+dateStr+", "+value+", "+low+", "+high+", "+unit);
				var curDate = new Date(dateStr);
				row.push(labName);
				row.push(curDate.format("yyyy-mm-dd"));
				row.push(value);
				row.push(low);
				row.push(high);
				row.push(unit);
				dataTable.addRow(row);
			}
		}
	});
	});
	return dataTable;
}


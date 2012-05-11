
//google.setOnLoadCallback(drawPatientVisualization());

function drawPatientVisualization(curMPID) {
	//var curMPID="1001";
  sendPatientQuery(curMPID);
}

function sendPatientQuery(inputMPID){
 var sparqlPatient = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\n"+
		"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#> \n"+
		"\n"+
		"SELECT DISTINCT ?PatientID ?LastName ?FirstName ?DateOfBirth ?Gender\n"+
		"WHERE {\n"+
		" ?relation rdf:type health-role:MPPatientRelation .\n"+
		" ?relation health-role:hasMPID \"" + inputMPID + "\" .\n"+
		" ?relation health-role:MPHasPatientID ?PatientID .\n"+
		" ?patient rdf:type health-role:Patient .\n"+
		" ?patient health-role:hasPatientID ?PatientID .\n"+
		" ?patient health-role:hasLastName ?LastName .\n"+
		" ?patient health-role:hasFirstName ?FirstName .\n"+
		" ?patient health-role:hasgender ?Gender .\n"+
		" ?patient health-role:hasDateOfBirth ?DateOfBirth .\n"+
		"}";

 //alert(sparqlPatient);
       $.ajax({type: "GET",
          url: thisserviceagent,
          data: "query="+encodeURIComponent(sparqlPatient),
          dataType: "xml", 
          success: processPatient,
         	error: function (jqXHR, textStatus, errorThrown){
						alert(jqXHR.status+", "+textStatus+", "+ errorThrown);
         	}
     });
} 

function processPatient(data) {
	//alert("In processPatient");
	patientIDArr = new Array();
	var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'ID');
	dataTable.addColumn('string', 'Last Name');
	dataTable.addColumn('string', 'First Name');
	//dataTable.addColumn('string', 'Date Of Birth');
	dataTable.addColumn('number', 'Age');
	dataTable.addColumn('string', 'Gender');


	$(data).find('result').each(function(){
	var curId="", curLastName="", curFirstName="", curDOB="", curGender="";
	$(this).find("binding").each(function(){
		var row  = Array();
	  if($(this).attr("name")=="PatientID")
	  {
	    curId=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="LastName")
	  {
	    curLastName=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="FirstName")
	  {
	    curFirstName=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="DateOfBirth")
	  {
	    curDOB=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="Gender")
	  {
	    curGender=($(this).find("literal").text()); 
	  }
		if(curId !=""&&curLastName !=""&&curFirstName !=""&&curDOB !=""&&curGender !=""){
			//alert(curId+", "+curLastName, "+curFirstName, "+curDOB, "+curGender);
			patientIDArr.push(curId);
			row.push(curId);
			row.push(curLastName);
			row.push(curFirstName);
			//row.push(curDOB);
			row.push(getAge(curDOB));
			row.push(curGender);
			dataTable.addRow(row);
		}
	});
	});

	var table = new google.visualization.Table(document.getElementById('ptTable'));
  table.draw(dataTable, {showRowNumber: true});
	//
	genPatientList(patientIDArr);
}

function genPatientList(patientIDArr) {
	var pid_select = document.getElementById('pid_selection_canvas');

	patientIDArr.sort();
	for (var i = 0; i < patientIDArr.length; i++) {
		append_selection_element(pid_select, patientIDArr[i] , patientIDArr[i]);
	}
	if(pid_select.innerHTML!="")
		pid_select.selectedIndex = 0;
	else
		pid_select.selectedIndex = -1;
	onchange_pid_selection();
}

/*
function index2IDForPatientList(curIndex) {
	return ptData.getValue(curIndex, 0);
}*/

function getAge(dob_string){
            var dob = new Date(dob_string);
            var today = new Date();
            var db = new Date(dob_string);
            
            if (isNaN(dob)) { // IE Date constructor doesn't parse ISO-8601 -JCM
               dob_string = dob_string.split("-");
               var dob = new Date();
               dob.setFullYear(dob_string[0], dob_string[1]-1, dob_string[2]);
               var db = new Date();
               db.setFullYear(dob_string[0], dob_string[1]-1, dob_string[2]);
            }
 
            var cy = today.getFullYear();
            var by = dob.getFullYear();
            db.setFullYear(cy);
            var adj = (today-db<0) ? 1 : 0;
            return cy - by - adj;
}



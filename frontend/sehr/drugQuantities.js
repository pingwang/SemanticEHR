
function drawDrugQuantityVisualization() {
	var selectedDrugs=getSelectedDrugs();
	if(selectedDrugs.length<1){
		alert("Please select a drug!");
		return;
	}
	//var curMPID="1001";
  hideExistingViz('vis_drug_');
  sendDrugQuantityQuery(curMPID, curPtID, selectedDrugs);
}

function onchange_pid_selection() {
	var curIndex=document.getElementById('pid_selection_canvas').selectedIndex;
	curPtID=patientIDArr[curIndex];
}

function getSelectedDrugs(){
 var selectedDrugs = new Array();
 var drug_checkbox = document["drugForm"]["def-drug"];

	if (typeof drug_checkbox.length === 'undefined') {
  	/*then there is just one checkbox with no array*/
  	if (drug_checkbox.checked == true )
			selectedDrugs.push(drug_checkbox.value);
	}
	else {
		for(var i=0; i<drug_checkbox.length; i++){
			if(drug_checkbox[i].checked == true){
				selectedDrugs.push(drug_checkbox[i].value);
			}
		}
	}
 return selectedDrugs;
}

function buildDrugFilter(selectedDrugs) {
 //" FILTER (str(?drugCode) = "200033" || str(?drugCode) = "828348")\r\n"+
 //	" FILTER (str(?drugName) = "carvedilol Oral Tablet" || str(?drugCode) = "Digoxin Oral Tablet [Lanoxin]")
 var drugFilter = "FILTER (";

	for(var i=0; i<selectedDrugs.length; i++){
		if(i==0)
			drugFilter+="str(?drugName) = \""+selectedDrugs[i]+"\"";
		else
			drugFilter+=" || str(?drugName) = \""+selectedDrugs[i]+"\"";
	}
	drugFilter+=")\r\n";
	//alert(drugFilter);	
	return drugFilter;
}

function sendDrugQuantityQuery(inputMPID, inputPtID, selectedDrugs){ 
 var sparqlQuery = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
	"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#> \r\n"+
	"\r\n"+
	"SELECT DISTINCT ?drugName ?date ?unitValue ?unitName\r\n"+
	"WHERE {\r\n"+
	" ?refill rdf:type health-role:Refill .\r\n"+
	//" ?refill health-role:hasPatientID "1768562" .\r\n"+
	" ?refill health-role:hasPatientID \""+inputPtID+"\" .\r\n"+
	" ?refill health-role:hasRXN ?drugCode .\r\n"+
	" ?refill health-role:hasDate ?date .\r\n"+
	" ?drug health-role:hasRxNorm ?drugCode .\r\n"+
	" ?drug health-role:hasName ?drugName .\r\n"+
	" ?drug health-role:hasUnitValue ?unitValue .\r\n"+
	" ?drug health-role:hasUnitName ?unitName .\r\n"+
	buildDrugFilter(selectedDrugs)+"}";

 //alert(sparqlQuery);
	$.ajax({type: "GET",
          url: thisserviceagent,
          data: "query="+encodeURIComponent(sparqlQuery),
          dataType: "xml", 
          success: processDrugQuantity,
         	error: function (jqXHR, textStatus, errorThrown){
						alert(jqXHR.status+", "+textStatus+", "+ errorThrown);
         	}
	});
} 

function processDrugQuantity(data) {
	//alert("In processDrugQuantity");
  var dataTable = extractDrugQuantity(data);
	var prdData = processDataTable(dataTable);	
	//drawCharts(prdData);
	drawDygraph(prdData);
}

function drawDygraph(prdData){
	var j=0;
	for (var i=0;i<4;i++){
			//alert(i);
			if(prdData.drugGroup[i].length!=0){
				var str = buildCSV(prdData, prdData.drugGroup[i]);
				if(str!=""){
					var curId = 'vis_drug_'+j;
					j++;
					//g = new Dygraph(document.getElementById(curId), str, {connectSeparatedPoints: true,drawPoints:true, colors: [colorArr[0], colorArr[1], colorArr[2]] });
					g = new Dygraph(document.getElementById(curId), str, 
							{connectSeparatedPoints: true,drawPoints:true, colors: colorArr });
					document.getElementById(curId).style.display = 'block';
				}
		}				
	}
}

function drawCharts(prdData) {
	var chartOptions = {};
  chartOptions['title']= 'Drug Quantities for Paitent '+curPtID;
  chartOptions['legend'] = 'bottom';
  chartOptions['legendFontSize'] = 16;
	for (var i=0;i<4;i++){
			if(prdData.drugGroup[i].length!=0){
				var table = buildTable(prdData, prdData.drugGroup[i]);
				var curId = 'visualization_'+i;
				//alert(curId);
  			visualization = new google.visualization.LineChart(document.getElementById(curId));
				//visualization.draw(table,  {legendFontSize: 12});
  			visualization.draw(table, chartOptions);
		}				
	}
}

function extractDrugQuantity(data) {
	//alert("In extractDrugQuantity");
  var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'Drug Name');
	dataTable.addColumn('string', 'Date');
	dataTable.addColumn('string', 'Unit Value');
	dataTable.addColumn('string', 'Unit Name');

	$(data).find('result').each(function(){
	var drugName="", dateStr="", unitValue="", unitName="";
	$(this).find("binding").each(function(){
		var row  = Array();
	  if($(this).attr("name")=="drugName")
	  {
	    drugName=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="date")
	  {
	    dateStr=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="unitValue")
	  {
	    unitValue=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="unitName")
	  {
	    unitName=($(this).find("literal").text()); 
	  }
		if(drugName !=""&&dateStr !=""&&unitValue !=""&&unitName !=""){
			//alert(drugName+", "+dateStr+", "+unitValue+", "+unitName);
			row.push(drugName);
			row.push(dateStr);
			row.push(unitValue);
			row.push(unitName);
			dataTable.addRow(row);
		}
	});
	});

	return dataTable;
}

function processDataTable(data) {
	//alert("In processDataTable");
    var result = {};
    result.quantitiesByDate = new Array();
    result.drugs = new Array();
		result.units = new Array();
		result.maxQuan = new Array();
		result.drugGroup = {};
		result.drugGroup[0] = new Array();
		result.drugGroup[1] = new Array();
		result.drugGroup[2] = new Array();
		result.drugGroup[3] = new Array();


   for (var i = 0; i < data.getNumberOfRows(); i++) {
    var drug = data.getValue(i, 0);
    var drug_date = data.getValue(i, 1);
    var quantity = parseFloat(data.getValue(i, 2));
	  var unit = data.getValue(i, 3);
		//alert(drug+", "+drug_date+", "+quantity+", "+unit);
    
    if (result.quantitiesByDate[drug_date] == null) {
        var _quantities = new Array();
        result.quantitiesByDate[drug_date] = _quantities;
        _quantities[drug] = quantity;
    } else {
        _quantities = result.quantitiesByDate[drug_date];
        _quantities[drug] = quantity;
    }
		if(result.maxQuan[drug] == null)
			result.maxQuan[drug] = quantity;
		else if(result.maxQuan[drug] < quantity)
			result.maxQuan[drug] = quantity;		

    result.drugs[drug] = drug;
	  result.units[drug] = unit;
   }

	var maxQuan = result.maxQuan
	var curGroup;
	for (var drug in result.drugs) {
			if(maxQuan[drug]<10)
				//curGroup = result.drugGroup[0];
				result.drugGroup[0].push(drug);
			else if (maxQuan[drug]<100)
				//curGroup = result.drugGroup[1];
				result.drugGroup[1].push(drug);
			else if (maxQuan[drug]<1000)
				//curGroup = result.drugGroup[2];
				result.drugGroup[2].push(drug);
			else
				//curGroup = result.drugGroup[3];
				result.drugGroup[3].push(drug);
			//curGroup[drug]=drug;
	}//end of for

   return result; 
 }

function buildCSV(data, drugGroup) {
   var str="Date, ";
	 var drugName="";
	if(drugGroup.length<1)
		return "";

    for (var i=0; i< drugGroup.length; i++ ){
				drugName = drugGroup[i];
				str+=drugName+" in " + data.units[drugName];
						if(i<drugGroup.length-1)
							str+=", ";
						else
							str+="\n";
    }
	//drugName = drugGroup[drugGroup.length-1];
	//str+=drugName+" in " + data.units[drugName]+"\n";

    quantitiesByDate = data.quantitiesByDate;

    for (var drug_date in quantitiesByDate) {
      var curDate=new Date(drug_date);
			//row.push(curDate.format("yyyy-mm-dd"));
			str+= curDate.format("yyyy-mm-dd")+", ";
			for (var i=0; i< drugGroup.length; i++ ){
						var drug = drugGroup[i];
            var drugQuantities = quantitiesByDate[drug_date]
            if (drugQuantities[drug] == null)  
                //row.push(undefined);
								str+="null";
            else {
                //row.push(drugQuantities[drug])
								str+=drugQuantities[drug];
            }
						if(i<drugGroup.length-1)
							str+=", ";
						else
							str+="\n";
        }
    }
    //table.sort([{column: 0}, {column: 1}]);
		//alert(str);
    return str;
}

function buildTable(data, drugGroup) {
    table = new google.visualization.DataTable();
    table.addColumn('string', 'Date');
    for (var i=0; i< drugGroup.length; i++ ){
				var drugName = drugGroup[i];
        table.addColumn('number', drugName + ' in ' + data.units[drugName]);
    }

    quantitiesByDate = data.quantitiesByDate;

    for (var drug_date in quantitiesByDate) {
        var row  = Array();
      var curDate=new Date(drug_date);
			row.push(curDate.format("yyyy-mm-dd"));
      //for (var drug in drugGroup) {
			for (var i=0; i< drugGroup.length; i++ ){
						var drug = drugGroup[i];
            var drugQuantities = quantitiesByDate[drug_date]
            if (drugQuantities[drug] == null)  
                row.push(undefined);
            else {
                row.push(drugQuantities[drug])
            }
        }
        table.addRow(row);
    }
    //table.sort([{column: 0}, {column: 1}]);
    return table;
}

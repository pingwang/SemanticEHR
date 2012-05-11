function checkDrugQuan() {
	//alert("In checkDrugQuan");
	var selectedDrugs=getSelectedDrugs();
	if(selectedDrugs.length<1){
		alert("Please select a drug!");
		return;
	}
	hideExistingViz('check_drug_viz_');
	sendCheckDrugQuanQuery(curPtID, selectedDrugs);
}

function sendCheckDrugQuanQuery(inputPtID, selectedDrugs){
	var sparqlCheckDrug="PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
		"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#>\r\n"+ 
		"PREFIX owl: <http://www.w3.org/2002/07/owl#>\r\n"+
		"PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>\r\n"+
		"PREFIX list: <http://jena.hpl.hp.com/ARQ/list#>\r\n"+

		"SELECT DISTINCT ?drugName ?date ?unitValue ?limit ?unitName\r\n"+
		"WHERE {\r\n"+
		" ?drug rdf:type health-role:ExceededThreshold .\r\n"+
		" ?drug health-role:hasRxNorm ?drugCode .\r\n"+
		" ?drug health-role:hasName ?drugName .\r\n"+
		" ?drug health-role:hasUnitValue ?unitValue .\r\n"+
		" ?drug health-role:hasUnitName ?unitName .\r\n"+
		" ?refill rdf:type health-role:Refill .\r\n"+
		//" ?refill health-role:hasPatientID \"1768562\" .\r\n"+
		" ?refill health-role:hasPatientID \""+inputPtID+"\" .\r\n"+
		" ?refill health-role:hasRXN ?drugCode .\r\n"+
		" ?refill health-role:hasDate ?date .\r\n"+
		" ?drug rdf:type ?threshold .\r\n"+
		" ?threshold owl:intersectionOf ?desc .\r\n"+
		" ?desc list:member ?restriction .\r\n"+
		" ?restriction owl:onProperty health-role:hasUnitValue .\r\n"+
		" ?restriction owl:someValuesFrom ?datatype .\r\n"+
		" ?datatype owl:withRestrictions ?desc2 .\r\n"+
		" ?desc2 list:member ?limiter .\r\n"+
		" ?limiter xsd:minInclusive ?limit .\r\n"+
 		//FILTER (str(?drugName) = "Digoxin Oral Tablet [Lanoxin]" || str(?drugName) = "carvedilol Oral Tablet")
		buildDrugFilter(selectedDrugs)+"}";

 	//alert(sparqlCheckDrug);

       $.ajax({type: "GET",
          url: reasonAgent,
          data: "query="+encodeURIComponent(sparqlCheckDrug),
          dataType: "xml", 
          success: processCheckDrug,
         	error: function (jqXHR, textStatus, errorThrown){
						alert(jqXHR.status+", "+textStatus+", "+ errorThrown);
         	}
     });
} 

function processCheckDrug(data) {
	//alert("In processDrugQuantity");
  var dataTable = extractCheckDrugQuantity(data);
	var prdData = processCheckDrugTable(dataTable);	
	//drawCharts(prdData);
	drawCheckDrugDygraph(prdData);
}

function drawCheckDrugDygraph(prdData){
	var j=0;
	for (var i=0;i<4;i++){
			//alert(i);
			if(prdData.drugGroup[i].length!=0){
				var str = buildCheckDrugCSV(prdData, prdData.drugGroup[i]);
				if(str!=""){
					var curId = 'check_drug_viz_'+j;
					j++;
					g = new Dygraph(document.getElementById(curId), str, 
							{connectSeparatedPoints: true,drawPoints:true, colors: colorArr });
					document.getElementById(curId).style.display = 'block';
				}
		}				
	}
}

function extractCheckDrugQuantity(data) {
	//alert("In extractDrugQuantity");
  var dataTable = new google.visualization.DataTable();
	dataTable.addColumn('string', 'Drug Name');
	dataTable.addColumn('string', 'Date');
	dataTable.addColumn('string', 'Unit Value');
	dataTable.addColumn('string', 'Limit Value');
	dataTable.addColumn('string', 'Unit Name');

	$(data).find('result').each(function(){
	var drugName="", dateStr="", unitValue="", limit="", unitName="";
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
	  if($(this).attr("name")=="limit")
	  {
	    limit=($(this).find("literal").text()); 
	  }
	  if($(this).attr("name")=="unitName")
	  {
	    unitName=($(this).find("literal").text()); 
	  }
		if(drugName !=""&&dateStr !=""&&unitValue !=""&&limit !=""&&unitName !=""){
			//alert(drugName+", "+dateStr+", "+unitValue+", "+unitName);
			row.push(drugName);
			row.push(dateStr);
			row.push(unitValue);
			row.push(limit);
			row.push(unitName);
			dataTable.addRow(row);
		}
	});
	});

	return dataTable;
}

function processCheckDrugTable(data) {
	//alert("In processCheckDrugTable");
    var result = {};
    result.quantitiesByDate = new Array();
    result.limitsByDate = new Array();
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
		var limit = parseFloat(data.getValue(i, 3));
	  var unit = data.getValue(i, 4);
		//alert(drug+", "+drug_date+", "+quantity+", "+unit);
    
    if (result.quantitiesByDate[drug_date] == null) {
        var _quantities = new Array();
        result.quantitiesByDate[drug_date] = _quantities;
        _quantities[drug] = quantity;
    } else {
        _quantities = result.quantitiesByDate[drug_date];
        _quantities[drug] = quantity;
    }
		//limit
    if (result.limitsByDate[drug_date] == null) {
        var _limits = new Array();
        result.limitsByDate[drug_date] = _limits;
        _limits[drug] = limit;
    } else {
        _limits = result.limitsByDate[drug_date];
        _limits[drug] = limit;
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


function buildCheckDrugCSV(data, drugGroup) {
   var str="Date, ";
	 var drugName="";
	if(drugGroup.length<1)
			return "";

    for (var i=0; i< drugGroup.length; i++ ){
				drugName = drugGroup[i];
				str+=drugName+" Dosage in " + data.units[drugName];
				str+=", ";
				str+=drugName+" Dosage Limit";
						if(i<drugGroup.length-1)
							str+=", ";
						else
							str+="\n";
    }

    quantitiesByDate = data.quantitiesByDate;
		limitsByDate = data.limitsByDate;

    for (var drug_date in quantitiesByDate) {
      var curDate=new Date(drug_date);
			//row.push(curDate.format("yyyy-mm-dd"));
			str+= curDate.format("yyyy-mm-dd")+", ";
			for (var i=0; i< drugGroup.length; i++ ){
						var drug = drugGroup[i];
            var drugQuantities = quantitiesByDate[drug_date]
            if (drugQuantities[drug] == null)  
								str+="null";
            else {
								str+=drugQuantities[drug];
            }
						str+=", ";
						//
            var drugLimits = limitsByDate[drug_date]
            if (drugLimits[drug] == null)  
								str+="null";
            else {
								str+=drugLimits[drug];
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


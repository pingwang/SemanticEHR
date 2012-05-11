package HealthViz.WebService;

import java.io.*;
import java.util.*;

import org.mindswap.pellet.jena.PelletReasonerFactory;


import com.hp.hpl.jena.ontology.OntModel;
import com.hp.hpl.jena.query.QueryExecution;
import com.hp.hpl.jena.query.QueryExecutionFactory;
import com.hp.hpl.jena.query.ResultSet;
import com.hp.hpl.jena.query.ResultSetFormatter;
import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.StmtIterator;
import com.hp.hpl.jena.util.FileManager;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

public class HealthVizAgentInstance implements HttpHandler {
	OntModel owlModel;
	static String baseDir = "/home/ping/projects/health/data/";
	static String owlFileName  = "health-role.owl";
	static String regulationFileName = "drug-regulations.rdf";
	static String dataFileName ="partialEHR.ttl";//"allEHR.ttl"
	//String dataFileName = "/media/DATA/source/tw-rpi-edu/sehrData/smart_patient_drugs.csv.e1.ttl";
    static String baseUrl="http://aquarius.tw.rpi.edu/projects/semanthealth/sehr/data/";
    
	public HealthVizAgentInstance() {
		//load ontology model
		owlModel = ModelFactory.createOntologyModel(PelletReasonerFactory.THE_SPEC);
		try {
			//read the Ontology file
			//InputStream in = FileManager.get().open(baseDir+owlFileName);       
			//owlModel.read(in, "");
			owlModel.read(baseUrl+owlFileName);
			//read the regulation file
			//InputStream regIn = FileManager.get().open(baseDir+regulationFileName);  
			//owlModel.read(regIn, "");   
			owlModel.read(baseUrl+regulationFileName);
			//read the data file
			//InputStream dataIn = FileManager.get().open(baseDir+dataFileName);  
			//owlModel.read(dataIn, "", "TTL");  
			owlModel.read(baseUrl+dataFileName, "TTL");
			// write it to standard out
			//owlModel.write(System.out);     

		}
		catch(IllegalArgumentException e) {
			System.err.println("File not found");
		}
		catch(Exception e){
			System.err.println("In HealthVizAgentInstance, err");			
		}
	}

	public void handle(HttpExchange arg0) throws IOException {
		//long start = System.currentTimeMillis();
		//long start2 = System.currentTimeMillis();
		arg0.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
		try {
			//get query string
			Map<String,String> params = parseRequest(arg0);
			String queryString=params.get("query");			

			//get query result in xml format
			String response = getQueryResult(owlModel,queryString);
			//String response = arg0.getRequestURI().getQuery();
			//send response back
			arg0.getResponseHeaders().set("Content-type", "text/xml");
			arg0.sendResponseHeaders(200, response.length());
			OutputStream os = arg0.getResponseBody();
			os.write(response.getBytes());
			os.flush();
			os.close();
		} catch(Exception e) {
			e.printStackTrace();
			String response = "Server side error. Please see log for details.";
			arg0.sendResponseHeaders(500, response.length());
			arg0.getResponseBody().write(response.getBytes("UTF-8"));
			arg0.getResponseBody().close();
		}

	}
	
	public Map<String,String> parseRequest(HttpExchange arg0) throws IOException
	{
		HashMap<String,String> result = new HashMap<String, String>();
		String query = arg0.getRequestURI().getQuery();
		//parse request
		String [] request=query.split("&");		

		for(int i=0;i<request.length;i++) {
			String[] pieces = new String[2];
			int pos = request[i].indexOf('=');
			if(pos==-1){
				System.err.println(request[i]);
				break;
			}
			pieces[0] = request[i].substring(0, pos);
			pieces[1] = request[i].substring(pos+1);	
			result.put(pieces[0], java.net.URLDecoder.decode(pieces[1],"UTF-8"));
		}
		//System.out.println(query);
		//System.out.println(result);
		return result;
	}
	
	public String getQueryResult(Model model, String queryString)
	{
		QueryExecution qe = QueryExecutionFactory.create(queryString, model);

		try {
			ResultSet queryResults = qe.execSelect();

			String result = ResultSetFormatter.asXMLString(queryResults);
			qe.close();
			return result;
		}
		catch(Exception e) {
			if(queryString.indexOf("DESCRIBE")>-1) {
				Model m2 = qe.execDescribe();
				StringWriter sw = new StringWriter();
				m2.write(sw);
				return sw.toString();
			}
			else {
				e.printStackTrace();
			}
			return "";
		}
	}

	public void test(){
		String queryString1 = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
		"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#>\r\n"+
		"SELECT DISTINCT ?drugName ?unitValue ?unitName\r\n"+
		"WHERE {\r\n"+
		"?drug rdf:type health-role:ExceededThreshold .\r\n"+
		"?drug health-role:hasRxNorm ?drugCode .\r\n"+
		"?drug health-role:hasName ?drugName .\r\n"+
		"?drug health-role:hasUnitValue ?unitValue .\r\n"+
		"?drug health-role:hasUnitName ?unitName .\r\n"+
		"}";
		
		String queryString2 = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
			"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#> \r\n"+
			"SELECT DISTINCT ?drugName ?date ?unitValue ?unitName\r\n"+
			"WHERE {\r\n"+
			" ?drug rdf:type health-role:ExceededThreshold .\r\n"+
			" ?drug health-role:hasRxNorm ?drugCode .\r\n"+
			" ?drug health-role:hasName ?drugName .\r\n"+
			" ?drug health-role:hasUnitValue ?unitValue .\r\n"+
			" ?drug health-role:hasUnitName ?unitName .\r\n"+
			" ?refill rdf:type health-role:Refill .\r\n"+
			" ?refill health-role:hasPatientID \"1768562\" .\r\n"+
			" ?refill health-role:hasRXN ?drugCode .\r\n"+
			" ?refill health-role:hasDate ?date .\r\n"+
			" FILTER (str(?drugName) = \"Digoxin Oral Tablet [Lanoxin]\" || str(?drugName) = \"carvedilol Oral Tablet\")\r\n"+
			"}";
		
		String queryString3 = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\r\n"+
		"PREFIX health-role: <http://tw2.tw.rpi.edu/wangp5/owl/health-role.owl#> \r\n"+
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
		" ?refill health-role:hasPatientID \"1768562\" .\r\n"+
		" ?refill health-role:hasRXN ?drugCode .\r\n"+
		" ?refill health-role:hasDate ?date .\r\n"+
		" ?drug rdf:type ?threshold . \r\n"+
		" ?threshold owl:intersectionOf ?desc . \r\n"+
		" ?desc list:member ?restriction . \r\n"+
		" ?restriction owl:onProperty health-role:hasUnitValue . \r\n"+
		" ?restriction owl:someValuesFrom ?datatype . \r\n"+
		" ?datatype owl:withRestrictions ?desc2 . \r\n"+
		" ?desc2 list:member ?limiter . \r\n"+
		" ?limiter xsd:minInclusive ?limit . \r\n"+
		" FILTER (str(?drugName) = \"Digoxin Oral Tablet [Lanoxin]\" || str(?drugName) = \"carvedilol Oral Tablet\")\r\n"+
		"}";
			
		String response = getQueryResult(owlModel,queryString3);
		System.out.println(response);
	}

	public static void main(String[] args) {
		HealthVizAgentInstance inst = new HealthVizAgentInstance();
		inst.test();

	}

}

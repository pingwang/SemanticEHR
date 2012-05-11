package HealthViz.WebService;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpServer;


public class HeathVizAgent {
	public static void main(String[] args) {

		System.out.println("Starting web service...");
		HttpServer server=null;
		Executor exec = Executors.newFixedThreadPool(30);
		try {
			server = HttpServer.create(new InetSocketAddress(14480), 0);
		}
		catch(IOException e) {
			e.printStackTrace();
			return;
		}
		server.setExecutor(exec);
		server.createContext("/agent").setHandler(new HealthVizAgentInstance());
		server.start();
		System.out.println("Web service started...");
		
	}
}

<?php


if(isset($_REQUEST['query'])&&$_REQUEST['query']!="")
{


  $query=$_REQUEST['query'];
  
  $service="http://sparql.tw.rpi.edu/virtuoso/sparql";
  //$service="http://tw2.tw.rpi.edu:2025/sparql";
  //$service="http://localhost:14480/agent";
  //$service="http://localhost:2025/sparql";
	$query=stripslashes($query);
  $url=$service."?query=".urlencode($query);
  //$url=$service."?query=".urlencode(str_replace("\\","",$query));

  if(isset($_REQUEST['debug'])){
    //$query=str_replace("<","&lt;",$query);
    //$query=str_replace(">","&gt;",$query);
     //echo str_replace("\\","",$query)."<br><br>\n";
     echo "<br>\n".$_REQUEST['query']."<br>\n";
     echo "<br>\n".$query."<br>\n";
     echo $url;
     return;
  }
  $data=@file_get_contents($url);


  //$data=preg_replace("/<br \/>.*/","",$data);
  //$data=preg_replace("/<b>.*<\/b>/","",$data);
  //$data=str_replace("\n","",$data);


  header("Content-type: text/xml");

  echo $data;

 }
?>


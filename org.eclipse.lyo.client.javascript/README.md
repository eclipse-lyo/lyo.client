Lyo Javascript Client
==========================

**Version 0.1:**

This is a initial version of a OSLC javascript client that can be used to interact with OSLC enabled tools like Rational Team Concert, Rational Quality Manager, ClearQuest and Bugzilla Lyo Adapter. In this version, I have only tested with Change Management tools, but the intention is that this client works with another domains like Automation, Requirements Management, etc. Feel free to test and give feedback.

The main functionalities that are implemented in this version are:

- Creation
- Update
- Delete
- Creation Dialog
- Selection Dialog
- Query

Obs.: In order to properly use the client, you must be logged your OSLC Server Tool and this tool needs to be [CORS](https://pt.wikipedia.org/wiki/Cross-origin_resource_sharing) enabled.

**ENABLING CORS:**

- Jazz based products: I recommend the use of [Equinox CORS Filter](https://github.com/fernando-silva/equinoxcorsfilter#equinox-cors-filter).
- Websphere: <http://clmpractice.org/2015/01/07/how-to-enable-cors-with-rational-team-concert-ccm-running-on-a-websphere-application-server-was-8-5/>
- Lyo Bugzilla Adapter:  
        		1. You need to edit de pom.xml file and add a dependency to com.thetransactioncompany:cors-filter:2.4  
        		2. After that you need to edit the web.xml file and add the following filter:  

				<filter>
		        <filter-name>cross-origin</filter-name>
		        <filter-class>com.thetransactioncompany.cors.CORSFilter</filter-class>
		        <init-param>
					<param-name>cors.supportedMethods</param-name>
					<param-value>GET,POST,HEAD,OPTIONS,PUT,DELETE</param-value>
				  </init-param>
		        <init-param>
					<param-name>cors.exposedHeaders</param-name>
					<param-value>Location,Etag,Content-Length</param-value>
				  </init-param>  
		        <load-on-startup>1</load-on-startup>
		    	</filter>
		    	<filter-mapping>
		    		<filter-name>cross-origin</filter-name>
		    		<url-pattern>/*</url-pattern>
		    	</filter-mapping>

**DEPENDENCIES**

- jQuery 1.11.4
- jQuery UI 1.11.4
- jQuery UI CSS File
- An Rdf library ([rdf-ext](https://github.com/rdf-ext/rdf-ext-dist/blob/master/dist/rdf-ext.js) or [rdflib.js](https://github.com/linkeddata/rdflib.js/blob/master/dist/rdflib.js))
- An Rdf lib Wrapper (Currently two implementations are provided: [rdfextWrapper.js](rdfextWrapper.js) and  [rdflibjsWrapper.js](rdflibjsWrapper.js) )

Examples:

     <script src="https://code.jquery.com/jquery.min.js"></script>
     <script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
     <link rel="stylesheet" type="text/css" href="https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"></link>
     <script src="../rdflib.js"></script>
     <script src="../rdflibjsWrapper.js"></script>

    or

     <script src="https://code.jquery.com/jquery.min.js"></script>
     <script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script>
     <link rel="stylesheet" type="text/css" href="https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"></link>
     <script src="../rdf-ext.js"></script>
     <script src="../rdfextWrapper.js"></script>

**USING**

See [examples/all.html](examples/all.html).

**API DOCUMENTATION**

To generate the documentation use JSDoc. Example:

/path/to/jsdoc oslcClient.js README.md

**LIMITATIONS**

- No support for Json as Accept Media Type, only for submission of updates and creation of resources

- Both rdflib.js and rdf-ext have problems with rdf:parseType="Literal" when parsing application/rdf+xml. As a workaround you can do:

For rdflib.js:

Change the addLiteral function that is inside frameFactory function at $rdf.RDFParser class

     `'addLiteral':function(value){
     if (this.parent.datatype){
          if(this.parent.datatype === RDFParser.ns.RDF + "XMLLiteral" ){
	 		      this.node = this.store.literal(value.textContent, "", this.store.sym(this.parent.datatype));
	 	}
	 	else {
	 		this.node = this.store.literal(value, "", this.store.sym(this.parent.datatype));
	 	}
   }
   else {
     this.node = this.store.literal(value, this.lang);
   }`

For rdf-ext:

Change the function  domNodesToString inside RdfXmlParser.prototype.process:

     `// convert an array of DOM nodes to a XML string
     var domNodesToString = function (nodes) {
          var xmlString = '';
          if(nodes){
            for(var i=0; i<nodes.length; i++) {
              if(nodes[i].nodeType=== Node.TEXT_NODE){
                xmlString += nodes[i].textContent;
               }
               else {
                 xmlString += nodes[i].toString();
               }
           }
          }
         return xmlString;
        }; `


- Currently there is no rdf/xml serializer for rdf-ext. As a workaround you can:

Provide the rdflib.js file and then the rdfextWrapper will convert the graph to N3 and use rdflib.js to serialize to rdf/xml.

Or use the raw data that was returned to serialize the xml response (see the function getChangeRequest inside [examples/all.html](examples/all.html) for more information):

     var xmlString = (new XMLSerializer()).serializeToString(data);     


**COPYRIGHT AND LICENCE**

Copyright (c) 2015 Fernando Silva.
All rights reserved. This program and the accompanying materials
are made available under the terms of the Eclipse Public License v1.0
 and Eclipse Distribution License v. 1.0 which accompanies this distribution.

The Eclipse Public License is available at http://www.eclipse.org/legal/epl-v10.html
and the Eclipse Distribution License is available at
http://www.eclipse.org/org/documents/edl-v10.php.

 Contributors:
     Fernando Silva - initial API and implementation

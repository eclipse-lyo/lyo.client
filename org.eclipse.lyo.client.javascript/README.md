Lyo Javascript Client
==========================

Version 0.1:

This is a initial version of a OSLC javascript client that can be used to interact with OSLC enabled tools like Rational Team Concert, Rational Quality Manager, ClearQuest and Bugzilla Lyo Adapter. In this version, I have only tested with Change Management tools, but the intention is that this client works with another domains like Automation, Requirements Management, etc. Feel free to test and give feedback.

The main functionalities that are implemented in this version are:

- Creation
- Update 
- Delete
- Creation Dialog
- Selection Dialog
- Query

Obs.: In order to properly use the client, you must be logged your OSLC Server Tool and this tool needs to be [CORS](https://pt.wikipedia.org/wiki/Cross-origin_resource_sharing) enabled.

ENABLING CORS:

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
					<param-value>Location,Etag</param-value>
				  </init-param>  
		        <load-on-startup>1</load-on-startup>
		    	</filter>
		    	<filter-mapping>
		    		<filter-name>cross-origin</filter-name>
		    		<url-pattern>/*</url-pattern>
		    	</filter-mapping>

DEPENDENCIES

- jQuery 1.11.4
- jQuery UI 1.11.4
- jQuery UI CSS File

Example: 
    ` <script src="https://code.jquery.com/jquery.min.js"></script> `
    ` <script src="https://code.jquery.com/ui/1.11.4/jquery-ui.min.js"></script> `
    ` <link rel="stylesheet" type="text/css" href="https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css"></link> `
   
USING

See [examples/all.html](examples/all.html).

COPYRIGHT AND LICENCE

Copyright (c) 2015 Fernando Silva.
All rights reserved. This program and the accompanying materials
are made available under the terms of the Eclipse Public License v1.0
 and Eclipse Distribution License v. 1.0 which accompanies this distribution. 

The Eclipse Public License is available at http://www.eclipse.org/legal/epl-v10.html
and the Eclipse Distribution License is available at 
http://www.eclipse.org/org/documents/edl-v10.php.

 Contributors:
     Fernando Silva - initial API and implementation

/*******************************************************************************
 * Copyright (c) 2011, 2012 IBM Corporation and others.
 *
 *  All rights reserved. This program and the accompanying materials
 *  are made available under the terms of the Eclipse Public License v1.0
 *  and Eclipse Distribution License v. 1.0 which accompanies this distribution.
 *  
 *  The Eclipse Public License is available at http://www.eclipse.org/legal/epl-v10.html
 *  and the Eclipse Distribution License is available at
 *  http://www.eclipse.org/org/documents/edl-v10.php.
 *  
 *  Contributors:
 *  
 *     Michael Fiedler                 - initial API and implementation
 *     Lars Ohl�n (Tieto Corporation)  - Resolved Bugzilla 393875,389275
 *******************************************************************************/
package org.eclipse.lyo.client.oslc;
import java.io.IOException;
import java.io.InputStream;
import java.net.URISyntaxException;
import java.net.URL;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.Set;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import net.oauth.OAuthException;
import net.oauth.client.httpclient4.HttpClientPool;

import org.apache.http.client.HttpClient;
import org.apache.http.conn.ClientConnectionManager;
import org.apache.http.conn.scheme.Scheme;
import org.apache.http.conn.scheme.SchemeRegistry;
import org.apache.http.conn.ssl.SSLSocketFactory;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.wink.client.ApacheHttpClientConfig;
import org.apache.wink.client.ClientConfig;
import org.apache.wink.client.ClientResponse;
import org.apache.wink.client.RestClient;
import org.eclipse.lyo.client.exception.ResourceNotFoundException;
import org.eclipse.lyo.client.oslc.resources.OslcQuery;
import org.eclipse.lyo.oslc4j.provider.jena.JenaProvidersRegistry;
import org.eclipse.lyo.oslc4j.provider.json4j.Json4JProvidersRegistry;

import com.hp.hpl.jena.rdf.model.Model;
import com.hp.hpl.jena.rdf.model.ModelFactory;
import com.hp.hpl.jena.rdf.model.Property;
import com.hp.hpl.jena.rdf.model.RDFNode;
import com.hp.hpl.jena.rdf.model.Selector;
import com.hp.hpl.jena.rdf.model.SimpleSelector;
import com.hp.hpl.jena.rdf.model.Statement;
import com.hp.hpl.jena.rdf.model.StmtIterator;

/**
 * An OSLC Client.  Provides an Apache HttpClient, an Apache Wink REST ClientConfig and defines
 * a getResource method which returns an Apache Wink ClientResponse.
 * 
 * This class is not currently thread safe.
 *
 */


public class OslcClient {
	
	protected HttpClient httpClient;
	private HttpClientPool clientPool;
	private ClientConfig clientConfig;
	
	/*  List of secure socket protocols. Note: TLSv1.2 is supported from Java 7, SSL_TLS is specific for the IBM JVMs */
	private static final String SECURE_SOCKET_PROTOCOL [] = new String[] {"TLSv1.2","TLS","SSL","SSL_TLS"}; //$NON-NLS-1$ //$NON-NLS-2$ //$NON-NLS-3$  //$NON-NLS-4$
	
	
	/**
	 * Initialize a new OslcClient
	 */
	public OslcClient()
	{
		httpClient = new DefaultHttpClient();
		setupLazySSLSupport();
		clientPool = new OAuthHttpPool();
		clientConfig = new ApacheHttpClientConfig(httpClient);
		javax.ws.rs.core.Application app = new javax.ws.rs.core.Application() {
		       public Set<Class<?>> getClasses() {
		           Set<Class<?>> classes = new HashSet<Class<?>>();
		           classes.addAll(JenaProvidersRegistry.getProviders());
		           classes.addAll(Json4JProvidersRegistry.getProviders());
		           return classes;
		       }
		};
		clientConfig = clientConfig.applications(app);
		
	}
	
	/**
	 * Returns the HTTP client associated with this OSLC Client
	 * @return the HTTP client
	 */
	public HttpClient getHttpClient() {
		return httpClient;
	}

	protected HttpClientPool getClientPool() {
		return clientPool;
	}

	protected ClientConfig getClientConfig() {
		return clientConfig;
	}

	/**
	 * Abstract method get an OSLC resource and return a Wink ClientResponse
	 * @param url
	 * @param method
	 * @param mediaType
	 * @return a Wink ClientResponse
	 * @throws IOException
	 * @throws OAuthException
	 * @throws URISyntaxException
	 */
	public ClientResponse getResource(final String url, final String mediaType) 
			throws IOException, OAuthException, URISyntaxException {
		
		RestClient restClient = new RestClient(clientConfig);
		return restClient.resource(url).accept(mediaType).header(OSLCConstants.OSLC_CORE_VERSION,"2.0").get();
	}
	
	/**
	 * Delete an OSLC resource and return a Wink ClientResponse
	 * @param url
	 * @return a Wink ClientResponse
	 * @throws IOException
	 * @throws OAuthException
	 * @throws URISyntaxException
	 */
	public ClientResponse deleteResource(final String url) 
			throws IOException, OAuthException, URISyntaxException {
		
		RestClient restClient = new RestClient(clientConfig);
		return restClient.resource(url).delete();
	}
	
	
	/**
	 * Create (POST) an artifact to a URL - usually an OSLC Creation Factory
	 * @param url
	 * @param artifact
	 * @param mediaType
	 * @return
	 */
	public ClientResponse createResource(final String url, final Object artifact, String mediaType) {
		RestClient restClient = new RestClient(clientConfig);
		return restClient.resource(url).contentType(mediaType).header(OSLCConstants.OSLC_CORE_VERSION,"2.0").post(artifact);
	}
	
	/**
	 * Create (POST) an artifact to a URL - usually an OSLC Creation Factory
	 * @param url
	 * @param artifact
	 * @param mediaType
	 * @param acceptType
	 * @return
	 */
	public ClientResponse createResource(final String url, final Object artifact, String mediaType, String acceptType) {
		RestClient restClient = new RestClient(clientConfig);
		return restClient.resource(url).contentType(mediaType).accept(acceptType).header(OSLCConstants.OSLC_CORE_VERSION,"2.0").post(artifact);
	}
	
	/**
	 * Update (PUT) an artifact to a URL - usually the URL for an existing OSLC artifact
	 * @param url
	 * @param artifact
	 * @param mediaType
	 * @return
	 */
	public ClientResponse updateResource(final String url, final Object artifact, String mediaType) {
		RestClient restClient = new RestClient(clientConfig);
		return restClient.resource(url).contentType(mediaType).header(OSLCConstants.OSLC_CORE_VERSION,"2.0").put(artifact);
	}
	
	/**
	 * Update (PUT) an artifact to a URL - usually the URL for an existing OSLC artifact
	 * @param url
	 * @param artifact
	 * @param mediaType
	 * @param acceptType
	 * @return
	 */
	public ClientResponse updateResource(final String url, final Object artifact, String mediaType, String acceptType) {
		RestClient restClient = new RestClient(clientConfig);
		return restClient.resource(url).contentType(mediaType).accept(acceptType).header(OSLCConstants.OSLC_CORE_VERSION,"2.0").put(artifact);
	}

	/**
	 * Create a Wink Resource for the given OslcQuery object
	 * @param query
	 * @return
	 */
	public org.apache.wink.client.Resource getQueryResource(final OslcQuery query) {
		RestClient restClient = new RestClient(clientConfig);
		org.apache.wink.client.Resource resource = restClient.resource(query.getCapabilityUrl());
		return resource;
	}
	
	protected class OAuthHttpPool implements HttpClientPool {
		public HttpClient getHttpClient(URL url) {
			return httpClient;
		}
		
	}
	
	/**
	 * Lookup the URL of a specific OSLC Service Provider in an OSLC Catalog using the service provider's title
	 * 
	 * @param catalogUrl
	 * @param serviceProviderTitle
	 * @return
	 * @throws IOException
	 * @throws OAuthException
	 * @throws URISyntaxException
	 * @throws ResourceNotFoundException 
	 */
	public String lookupServiceProviderUrl(final String catalogUrl, final String serviceProviderTitle) 
			throws IOException, OAuthException, URISyntaxException, ResourceNotFoundException
	{
		String retval = null;
		ClientResponse response = getResource(catalogUrl,OSLCConstants.CT_RDF);
		Model rdfModel = ModelFactory.createDefaultModel();

		rdfModel.read(response.getEntity(InputStream.class),catalogUrl);
		
		Property spPredicate = rdfModel.createProperty(OSLCConstants.OSLC_V2,"serviceProvider");
		Selector select = new SimpleSelector(null, spPredicate, (RDFNode)null); 
		StmtIterator listStatements = rdfModel.listStatements(select);
		
		//check each serviceProvider's title and match it to the one passed in
		while (listStatements.hasNext()) {
			Statement thisSP = listStatements.nextStatement();
			com.hp.hpl.jena.rdf.model.Resource spRes = thisSP.getResource();
			Property titleProp = rdfModel.createProperty(OSLCConstants.DC,"title");
			String spTitle = spRes.getProperty(titleProp).getLiteral().getString();
			
			if (spTitle.equals(serviceProviderTitle))
			{
				retval = spRes.getURI();
			}
		}
		if (retval == null ) {
			throw new ResourceNotFoundException(catalogUrl, serviceProviderTitle);
		}
		
		return retval;
	}
	
	/**
	 * Find the OSLC Query Capability URL for a given OSLC resource type.  If no resource type is given, returns
	 * the default Query Capability, if it exists.
	 *
	 * @param serviceProviderUrl
	 * @param oslcDomain
	 * @param oslcResourceType - the resource type of the desired query capability.   This may differ from the OSLC artifact type.
	 * @return URL of requested Query Capablility or null if not found.
	 * @throws IOException
	 * @throws OAuthException
	 * @throws URISyntaxException
	 * @throws ResourceNotFoundException 
	 */
	public String lookupQueryCapability(final String serviceProviderUrl, final String oslcDomain, final String oslcResourceType) 
			throws IOException, OAuthException, URISyntaxException, ResourceNotFoundException
	{
		String retval = null;
		
		retval = lookupService(serviceProviderUrl, oslcDomain, oslcResourceType, "queryCapability", "queryBase");
		
		return retval;
	}
	
	/**
	 * Find the OSLC Creation Factory URL for a given OSLC resource type.  If no resource type is given, returns
	 * the default Creation Factory, if it exists.
	 *
	 * @param serviceProviderUrl
	 * @param oslcDomain
	 * @param oslcResourceType - the resource type of the desired query capability.   This may differ from the OSLC artifact type.
	 * @return URL of requested Creation Factory or null if not found.
	 * @throws IOException
	 * @throws OAuthException
	 * @throws URISyntaxException
	 * @throws ResourceNotFoundException 
	 */
	public String lookupCreationFactory(final String serviceProviderUrl, final String oslcDomain, final String oslcResourceType) 
			throws IOException, OAuthException, URISyntaxException, ResourceNotFoundException
	{
		String retval = null;
		
		retval = lookupService(serviceProviderUrl, oslcDomain, oslcResourceType, "creationFactory", "creation");
		
		return retval;
	}
	
	protected String lookupService(final String serviceProviderUrl, final String oslcDomain, final String oslcResourceType, 
			                    final String capability, final String serviceLocation) 
			throws IOException, OAuthException, URISyntaxException, ResourceNotFoundException
	{
		String retval = null;
		ClientResponse response = getResource(serviceProviderUrl,OSLCConstants.CT_RDF);
		
		Model rdfModel = ModelFactory.createDefaultModel();
		rdfModel.read(response.getEntity(InputStream.class),serviceProviderUrl);
		
        //First, find all services and find the one matching input oslcDomain
		Property spPredicate = rdfModel.createProperty(OSLCConstants.OSLC_V2,"service");
		Selector select = new SimpleSelector(null, spPredicate, (RDFNode)null); 
		StmtIterator listStatements = rdfModel.listStatements(select);
		
		boolean foundCapability = false;
		
		while (listStatements.hasNext()  && !foundCapability) {
			Statement thisService = listStatements.nextStatement();
			com.hp.hpl.jena.rdf.model.Resource  serviceRes = thisService.getResource();
			Property domainProp = rdfModel.createProperty(OSLCConstants.OSLC_V2,"domain");
			String domainValue = serviceRes.getProperty(domainProp).getObject().toString();
			
			//Second, find all target capabilities this service provider has
			if (domainValue.equals(oslcDomain)) {
				Property capabilityPredicate = rdfModel.createProperty(OSLCConstants.OSLC_V2,capability);
				Selector selectQuery = new SimpleSelector(serviceRes, capabilityPredicate, (RDFNode) null);
				StmtIterator capabilities = rdfModel.listStatements(selectQuery);
				
				//Third, find the target capability for the requested artifact type, or the default capability if no 
				//artifact type was given.
				
				String searchAttribute = null;
				String searchAttributeValue = null;

				if (oslcResourceType == null || oslcResourceType.isEmpty()) {
					searchAttribute = "usage";
					searchAttributeValue = OSLCConstants.OSLC_V2 + "default";
				} else {
					searchAttribute = "resourceType";
					searchAttributeValue = oslcResourceType;
				}
				
				while (capabilities.hasNext() && !foundCapability) {
					Statement thisQueryCap = capabilities.nextStatement();
					com.hp.hpl.jena.rdf.model.Resource capabilityRes = thisQueryCap.getResource();
					Property searchProp = rdfModel.createProperty(OSLCConstants.OSLC_V2,searchAttribute);
					Selector searchPropSelector = new SimpleSelector(capabilityRes, searchProp, (RDFNode)null);
					
					StmtIterator matchingStatements = rdfModel.listStatements(searchPropSelector);
					
					while (matchingStatements.hasNext()  && !foundCapability) {
						Statement currentStatement = matchingStatements.next();
						String value = currentStatement.getObject().toString();
	
						if (value.equals(searchAttributeValue)) {
							Property queryBaseProp = rdfModel.createProperty(OSLCConstants.OSLC_V2, serviceLocation);
							retval = capabilityRes.getProperty(queryBaseProp).getObject().toString();
							foundCapability = true;
						}
					}
				}
			}
		}
		
		if (retval == null)
		{
			throw new ResourceNotFoundException(serviceProviderUrl, capability);
		}
		return retval;
	}
	
	
	/**
	 * Looks up and select an installed security context provider
	 *  
	 * @return An installed SSLContext Provider
	 * @throws NoSuchAlgorithmException when no suitable provider is installed
	 */
	private SSLContext findInstalledSecurityContext() throws NoSuchAlgorithmException {
		
		// walks through list of secure socked protocols and picks the first found
		// the list is arranged in level of security order
		for (String aSecuredProtocol : SECURE_SOCKET_PROTOCOL) {
			try {
				return SSLContext.getInstance(aSecuredProtocol);
			} catch (NoSuchAlgorithmException e) {
				continue;
			}
		}
		
		throw new NoSuchAlgorithmException("No suitable secured socket provider is installed"); //$NON-NLS-1$
	} 
	
	private void setupLazySSLSupport()   {
		ClientConnectionManager connManager = httpClient.getConnectionManager();
		SchemeRegistry schemeRegistry = connManager.getSchemeRegistry();
		schemeRegistry.unregister("https");
		/** Create a trust manager that does not validate certificate chains */
		TrustManager[] trustAllCerts = new TrustManager[] { new X509TrustManager() {
			public void checkClientTrusted(
					java.security.cert.X509Certificate[] certs, String authType) {
				/** Ignore Method Call */
			}

			public void checkServerTrusted(
					java.security.cert.X509Certificate[] certs, String authType) {
				/** Ignore Method Call */
			}

			public java.security.cert.X509Certificate[] getAcceptedIssuers() {
				return null;
			}
		} };

		
	
				
		try {
			SSLContext sc = findInstalledSecurityContext();
			sc.init(null, trustAllCerts, new java.security.SecureRandom());
			SSLSocketFactory sf = new SSLSocketFactory(sc,SSLSocketFactory.ALLOW_ALL_HOSTNAME_VERIFIER);
			Scheme https = new Scheme("https", 443, sf); //$NON-NLS-1$
			schemeRegistry.register(https);
		} catch (NoSuchAlgorithmException e) {
			/* Fail Silently */
		} catch (KeyManagementException e) {
			/* Fail Silently */
		}

		
	}
	
	
}

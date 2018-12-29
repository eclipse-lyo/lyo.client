/*******************************************************************************
 * Copyright (c) 2011, 2014 IBM Corporation.
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
 *     Michael Fiedler     - initial API and implementation
 *     Samuel Padgett      - make some members protected so the class can be extended
 *     Samuel Padgett      - don't re-register JAX-RS applications for every request
 *     Samuel Padgett      - add two-legged OAuth support
 *******************************************************************************/
package org.eclipse.lyo.client.oslc;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.HttpMethod;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;

import net.oauth.OAuthAccessor;
import net.oauth.OAuthConsumer;
import net.oauth.OAuthException;
import net.oauth.OAuthMessage;
import net.oauth.OAuthServiceProvider;
import net.oauth.client.OAuthClient;
import net.oauth.client.httpclient4.HttpClient4;

import org.apache.http.HttpHeaders;

import javax.ws.rs.core.Configuration;
import javax.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OslcOAuthClient extends OslcClient {

	protected            OAuthAccessor accessor;
	private final static Logger        log = LoggerFactory.getLogger(OslcOAuthClient.class);
	private              String        oauth_real_name;

	/**
	 * Initialize an OAuthClient with the required OAuth URLs
	 * @param requestTokenURL
	 * @param authorizationTokenURL
	 * @param accessTokenURL
	 * @param consumerKey
	 * @param consumerSecret
	 */
	public OslcOAuthClient(String requestTokenURL,
						   String authorizationTokenURL,
						   String accessTokenURL,
						   String consumerKey,
						   String consumerSecret) {
		super();
		OAuthServiceProvider provider = new OAuthServiceProvider(requestTokenURL, authorizationTokenURL, accessTokenURL);
		OAuthConsumer consumer = new OAuthConsumer("",consumerKey,consumerSecret,provider);
		accessor = new OAuthAccessor(consumer);

	}

	public OslcOAuthClient(String requestTokenURL,
						   String authorizationTokenURL,
						   String accessTokenURL,
						   String consumerKey,
						   String consumerSecret,
						   String oauthRealmName) {
		this(requestTokenURL, authorizationTokenURL, accessTokenURL, consumerKey, consumerSecret);
		oauth_real_name = oauthRealmName;
	}

	public OslcOAuthClient(String requestTokenURL,
						   String authorizationTokenURL,
						   String accessTokenURL,
						   String consumerKey,
						   String consumerSecret,
						   String oauthRealmName,
						   String callback) {
		super();
		OAuthServiceProvider provider = new OAuthServiceProvider(requestTokenURL, authorizationTokenURL, accessTokenURL);
		OAuthConsumer consumer = new OAuthConsumer(callback,consumerKey,consumerSecret,provider);
		accessor = new OAuthAccessor(consumer);
		oauth_real_name = oauthRealmName;
	}

	/**
	 * Creates a two-legged OAuth client. This will only work if the server
	 * supports two-legged OAuth and a functional user has been assigned for
	 * this OAuth consumer.
	 *
	 * @param consumerKey the OAuth consumer key
	 * @param consumerSecret the OAuth consumer secret
	 */
	public OslcOAuthClient(String consumerKey, String consumerSecret) {
		OAuthServiceProvider provider = new OAuthServiceProvider(null, null, null);
		OAuthConsumer consumer = new OAuthConsumer("", consumerKey, consumerSecret, provider);
		accessor = new OAuthAccessor(consumer);
		accessor.accessToken = "";
	}

	@Override
	protected Response getResource(String url, Map<String, String> requestHeaders, String defaultMediaType)
			throws IOException, OAuthException, URISyntaxException {
		if (requestHeaders == null) {
			requestHeaders = new HashMap<>();
		}

		requestHeaders.put("Authorization", this.getAuthorizationHeader(url, HttpMethod.GET));

		return super.getResource(url, requestHeaders, defaultMediaType);
	}

	@Override
	public Response updateResource(final String url, final Object artifact, String mediaType, String acceptType, String ifMatch) throws IOException, OAuthException, URISyntaxException
	{
		String authHeader = this.getAuthorizationHeader(url, HttpMethod.PUT);

		Configuration config = getClientConfig();

		Client client = ClientBuilder.newClient(config);
		return client.target(url).request()
				.accept(acceptType)
				.header("Authorization",authHeader)
				.header(HttpHeaders.IF_MATCH, ifMatch)
				.header(OSLCConstants.OSLC_CORE_VERSION,"2.0")
				.header(HttpHeaders.IF_MATCH, ifMatch)
				.put(Entity.entity(artifact, mediaType));
	}

	/**
	 * Create (POST) an artifact to a URL - usually an OSLC Creation Factory
	 * @param url
	 * @param artifact
	 * @param mediaType
	 * @param acceptType
	 * @return
	 * @throws URISyntaxException
	 * @throws OAuthException
	 * @throws IOException
	 */
	@Override
	public Response createResource(final String url, final Object artifact, String mediaType, String acceptType) throws IOException, OAuthException, URISyntaxException  {
		String authHeader = this.getAuthorizationHeader(url, HttpMethod.POST);

		Configuration config = getClientConfig();

		Client client = ClientBuilder.newClient(config);
		return client.target(url).request()
				.accept(acceptType)
				.header("Authorization",authHeader).header(OSLCConstants.OSLC_CORE_VERSION,"2.0")
				.post(Entity.entity(artifact, mediaType));

		// return restClient.resource(url).accept(mediaType).header("Authorization",authHeader).header("OSLC-Core-Version", "2.0").get();
	}

	protected String getAuthorizationHeader(String url, String httpMethod) throws IOException, OAuthException, URISyntaxException {
		OAuthMessage message = getResourceInternal(url, httpMethod, false);

		String realm = "Jazz";
		// Change if a different name was detected
		if ( oauth_real_name != null ) {
			realm = oauth_real_name;
		}

		return message.getAuthorizationHeader(realm);
	}


	/**
	 * Performs necessary OAuth negotiation.
	 * 	- get request token
	 *  - throw redirect exception to authorization URL (and print message)
	 *  - exchange request token for access token
	 *  - access protected URL and return OAuthMessage
	 *
	 * @param url
	 * @param httpMethod
	 * @param restart
	 * @return
	 * @throws IOException
	 * @throws OAuthException
	 * @throws URISyntaxException
	 */
	protected OAuthMessage getResourceInternal(String url, String httpMethod, boolean restart) throws IOException, OAuthException, URISyntaxException {

		OAuthClient client = new OAuthClient(new HttpClient4(this.getClientPool()));
		if (!isTwoLegged()) {
			//No request token yet, get the request token and throw exception to redirect for authorization.
			if (accessor.requestToken == null) {
				client.getRequestToken(accessor);
				System.out.println("Enter this URL in a browser and run again: "+ accessor.consumer.serviceProvider.userAuthorizationURL +
						"?oauth_token=" + accessor.requestToken);  // for command line use
				throw new OAuthRedirectException(accessor.consumer.serviceProvider.userAuthorizationURL, accessor);
			}

			//Exchange request token for access token.
			if (accessor.accessToken == null) {
				try {
					client.getAccessToken(accessor, OAuthMessage.POST, null);
				} catch (OAuthException e) {
					log.debug("OAuthException caught: " + e.getMessage());
					if (restart)
					{
						log.error("Failed to get access key.");
						e.printStackTrace();
					} else {
						//restart the dance
						accessor.accessToken = null;
						accessor.requestToken = null;
						return getResourceInternal(url, httpMethod, true);
					}
				}
			}
		}

		OAuthMessage message = accessor.newRequestMessage(httpMethod, url, null);


		return message;
	}

	/**
	 * Are we using two-legged OAuth?
	 *
	 * @return true if this is a two-legged OAuth consumer
	 */
	protected boolean isTwoLegged() {
		return "".equals(accessor.accessToken);
	}
}

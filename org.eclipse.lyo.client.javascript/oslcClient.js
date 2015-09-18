/*******************************************************************************
 * Copyright (c) 2015 Fernando Silva.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and Eclipse Distribution License v. 1.0 which accompanies this distribution.
 *
 * The Eclipse Public License is available at http://www.eclipse.org/legal/epl-v10.html
 * and the Eclipse Distribution License is available at
 * http://www.eclipse.org/org/documents/edl-v10.php.
 *
 * Contributors:
 *     Fernando Silva - initial API and implementation
 *******************************************************************************/

/** @namespace utils */

(function(exports, $, undefined) {

  "use strict";

  var constants = Object.freeze({
    APPLICATION_RDF_XML_MIME_TYPE: "application/rdf+xml",
    OSLC_CORE: "http://open-services.net/ns/core#",
    DC_TERMS: "http://purl.org/dc/terms/",
    RDF: "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  });


  /** Object that represents the facade of a rdf library. */
  var rdfLib = {

    /**
     * Adds a prefix with the associated namaspace for later use
     * @param {!String} prefix - the prefix to add.
     * @param {!String} namespace - the namespace to associate with the prefix.
     * @author Fernando Silva <fernd.ffs@gmail.com>
     * @throws an exception if no implementation is given
     * @function
     */
    addPrefix: function(prefix, namespace) {
      throw "Function \"addPrefix\" not resolved.";
    },
    /**
     * Resolve the given qname into its full form.
     * @param {!String} qname - the qname to resolve (ex.: rdf:type would be resolved to http://www.w3.org/1999/02/22-rdf-syntax-ns#type)
     * @author Fernando Silva <fernd.ffs@gmail.com>
     * @throws an exception if no implementation is given
     * @function
     */
    resolveQName: function(qname) {
      throw "Function \"resolveQName\" not resolved.";
    },
    /**
     * Matches the statements in the graph object.
     * @param {object} s - the subject to match.
     * @param {object} p - the predicate to match.
     * @param {object|String} o - the object to match.
     * @param {object} graph - the graph object
     * @author Fernando Silva <fernd.ffs@gmail.com>
     * @throws an exception if no implementation is given
     * @function
     */
    match: function(s, p, o, graph) {
      throw "Function \"match\" not resolved.";
    },
    /**
     * Converts raw data into a rdf graph representation.
     * @param {!String} mediaType - the content type of the data to be parsed.
     * @param {!String} rawData - the data to be parsed.
     * @param {String} baseUri - the base uri of the parsed graph.
     * @author Fernando Silva <fernd.ffs@gmail.com>
     * @throws an exception if no implementation is given
     * @function
     */
    parse: function(mediaType, rawData, baseUri) {
      throw "Function \"parse\" not resolved.";
    },
    /**
     * Serializes the rdf graph into the specified content type.
     * @param {!object} graph- the rdf graph to serialize.
     * @param {String} baseUri - the base uri of the graph.
     * @param {!string} contentType - the content type to serialize the rdf graph.
     * @author Fernando Silva <fernd.ffs@gmail.com>
     * @throws an exception if no implementation is given
     * @function
     */
    serialize: function(graph, baseUri, contentType) {
      throw "Function \"serialize\" not resolved.";
    },
    /**
     * Gets the string value of a uri
     * @param {!object} resource - the rdf resource to get the value.
     * @param {!object} graph - the rdf graph that contains the resource
     * @author Fernando Silva <fernd.ffs@gmail.com>
     * @throws an exception if no implementation is given
     * @function
     */
    getUriValue: function(resource, graph) {
      throw "Function \"getUriValue\" not resolved.";
    }
  };


  exports.rdfLib = rdfLib;
  exports.constants = constants;

})(this, jQuery);


/** @namespace oslc */

/**
 * Represents the type of the function that is responsible to handle graph responses
 *
 * @callback GraphResponseCallback
 * @param {object} graph - represents the graph returned. The actual type depends on the provided rdf library.
 * @param {XMLDocument|object|String} rawResponseData - represents the raw data utilized to create the graph.
 * @param {jqXHR} jqXHR - represents the jQuery XMLHTTPRequest object.
 *
 */

/**
 * Represents the type of the function that is responsible to handle xml response documents
 *
 * @callback XMLResponseCallback
 * @param {XMLDocument} responseXMLDocument - represents the XML response document.
 *
 */

/**
 * Represents the type of the function that is responsible to handle json response object
 *
 * @callback JSONResponseCallback
 * @param {object} responseJSONObject - represents the JSON Object response.
 *
 */

/**
 * Represents the type of the function that is responsible to handle string responses
 *
 * @callback StringResponseCallback
 * @param {string} responseString - represents the String response
 *
 */
/**
 * Represents the type of the function that is responsible to handle errors
 *
 * @callback ErrorCallback
 * @param {jqXHR} jqXHR - represents the jQuery XMLHTTPRequest object.
 * @param {string} textStatus - represents the text status of the current jqXHR response.
 * @param {string} errorThrown - represents the error thrown by the current request.
 *
 */

(function(exports, $, undefined) {

  "use strict";
  /**
   * Creates a new OslcQuery object
   * @constructor
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @class
   * @param {!OslcClient} oslcClient - the OslcClient associated with this Query object.
   * @param {!string} capabilityURI - represents the query capability URI @see {@link  http://open-services.net/bin/view/Main/OslcCoreSpecification#Query_Capabilities| OslcCoreSpecification#Query_Capabilities}
   * @param {string} [mediaType="application/rdf+xml"] - represents the media type returned by the query
   * @param {number} [pageSize=0] - represents the query page size. If pageSize==0 all the results will be returned, otherwise it will be necessary to use the nextPage method.
   * @param {string} [select]- represents the select clause of the query
   * @param {string} [where]- represents the where clause of the query
   * @param {string} [orderBy] - represents the orderBy clause of the query
   * @param {string} [searchTerms] - represents the terms used in the full text search
   * @param {string} [prefix]- represents the definitions of the prefix used in the clausules of the query
   * @memberof oslc
   */
  function OslcQuery(oslcClient, capabilityURI, mediaType, pageSize, select, where, orderBy, searchTerms, prefix) {
    this._oslcClient = oslcClient;
    this._capabilityURI = capabilityURI;
    this._mediaType = mediaType;

    if (this._mediaType === null) {
      this._mediaType = constants.APPLICATION_RDF_XML_MIME_TYPE;
    }

    if (pageSize === null) {
      this._pageSize = 0;
    } else {
      this._pageSize = pageSize;
    }

    this._where = where;
    this._select = select;
    this._orderBy = orderBy;
    this._searchTerms = searchTerms;
    this._prefix = prefix;
    this._queryResourceUrl = this._createQueryResourceUrl();
    this._queryResourceGraph = null;

  }

  /**
   * Returns the current capabilityURI
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcQuery.prototype._getCapabilityURI = function() {
    return this._capabilityURI;
  };

  /**
   * Returns the current pageSize used in pagination @see {@link _getPagination}
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._getPageSize = function() {
    return this._pageSize;
  };
  /**
   * Returns the current pagination params
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._getPaginationParams = function() {

    if (this._getPageSize() > 0) {
      var jsonData = {};
      jsonData["oslc.paging"] = true;
      jsonData["oslc.pageSize"] = this._getPageSize();
      var queryParams = $.param(jsonData);

      return queryParams;

    }
    return null;
  };

  /**
   * Returns the current oslc query params
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._getOslcQueryParams = function() {
    var jsonData = {};

    if (this._where !== null && this._where.length > 0) {
      jsonData["oslc.where"] = this._where;

    }

    if (this._select !== null && this._select.length > 0) {

      jsonData["oslc.select"] = this._select;

    }

    if (this._orderBy !== null && this._orderBy.length > 0) {
      jsonData["oslc.orderBy"] = this._orderBy;

    }
    if (this._searchTerms !== null && this._searchTerms.length > 0) {
      jsonData["oslc.searchTerms"] = this._searchTerms;

    }
    if (this._prefix !== null && this._prefix.length > 0) {
      jsonData["oslc.prefix"] = this._prefix;

    }

    if ($.isEmptyObject(jsonData) === false) {

      var queryParams = $.param(jsonData);

      return queryParams;
    }

    return null;



  };

  /**
   * Create the query resource Url
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._createQueryResourceUrl = function() {

    var resourceUrl = this._getCapabilityURI();

    var paginationParams = this._getPaginationParams();

    var oslcQueryParams = this._getOslcQueryParams();

    var beforePaginationParams = "?";
    var beforeQueryParams = "&";

    if (paginationParams === null) {
      beforeQueryParams = "?";

    }

    if (paginationParams !== null) {
      resourceUrl += beforePaginationParams + paginationParams;

    }

    if (oslcQueryParams !== null) {
      resourceUrl += beforeQueryParams + oslcQueryParams;

    }

    return resourceUrl;
  };

  /**
   * Executes the query using the OslcClient instance
   * @private
   * @author Fernando Silva <fernd.ffs@gmail.com>
   */
  OslcQuery.prototype._getResponse = function(callback, onError) {
    var _self = this;

    function internalCallback(graph, rawResponseData, jqXHR) {
      _self._queryResourceGraph = graph;
      callback(graph, rawResponseData, jqXHR);

    }

    this._oslcClient.getResource(this._queryResourceUrl, this._mediaType, false, internalCallback, onError);
  };



  /**
   * Retrives the next page of the current query results
   * @param {GraphResponseCallback} graphResponseCallback - The callback that handles the query response graph.
   * @param {ErrorCallback} errorCallback - The callback that handles query errors.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @function
   */
  OslcQuery.prototype.nextPage = function(graphResponseCallback, errorCallback) {
    var _self = this;
    if (_self._queryResourceGraph !== null) {


      var queryResourceUrl = rdfLib.match(null, rdfLib.resolveQName("rdf:type"), rdfLib.resolveQName("oslc:ResponseInfo"), _self._queryResourceGraph).map(function(responseInfoStm) {
        return rdfLib.match(responseInfoStm.subject, rdfLib.resolveQName("oslc:nextPage"), null, _self._queryResourceGraph).map(function(nextPageStm) {
          return rdfLib.getUriValue(nextPageStm.object);
        });

      }).join("");

      if (!queryResourceUrl) {
        throw "There are no more results.";
      }

      this._queryResourceUrl = queryResourceUrl;
    }
    this._getResponse(graphResponseCallback, errorCallback);

  };


  exports.OslcQuery = OslcQuery;

})(this, jQuery);

(function(exports, $, undefined) {

  "use strict";

  /**
   * Creates a new OslcClient object
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @constructor
   * @class
   * @param {string} [version="2.0"] - represents oslc version used in client operations
   * @memberof oslc
   */
  function OslcClient(version) {

    if (version === null) {
      this._oslcVersion = "2.0";
    } else {
      this._oslcVersion = version;
    }
  }

  /**
   * Generates the listener function responsible to execute the handle function with the results of the execution of the iframe.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._generateListenerFunction = function(handleFunction, listenerProxy, iframe, dialog) {
    var _self = this;
    return function(e) {
      var HEADER = "oslc-response:";
      if (e.source == $(iframe)[0].contentWindow && e.data.indexOf(HEADER) === 0) {
        window.removeEventListener('message', listenerProxy, false);
        _self._destroyDialog(dialog);
        _self._handleMessage(e.data.substr(HEADER.length), handleFunction);
      }
    };
  };



  /**
   * Display the dialog
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._displayDialog = function(dialog, title) {
    dialog.dialog("option", "title", title).dialog("open");
  };


  /**
   * Destroy the dialog
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._destroyDialog = function(dialog) {
    dialog.dialog("close");
  };

  /**
   * Function responsible to process the received message and to call the handle function with the processed data.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._handleMessage = function(message, handleFunction) {

    var json = message.substring(message.indexOf("{"), message.length);

    var results = JSON.parse(json);

    if (results["oslc:results"].length > 0) {
      handleFunction(results["oslc:results"]);
    }
  };

  /**
   * Function responsible to find a specified service and then execute the given callback function.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._handleServiceResourcesCommon = function(graph, oslcDomain, serviceResourceTypeToHandle, mustTestResourceShape, oslcResourceType, callback) {

    var firstResource = null;
    var mainResource = null;

    var defaultResource = null;

    var serviceProviders = rdfLib.match(null, rdfLib.resolveQName("rdf:type"), rdfLib.resolveQName("oslc:ServiceProvider"), graph);

    serviceProviders.forEach(function(spStatement) {
      var services = rdfLib.match(spStatement.subject, rdfLib.resolveQName("oslc:service"), null, graph);
      services.map(function(serviceStatement) {
        var associatedDomains = rdfLib.match(serviceStatement.object, rdfLib.resolveQName("oslc:domain"), null, graph);
        associatedDomains.forEach(function(domainStatement) {
          if (rdfLib.getUriValue(domainStatement.object) === oslcDomain) {
            var resourcesStatement = rdfLib.match(serviceStatement.object, serviceResourceTypeToHandle, null, graph);

            resourcesStatement.forEach(function(resource) {
              //test to exclude draft workitems creation service when using Rational Team Concert
              var resourceShapes = rdfLib.match(resource.object, rdfLib.resolveQName("oslc:resourceShape"), null, graph);

              if (!(mustTestResourceShape && resourceShapes.length === 0)) {

                if (firstResource === null) {
                  firstResource = resource.object;
                }
                var resourceTypes = rdfLib.match(resource.object, rdfLib.resolveQName("oslc:resourceType"), oslcResourceType, graph);

                if (resourceTypes.length > 0) {
                  mainResource = resource.object;
                }

                var usages = rdfLib.match(resource.object, rdfLib.resolveQName("oslc:usage"), rdfLib.resolveQName("oslc:default"), graph);

                if (usages.length > 0) {
                  defaultResource = resource.object;
                }
              }

            });

          }

        });
      });
    });

    if (mainResource !== null) {
      callback(mainResource, graph);
    } else if (defaultResource !== null) {
      callback(defaultResource, graph);
    } else if (firstResource !== null) {
      var size = rdfLib.match(firstResource, rdfLib.resolveQName("oslc:resourceType"), null, graph).length;

      if (size === 0) {
        callback(firstResource, graph);
      }

    }

  };
  /**
   * Function responsible to setup the dialog used to render the iframe.
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @private
   */
  OslcClient.prototype._dialogCommonHandle = function(callback, errorCallback, draftResource, draftResourceMediaType) {
    var _self = this;

    function prepareDialog(dialogUrl, width, height, title) {

      var iframe = $('<iframe id="oslc_dialog" name="oslc_dialog" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>');

      dialogUrl += '#oslc-core-postMessage-1.0';

      var dialog = $("<div id='dialog'></div>").append(iframe).appendTo("body").dialog({
        autoOpen: false,
        modal: true,
        resizable: false,
        width: width,
        height: height,
        bgiframe: true,
        open: function() {
          $('.ui-widget-overlay').bind('click', function() {
            $("#dialog").dialog("close");
            $("#dialog").dialog('destroy').remove();
          });
        },
        close: function() {
          iframe.attr("src", "");
          $("#dialog").dialog('destroy').remove();
        }
      });

      var src = dialogUrl;


      iframe.attr({
        width: +width,
        height: +height,
        src: src
      });

      var listenerProxy = $.proxy(_self._generateListenerFunction(callback, listenerProxy, iframe, dialog), window);

      window.addEventListener('message', listenerProxy, false);

      _self._displayDialog(dialog, title);

    }
    return function(dialogResource, graph) {



      var dialogUrl = rdfLib.match(dialogResource, rdfLib.resolveQName("oslc:dialog"), null, graph).map(function(triple) {
        return rdfLib.getUriValue(triple.object);
      }).join("");
      var width = rdfLib.match(dialogResource, rdfLib.resolveQName("oslc:hintWidth"), null, graph).map(function(triple) {
        return triple.object.toString();
      }).join("");
      var height = rdfLib.match(dialogResource, rdfLib.resolveQName("oslc:hintHeight"), null, graph).map(function(triple) {
        return triple.object.toString();
      }).join("");


      width = width.replace("px", "");
      height = height.replace("px", "");

      var title = rdfLib.match(dialogResource, rdfLib.resolveQName("dcterms:title"), null, graph).map(function(triple) {
        return triple.object.toString();
      }).join("");

      if (typeof draftResource != 'undefined' && draftResource !== null) {
        if (draftResourceMediaType === null) {
          draftResourceMediaType = constants.APPLICATION_RDF_XML_MIME_TYPE;
        }
        _self.createResource(dialogUrl, draftResource, draftResourceMediaType, "*/*", function(graph, rawData, jqXHR) {
          var draftLocation = jqXHR.getResponseHeader("Location");
          prepareDialog(draftLocation, width, height, title);
        }, errorCallback);
      } else {
        prepareDialog(dialogUrl, width, height, title);
      }



    };

  };

  /**
   * Gets a resource
   * @param {!string} - represents the url of the resource
   * @param {string} [mediaType="application/rdf+xml"] - represents the type of the returned resource
   * @param {boolean} [mustUseOslcVersionHeader=true] - this flag is necessary to correctly handle the execution of queries in a CORS environment using IBM Rational Team Concert as OSLC Provider. When a custom header is present in a CORS request (in this case OSLC-Core-Version), a preflight request is sent and RTC responds with 302 which is not allowed by the especification @see {@link http://www.w3.org/TR/cors/#resource-preflight-requests| Preflight Request}
   * @param {!GraphResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @function
   */
  OslcClient.prototype.getResource = function(url, mediaType, mustUseOslcVersionHeader, callback, errorCallback) {
    var _self = this;

    if (mediaType === null) {
      mediaType = constants.APPLICATION_RDF_XML_MIME_TYPE;
    }


    $.ajax({
      url: url,
      type: "GET",
      async: true,
      cache: false,
      accepts: mediaType,
      beforeSend: function(xhr) {
        xhr._url = this.url;
        xhr.setRequestHeader('Accept', mediaType);
        if (mustUseOslcVersionHeader === null || mustUseOslcVersionHeader === true) {
          xhr.setRequestHeader('OSLC-Core-Version', _self._oslcVersion);
        }
      },
      xhrFields: {
        withCredentials: true
      },
      success: function(data, textStatus, jqXHR) {
        rdfLib.parse(mediaType, jqXHR.responseText, jqXHR._url).then(function(graph) {
          callback(graph, data, jqXHR);
        }, function(err) {
          errorCallback(jqXHR, null, err);
        });
      },
      error: function(jqXHR, textStatus, errorThrown) {
        errorCallback(jqXHR, textStatus, errorThrown);
      }
    });
  };



  /**
   * Creates a resource
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the url to POST the resource
   * @param {!(XMLDocument|string|object)} - represents the data of the resource
   * @param {string} [mediaType="application/rdf+xml"] - represents the data type of the submitted resource
   * @param {string} [acceptType="application/rdf+xml"] - represents the data type of the returned resource
   * @param {!GraphResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.createResource = function(url, resource, mediaType, acceptType, callback, errorCallback) {
    var _self = this;
    if (mediaType === null) {
      mediaType = constants.APPLICATION_RDF_XML_MIME_TYPE;
    }

    if (acceptType === null) {
      acceptType = constants.APPLICATION_RDF_XML_MIME_TYPE;
    }

    $.ajax({
      url: url,
      type: 'POST',
      async: true,
      accepts: acceptType,
      data: resource,
      cache: true,
      beforeSend: function(xhr) {
        xhr._url = this.url;
        xhr.setRequestHeader('Accept', acceptType);
        xhr.setRequestHeader('Content-Type', mediaType);
        xhr.setRequestHeader('OSLC-Core-Version', _self._oslcVersion);
        //necessary to create resources with IBM RTC.
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      },
      xhrFields: {
        withCredentials: true
      },
      success: function(data, textStatus, jqXHR) {
        if (jqXHR.getResponseHeader("Content-Length") === "0") {
          callback(null, null, jqXHR);
        } else {

          rdfLib.parse(acceptType, jqXHR.responseText, jqXHR._url).then(function(graph) {
            callback(graph, data, jqXHR);
          }, function(err) {
            errorCallback(jqXHR, null, err);
          });
        }
      },

      error: function(jqXHR, textStatus, errorThrown) {
        errorCallback(jqXHR, textStatus, errorThrown);
      }
    });


  };

  /**
   * Updates a resource
   * @param {!string} - represents the url of the resource to update
   * @param {!(XMLDocument|string|object)} - represents the data of the resource
   * @param {string} [mediaType="application/rdf+xml"] - represents the data type of the submitted resource update
   * @param {string} [acceptType="application/rdf+xml"] - represents the data type of the returned resource update
   * @param {ifMatch} - represents the ifMatch header
   * @param {!GraphResponseCallback} callback - represents the callback function.
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @function
   */
  OslcClient.prototype.updateResource = function(url, resource, mediaType, acceptType, ifMatch, callback, errorCallback) {
    var _self = this;
    if (mediaType === null) {
      mediaType = constants.APPLICATION_RDF_XML_MIME_TYPE;
    }

    if (acceptType === null) {
      acceptType = constants.APPLICATION_RDF_XML_MIME_TYPE;
    }

    $.ajax({
      url: url,
      type: 'PUT',
      async: true,
      accepts: acceptType,
      data: resource,
      cache: false,
      beforeSend: function(xhr) {
        xhr._url = this.url;
        if (ifMatch !== null) {
          xhr.setRequestHeader('If-Match', ifMatch);
        }

        xhr.setRequestHeader('Accept', acceptType);
        xhr.setRequestHeader('Content-Type', mediaType);
        xhr.setRequestHeader('OSLC-Core-Version', _self._oslcVersion);
      },
      xhrFields: {
        withCredentials: true
      },
      success: function(data, textStatus, jqXHR) {
        if (jqXHR.getResponseHeader("Content-Length") === "0") {
          callback(null, null, jqXHR);
        } else {
          rdfLib.parse(acceptType, jqXHR.responseText, jqXHR._url).then(function(graph) {
            callback(graph, data, jqXHR);
          }, function(err) {
            errorCallback(jqXHR, null, err);
          });
        }
      },

      error: function(jqXHR, textStatus, errorThrown) {
        errorCallback(jqXHR, textStatus, errorThrown);
      }
    });


  };
  /**
   * Deletes a resource
   * @param {!string} - represents the url of the resource to delete
   * @param {!GraphResponseCallback} callback - represents the graph callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @function
   */
  OslcClient.prototype.deleteResource = function(url, callback, errorCallback) {
    var _self = this;

    $.ajax({
      url: url,
      type: 'DELETE',
      async: true,
      cache: false,
      beforeSend: function(xhr) {
        xhr._url = this.url;
        xhr.setRequestHeader('OSLC-Core-Version', _self._oslcVersion);
      },
      xhrFields: {
        withCredentials: true
      },

      success: function(data, textStatus, jqXHR) {
        rdfLib.parse(acceptType, jqXHR.responseText, jqXHR._url).then(function(graph) {
          callback(graph, data, jqXHR);
        }, function(err) {
          errorCallback(jqXHR, null, err);
        });
      },

      error: function(jqXHR, textStatus, errorThrown) {
        errorCallback(jqXHR, textStatus, errorThrown);
      }
    });


  };

  /**
   * Lookup Service Provider Url by its title
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the catalogUrl to search the service provider url
   * @param {!string} - represents the service provider title to search for
   * @param {!StringResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupServiceProviderUrl = function(catalogUrl, serviceProviderTitle, callback, errorCallback) {

    function internalCallBack(graph, rawResponseData, jqXHR) {
      var serviceProviderCatalogs = rdfLib.match(null, rdfLib.resolveQName("rdf:type"), rdfLib.resolveQName("oslc:ServiceProviderCatalog"), graph);

      var serviceProviderCatalogUrl = serviceProviderCatalogs.map(function(spcStatement) {
        var serviceProvidersStatements = rdfLib.match(spcStatement.subject, rdfLib.resolveQName("oslc:serviceProvider"), null, graph);
        return serviceProvidersStatements.map(function(spStatement) {
          var titlesStatements = rdfLib.match(spStatement.object, rdfLib.resolveQName("dcterms:title"), null, graph);
          return titlesStatements.map(function(titleStatement) {
            if (titleStatement.object.toString() === serviceProviderTitle) {
              return rdfLib.getUriValue(titleStatement.subject, graph);
            }
          });
        }).join("");
      });

      callback(serviceProviderCatalogUrl);
    }

    this.getResource(catalogUrl, constants.APPLICATION_RDF_XML_MIME_TYPE, true, internalCallBack, errorCallback);



  };

  /**
   * Lookup Creation Dialog Resource
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the dialog
   * @param {!XMLResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupCreationDialogResource = function(serviceProviderUrl, oslcDomain, oslcResourceType, callback, errorCallback) {
    var _self = this;

    function internalCallBack(graph, rawResponseData, jqXHR) {

      _self._handleServiceResourcesCommon(graph, oslcDomain, rdfLib.resolveQName("oslc:creationDialog"), false, oslcResourceType, callback);
    }
    this.getResource(serviceProviderUrl, constants.APPLICATION_RDF_XML_MIME_TYPE, true, internalCallBack, errorCallback);

  };


  /**
   * Lookup Selection Dialog Resource
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the dialog
   * @param {!XMLResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupSelectionDialogResource = function(serviceProviderUrl, oslcDomain, oslcResourceType, callback, errorCallback) {
    var _self = this;

    function internalCallBack(graph, rawResponseData, jqXHR) {
      _self._handleServiceResourcesCommon(graph, oslcDomain, rdfLib.resolveQName("oslc:selectionDialog"), false, oslcResourceType, callback);
    }
    this.getResource(serviceProviderUrl, constants.APPLICATION_RDF_XML_MIME_TYPE, true, internalCallBack, errorCallback);

  };

  /**
   * Lookup Query Capability URI
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the query capability URI
   * @param {!StringResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupQueryCapabilityURI = function(serviceProviderUrl, oslcDomain, oslcResourceType, callback, errorCallback) {
    var _self = this;

    function internalCallBack(graph, rawResponseData, jqXHR) {
      _self._handleServiceResourcesCommon(graph, oslcDomain, rdfLib.resolveQName("oslc:queryCapability"), true, oslcResourceType, callback);
    }
    this.getResource(serviceProviderUrl, constants.APPLICATION_RDF_XML_MIME_TYPE, true, internalCallBack, errorCallback);

  };

  /**
   * Lookup Creation Factory Resource
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the creation factory
   * @param {string} [oslcUsage] - represents the oslc usage associated with the creation factory
   * @param {!XMLResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupCreationFactoryResource = function(serviceProviderUrl, oslcDomain, oslcResourceType, oslcUsage, callback, errorCallback) {
    var _self = this;

    function internalCallBack(graph, rawResponseData, jqXHR) {
      _self._handleServiceResourcesCommon(graph, oslcDomain, rdfLib.resolveQName("oslc:creationFactory"), true, oslcResourceType, callback);
    }
    this.getResource(serviceProviderUrl, constants.APPLICATION_RDF_XML_MIME_TYPE, true, internalCallBack, errorCallback);

  };


  /**
   * Lookup Creation Factory Resource URI
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the creation factory
   * @param {string} [oslcUsage] - represents the oslc usage associated with the creation factory
   * @param {!StringResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.lookupCreationFactoryURI = function(serviceProviderUrl, oslcDomain, oslcResourceType, oslcUsage, callback, errorCallback) {
    var _self = this;

    function internalCallBack(creationFactoryResource, graph) {
      if (creationFactoryResource !== null && graph !== "undefined") {

        var url = rdfLib.match(creationFactoryResource, rdfLib.resolveQName("oslc:creation"), null, graph).map(function(creationStm) {
          return rdfLib.getUriValue(creationStm.object);
        }).join("");

        callback(url);
      }
    }
    this.lookupCreationFactoryResource(serviceProviderUrl, oslcDomain, oslcResourceType, oslcUsage, internalCallBack, errorCallback);

  };


  /**
   * Open the Selection Dialog
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the selection dialog
   * @param {!JSONResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.openSelectionDialog = function(serviceProviderUrl, oslcDomain, oslcResourceType, callback, onError) {
    this.lookupSelectionDialogResource(serviceProviderUrl, oslcDomain, oslcResourceType, this._dialogCommonHandle(callback, onError, null), onError);
  };

  /**
   * Open the Creation Dialog
   * @author Fernando Silva <fernd.ffs@gmail.com>
   * @param {!string} - represents the service provider url
   * @param {!string} - represents the oslc domain
   * @param {string} [oslcResourceType] - represents the oslc resource type associated with the selection dialog
   * @param {XMLDocument} [draftResource] - represents the draft resource used to populate the dialog
   * @param {string} [draftResourceMediaType ="application/rdf+xml"] - represents the data type of the submitted draft resource
   * @param {!JSONResponseCallback} callback - represents the callback function
   * @param {!ErrorCallback} errorCallback - represents the callback error function
   * @function
   */
  OslcClient.prototype.openCreationDialog = function(serviceProviderUrl, oslcDomain, oslcResourceType, draftResource, draftResourceMediaType, callback, onError) {
    this.lookupCreationDialogResource(serviceProviderUrl, oslcDomain, oslcResourceType, this._dialogCommonHandle(callback, onError, draftResource, draftResourceMediaType), onError);
  };

  exports.OslcClient = OslcClient;
})(this, jQuery);

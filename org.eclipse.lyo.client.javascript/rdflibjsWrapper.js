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
 *     Fernando Silva - initial implementation
 *******************************************************************************/


(function(exports, $, undefined) {

  "use strict";

  if (exports.$rdf) {

    (function() {
      var namespacesMap = {};

      this.addPrefix = function(prefix, namespace) {
        var resolvedNamespace = exports.$rdf.Namespace(namespace);
        namespacesMap[prefix] = resolvedNamespace;
      };

      this.resolveQName = function(QName) {
        var splitResult = QName.split(":", 2);

        if (splitResult.length != 2) {
          throw "Invalid QName:" + QName;
        }
        var prefix = splitResult[0];
        var localPart = splitResult[1];
        if (prefix in namespacesMap) {
          return namespacesMap[prefix](localPart);
        } else {
          throw "QName:" + QName + " not found.";
        }
      };

      this.match = function(s, p, o, resourceGraph) {

        return resourceGraph.statementsMatching(s, p, o, null);
      };

      this.getUriValue = function(resource, graph) {
        return resource.uri;
      };

      this.parse = function(mediaType, rawData, baseUri) {
        var promise = new Promise(function(resolve, reject) {
          var rdfLibGraph = new exports.$rdf.IndexedFormula();
          exports.$rdf.parse(rawData, rdfLibGraph, baseUri, mediaType);
          resolve(rdfLibGraph);
        });
        return promise;
      };

      this.serialize = function(graph, baseUri, contentType) {
        var promise = new Promise(function(resolve, reject) {

          exports.$rdf.serialize(undefined, graph, baseUri, contentType, function(err, result) {

            if (err) {
              reject(err);
            } else
              resolve(result);
          });

        });
        return promise;
      };

    }).apply(exports.rdfLib);

    //adding common prefixes
    exports.rdfLib.addPrefix("oslc", exports.constants.OSLC_CORE);
    exports.rdfLib.addPrefix("dcterms", exports.constants.DC_TERMS);
    exports.rdfLib.addPrefix("rdf", exports.constants.RDF);

  }

})(this);

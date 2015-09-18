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

(function(exports, undefined) {

  "use strict";


  if (exports.rdf) {

    (function() {
      var rdfProfile = rdf.createProfile(false);
      var _self = this;
      this.addPrefix = function(prefix, namespace) {
        rdfProfile.setPrefix(prefix, namespace);

      };
      this.resolveQName = function(QName) {
        return rdfProfile.resolve(QName);
      };

      this.parse = function(mediaType, rawData, baseUri) {
        return exports.rdf.utils.parse(mediaType, rawData);
      };

      rdfLib.match = function(s, p, o, resourceGraph) {
        return resourceGraph.match(s, p, o).toArray();
      };

      this.getUriValue = function(resource, graph) {
        return resource.toString();
      };
      this.serialize = function(graph, baseUri, contentType) {
        //workaround due to lack of an RDF/XML serializer for rdf-ext
        if (exports.$rdf && contentType === exports.constants.APPLICATION_RDF_XML_MIME_TYPE) {
          return _self.serialize(graph, baseUri, "text/n3").then(function(result) {
            var rdfLibGraph = new exports.$rdf.IndexedFormula();
            exports.$rdf.parse(result, rdfLibGraph, baseUri, "text/n3");

            var promise = new Promise(function(resolve, reject) {

              exports.$rdf.serialize(undefined, rdfLibGraph, baseUri, contentType, function(err, result) {

                if (err) {
                  reject(err);
                } else
                  resolve(result);
              });

            });
            return promise;

          }, function(err) {
            throw err;
          });
        } else {
          return exports.rdf.utils.serialize(contentType, graph);
        }
      };


    }).apply(exports.rdfLib);

    //adding common prefixes
    exports.rdfLib.addPrefix("oslc", exports.constants.OSLC_CORE);
    exports.rdfLib.addPrefix("dcterms", exports.constants.DC_TERMS);
    exports.rdfLib.addPrefix("rdf", exports.constants.RDF);

  }
})(this);

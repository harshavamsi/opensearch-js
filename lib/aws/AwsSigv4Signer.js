/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

'use strict';
const aws4 = require('aws4');
const Transport = require('../Transport');
const Connection = require('../Connection');
const AwsSigv4SignerError = require('./errors');

function AwsSigv4Signer(awsConfig) {
  if (
    (!awsConfig.region || awsConfig.region === null || awsConfig.region === '') &&
    typeof awsConfig.getCredentials !== 'function'
  ) {
    throw new AwsSigv4SignerError('Region cannot be empty');
  }
  if (
    (!awsConfig.credentials || awsConfig.credentials === null || awsConfig.credentials === '') &&
    typeof awsConfig.getCredentials !== 'function'
  ) {
    throw new AwsSigv4SignerError('Credentials cannot be empty');
  }

  function buildSignedRequestObject(request = {}) {
    request.service = 'es';
    request.region = awsConfig.region;
    request.headers = request.headers || {};
    request.headers['host'] = request.hostname;
    return aws4.sign(request, awsConfig.credentials);
  }
  class AwsSigv4SignerConnection extends Connection {
    buildRequestObject(params) {
      const request = super.buildRequestObject(params);
      return buildSignedRequestObject(request);
    }
  }

  function awaitAwsCredentials(awsConfig) {
    return new Promise((resolve, reject) => {
      awsConfig.getCredentials((err) => {
        err ? reject(err) : resolve();
      });
    });
  }

  class AwsSigv4SignerTransport extends Transport {
    request(params, options = {}, callback = undefined) {
      // options is optional,
      // so if it is omitted, options will be the callback
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }

      // Check if getCredentials exists,
      // if so this is an aws-sdk v2 global config object
      if (typeof awsConfig.getCredentials !== 'function') {
        if (typeof callback === 'undefined') {
          return super.request(params, options);
        } else {
          super.request(params, options, callback);
        }
      } else {
        // Promise support
        if (typeof callback === 'undefined') {
          return awaitAwsCredentials(awsConfig).then(() => super.request(params, options));
        }

        // Callback support
        awaitAwsCredentials(awsConfig)
          .then(() => super.request(params, options, callback))
          .catch(callback);
      }
    }
  }
  return {
    Connection: AwsSigv4SignerConnection,
    Transport: AwsSigv4SignerTransport,
    buildSignedRequestObject,
  };
}
module.exports = AwsSigv4Signer;

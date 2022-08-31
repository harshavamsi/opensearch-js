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
const { test } = require('tap');
const { URL } = require('url');
const { v4: uuidv4 } = require('uuid');
const AwsSigv4Signer = require('../../lib/aws/AwsSigv4Signer');
const AwsSigv4SignerError = require('../../lib/aws/errors');
const { Connection } = require('../../index');

test('Sign with SigV4', (t) => {
  t.plan(2);

  const mockCreds = {
    accessKeyId: uuidv4(),
    secretAccessKey: uuidv4(),
  };

  const mockRegion = 'us-west-2';

  const AwsSigv4SignerOptions = {
    getCredentials: (cb) => cb(null, mockCreds),
    credentials: mockCreds,
    region: mockRegion,
  };

  const auth = AwsSigv4Signer(AwsSigv4SignerOptions);

  const connection = new Connection({
    url: new URL('https://localhost:9200'),
  });

  const request = connection.buildRequestObject({
    path: '/hello',
    method: 'GET',
    headers: {
      'X-Custom-Test': true,
    },
  });
  const signedRequest = auth.buildSignedRequestObject(request);
  t.hasProp(signedRequest.headers, 'X-Amz-Date');
  t.hasProp(signedRequest.headers, 'Authorization');
});

test('Sign with SigV4 failure (with empty region)', (t) => {
  t.plan(2);

  const mockCreds = {
    accessKeyId: uuidv4(),
    secretAccessKey: uuidv4(),
  };

  const AwsSigv4SignerOptions = {
    credentials: mockCreds,
  };

  try {
    AwsSigv4Signer(AwsSigv4SignerOptions);
    t.fail('Should fail');
  } catch (err) {
    t.ok(err instanceof AwsSigv4SignerError);
    t.equal(err.message, 'Region cannot be empty');
  }
});

test('Sign with SigV4 success (with empty region and getCredentials function)', (t) => {
  t.plan(2);

  const mockCreds = {
    accessKeyId: uuidv4(),
    secretAccessKey: uuidv4(),
  };

  const AwsSigv4SignerOptions = {
    getCredentials: (cb) => cb(null, mockCreds),
    credentials: mockCreds,
  };

  try {
    AwsSigv4Signer(AwsSigv4SignerOptions);
    t.fail('Should fail');
  } catch (err) {
    t.ok(err instanceof AwsSigv4SignerError);
    t.equal(err.message, 'Region cannot be empty');
  }
});

test('Sign with SigV4 failure (with empty credentials)', (t) => {
  t.plan(2);

  const mockRegion = 'us-west-2';

  const AwsSigv4SignerOptions = {
    region: mockRegion,
  };

  try {
    AwsSigv4Signer(AwsSigv4SignerOptions);
    t.fail('Should fail');
  } catch (err) {
    t.ok(err instanceof AwsSigv4SignerError);
    t.equal(err.message, 'Credentials cannot be empty');
  }
});

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

/// <reference types="node" />

import { Credentials } from '@aws-sdk/types';
import Connection from '../Connection';
import * as http from 'http';
import { OpenSearchClientError } from '../errors';

interface AwsSigv4SignerOptions {
  getCredentials: () => Promise<Credentials>;
  region: string;
  refresh?: boolean;
  refreshInterval?: number;
}

interface AwsSigv4SignerResponse {
  Connection: Connection;
  buildSignedRequestObject(request: any): http.ClientRequestArgs;
}

type AwsSigv4Signer = (opts: AwsSigv4SignerOptions) => Promise<AwsSigv4SignerResponse>;

declare class AwsSigv4SignerError extends OpenSearchClientError {
  name: string;
  message: string;
  data: any;
  constructor(message: string, data: any);
}

export { AwsSigv4Signer, AwsSigv4SignerOptions, AwsSigv4SignerResponse, AwsSigv4SignerError };

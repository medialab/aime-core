/**
 * AIME-admin API Client
 * ======================
 *
 * A simple djax-client providing access to the AIME-core API.
 */
import Client from 'djax-client';
import config from '../config.json';

export default new Client({
  settings: {
    baseUrl: config.api
  }
});

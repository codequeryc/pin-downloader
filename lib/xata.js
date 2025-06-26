import { XataClient } from '@xata.io/client';

export const getXataClient = () =>
  new XataClient({
    apiKey: process.env.XATA_API_KEY,
    databaseURL: process.env.XATA_DATABASE_URL,
  });

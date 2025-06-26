import { XataClient } from '@xata.io/client';

const client = new XataClient({
  databaseURL: 'https://zopi-oc0ua0.us-east-1.xata.sh/db/Oth2',
  apiKey: 'xau_JISricmMFUOmZu1TJNIrafAsV8RRnBVE0'
});

export const getXataClient = () => client;

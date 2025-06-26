const { XataClient } = require('@xata.io/client');

const getXataClient = () => new XataClient({
  apiKey: process.env.XATA_API_KEY,
  databaseURL: process.env.XATA_DATABASE_URL
});

module.exports = { getXataClient };

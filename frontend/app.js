const express = require('express');
const promClient = require('prom-client');

const app = express();
const port = 3000;

// Enable default metrics (e.g., CPU, memory, etc.)
promClient.collectDefaultMetrics();

// Expose metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Start the server
app.listen(port, () => {
  console.log(`App listening on http://localhost:${port}`);
});

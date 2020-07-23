const open = require('opn');

const { join } = require('path');

const express = require('express');

const app = express();

const host = 'localhost';
const port = 8888;

// serve static assets
app.use(express.static(join(__dirname, 'public')));

app.get('*', (request, response) =>
{
  response.sendFile(join(__dirname, 'public/index.html'));
});

app.listen(port, host, () =>
{
  console.log(`Might UI is running on http://${host}:${port}`);
  console.log('Opening it using default browser...');

  // opens the url in the default browser
  open(`http://${host}:${port}`);
});
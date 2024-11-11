
const express = require('express');
const corelink = require('corelink-client');  // Assuming corelink-client is available
const cors = require('cors');  // Importing CORS middleware

const app = express();
const PORT = 3000;

const config = {
  ControlPort: 20012,
  ControlIP: 'corelink.hpc.nyu.edu',
  autoReconnect: false,
};

const username = 'Testuser';
const password = 'Testpassword';

const workspace = 'Holodeck';
const protocol = 'tcp';
const datatype = 'distance';

corelink.debug = true;

let sender = null;
let iter = 0;

// Generate random data to send to the stream
const randomdata = () => {
  iter++;
  return iter.toString();
};

// Function to connect to Corelink and create the stream
const run = async () => {
  if (await corelink.connect({ username, password }, config).catch((err) => { console.log(err); })) {
    sender = await corelink.createSender({
      workspace,
      protocol,
      type: datatype,
      metadata: { name: 'Random Data' },
    }).catch((err) => { console.log(err); });
    
    if (sender) {
      console.log('Stream Created:', sender);  // Log the sender details
    } else {
      console.log('Failed to create stream.');
    }

    // Send random data to the stream every second
    setInterval(() => {
      if (sender) {
        corelink.send(sender, Buffer.from(randomdata()));
      }
    }, 1000);
  }
};

// Use CORS middleware to allow requests from any origin
app.use(cors());
app.use(express.json());  // To parse JSON body

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Endpoint to start the stream
app.get('/startStream', async (req, res) => {
  if (!sender) {
    await run(); // Start the stream if it is not already running
    res.send('Stream started');
  } else {
    res.send('Stream already running');
  }
});

// Endpoint to list streams (this will simulate the response)
app.get('/listStreams', async (req, res) => {
  const streams = [
    { id: 1, name: 'Random Data Stream 1' },
    { id: 2, name: 'Random Data Stream 2' },
  ];  // Example stream data

  res.json(streams);  // Send the streams as JSON
});

// Endpoint to disconnect a specific stream
app.post('/disconnectStream/:id', async (req, res) => {
  const streamId = req.params.id;
  console.log(`Disconnecting stream with ID: ${streamId}`);

  // Logic to disconnect the stream
  // In your case, you could use Corelink's disconnect function
  if (sender && streamId) {
    // Example of how you could disconnect the stream (modify according to Corelink's API)
    corelink.disconnect({ streamIDs: [streamId] }).then(() => {
      res.send(`Stream ${streamId} disconnected`);
    }).catch(err => {
      res.status(500).send(`Failed to disconnect stream: ${err}`);
    });
  } else {
    res.status(400).send('Invalid stream ID');
  }
});

// Serve the frontend HTML
app.use(express.static('public'));  // This assumes your HTML and JS are in the 'public' folder

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

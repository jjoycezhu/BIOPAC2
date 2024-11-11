const bcrypt = require('bcrypt'); // For password hashing
const session = require('express-session'); // For session management

const express = require('express');
const corelink = require('corelink-client');  // Assuming corelink-client is available
const cors = require('cors');  // Importing CORS middleware

const app = express();

app.use(session({
  secret: 'supersecretkey', // Change to a secure key for production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

const users = [
  { username: 'hsrn_user', password: await bcrypt.hash('nyu_secure_password', 10) }
];

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.user = username;
    return res.status(200).send('Login successful');
  }
  res.status(401).send('Unauthorized');
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).send('Unauthorized');
}



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
app.get('/listStreams', isAuthenticated, async (req, res) => {
  const streams = [
    { id: 1, name: 'Random Data Stream 1' },
    { id: 2, name: 'Random Data Stream 2' },
  ];  // Example stream data

  res.json(streams);  // Send the streams as JSON
});

app.post('/disconnectStream/:id', isAuthenticated, async (req, res) => {
  const streamId = req.params.id;
  console.log(`Disconnecting stream with ID: ${streamId}`);

  // Logic to disconnect the stream
  if (sender && streamId) {
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
app.use(isAuthenticated, express.static('public'));  // This assumes your HTML and JS are in the 'public' folder

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

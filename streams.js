// streams.js (Frontend)

// Function to handle user login
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.status === 200) {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('stream-controls').style.display = 'block';
            displayStreams(); // Load streams after successful login
        } else {
            document.getElementById('login-message').innerText = 'Login failed';
        }
    } catch (error) {
        console.error('Login error:', error);
    }
}

// Function to display the list of active streams
async function displayStreams() {
  try {
    const response = await fetch('http://localhost:3000/listStreams');
    const streams = await response.json();  // Parse the response as JSON

    const streamContainer = document.getElementById("stream-container");
    streamContainer.innerHTML = ""; // Clear previous content

    streams.forEach((stream) => {
      const streamElement = document.createElement("div");
      streamElement.className = "stream-item";
      streamElement.innerHTML = `
        <p>Stream ID: ${stream.id}</p>
        <p>Stream Name: ${stream.name}</p>
        <button onclick="disconnectStream('${stream.id}')">Disconnect</button>
      `;
      streamContainer.appendChild(streamElement);
    });
  } catch (error) {
    console.error("Error fetching stream data:", error);
  }
}

// Function to disconnect a specific stream by ID
async function disconnectStream(streamId) {
  try {
    await fetch(`http://localhost:3000/disconnectStream/${streamId}`, { method: 'POST' });
    alert(`Stream ${streamId} has been disconnected.`);
    displayStreams();  // Refresh the stream list
  } catch (error) {
    console.error(`Error disconnecting stream ${streamId}:`, error);
  }
}

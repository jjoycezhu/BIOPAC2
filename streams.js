// streams.js (Frontend)

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

async function disconnectStream(streamId) {
  try {
    await fetch(`http://localhost:3000/disconnectStream/${streamId}`, { method: 'POST' });
    alert(`Stream ${streamId} has been disconnected.`);
    displayStreams();  // Refresh the stream list
  } catch (error) {
    console.error(`Error disconnecting stream ${streamId}:`, error);
  }
}

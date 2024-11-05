// Function to fetch and display the list of streams
async function displayStreams() {
    try {
        // Fetch streams using Corelink's listStreams function
        const streams = await listStreams({});  // Pass options if needed
        const streamContainer = document.getElementById("stream-container");

        // Clear any previous content in the stream container
        streamContainer.innerHTML = "";

        // Loop through each stream and display it on the page
        streams.forEach((stream) => {
            // Create a new div for each stream's information
            const streamElement = document.createElement("div");
            streamElement.className = "stream-item";
            
            // Add stream information and a disconnect button
            streamElement.innerHTML = `
                <p>Stream ID: ${stream.id}</p>
                <button onclick="disconnectStream('${stream.id}')">Disconnect</button>
            `;
            
            // Append the stream element to the container
            streamContainer.appendChild(streamElement);
        });
    } catch (error) {
        console.error("Error fetching stream data:", error);
    }
}

// Function to disconnect a specific stream
async function disconnectStream(streamId) {
    try {
        // Call Corelink's disconnect function to "kill" the stream
        await disconnect({ streamIDs: [streamId] });  // Pass the stream ID to disconnect
        alert(`Stream ${streamId} has been disconnected.`);
        
        // Refresh the stream list to reflect the changes
        displayStreams();
    } catch (error) {
        console.error(`Error disconnecting stream ${streamId}:`, error);
    }
}



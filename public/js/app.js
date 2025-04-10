// Function to check server status
function checkServerStatus() {
  fetch('/api/status')
    .then(response => response.json())
    .then(data => {
      const statusElement = document.getElementById('status-message');
      if (data.status === 'ok') {
        // Only show that the server is connected, not the mode
        statusElement.textContent = 'Connected to server';
        statusElement.className = 'status-online';
      } else {
        statusElement.textContent = 'Server offline';
        statusElement.className = 'status-offline';
      }
    })
    .catch(error => {
      console.error('Error checking server status:', error);
      const statusElement = document.getElementById('status-message');
      statusElement.textContent = 'Server offline';
      statusElement.className = 'status-offline';
    });
}
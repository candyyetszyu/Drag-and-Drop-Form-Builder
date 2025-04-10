document.addEventListener('DOMContentLoaded', () => {
  const serverStatusElement = document.getElementById('serverStatus');
  const indicator = serverStatusElement.querySelector('.status-indicator');
  const statusText = serverStatusElement.querySelector('.status-text');

  function updateServerStatus() {
    fetch('/api/status')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'ok') {
          indicator.classList.add('online');
          indicator.classList.remove('offline');
          statusText.textContent = 'Server Online';
        } else {
          indicator.classList.add('offline');
          indicator.classList.remove('online');
          statusText.textContent = 'Server Offline';
        }
      })
      .catch(error => {
        console.error('Error fetching server status:', error);
        indicator.classList.add('offline');
        indicator.classList.remove('online');
        statusText.textContent = 'Server Offline';
      });
  }

  updateServerStatus();
  setInterval(updateServerStatus, 5000);
});
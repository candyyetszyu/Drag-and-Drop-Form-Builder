// ...existing code...
function updateServerInfo() {
  const infoElement = document.querySelector('.api-info h3');
  if (infoElement) {
    infoElement.textContent = 'Backend server is running. API endpoints available:';
  }
}
// ...existing code...
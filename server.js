const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Marketing Campaign API',
    description: 'Backend server is running. API endpoints available:' // Updated text
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage
const storage = {
  forms: {},
  submissions: {},
  nextFormId: 1,
  nextSubmissionId: 1
};

// Add sample form
storage.forms['1'] = {
  id: '1',
  title: 'Customer Feedback Survey',
  description: 'Help us improve our products',
  fields: [
    { id: 'name', type: 'text', question: 'Your name?', isRequired: true },
    { id: 'rating', type: 'dropdown', question: 'Rate our service?', isRequired: true, 
      options: [
        { value: '5', label: 'Excellent' },
        { value: '4', label: 'Good' },
        { value: '3', label: 'Average' }
      ]
    }
  ],
  shareUrl: 'http://localhost:3001/form/1',
  created_at: new Date().toISOString(),
  status: 'active'
};
storage.nextFormId = 2;

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server running' });
});

app.get('/api/forms', (req, res) => {
  const forms = Object.values(storage.forms);
  res.json({ success: true, forms });
});

app.get('/api/forms/:id', (req, res) => {
  const form = storage.forms[req.params.id];
  if (!form) return res.status(404).json({ error: 'Form not found' });
  res.json({ success: true, form });
});

app.post('/api/forms', (req, res) => {
  const { title, description, fields } = req.body;
  
  if (!title || !fields?.length) {
    return res.status(400).json({ error: 'Title and fields required' });
  }
  
  const formId = storage.nextFormId.toString();
  storage.nextFormId++;
  
  const shareUrl = `${req.protocol}://${req.get('host')}/form/${formId}`;
  
  const newForm = {
    id: formId,
    title,
    description: description || '',
    fields,
    shareUrl,
    created_at: new Date().toISOString(),
    status: 'active'
  };
  
  storage.forms[formId] = newForm;
  
  console.log(`✅ Form created: ${title} (ID: ${formId})`);
  console.log(`🔗 Share URL: ${shareUrl}`);
  
  res.status(201).json({
    success: true,
    message: 'Form created successfully',
    formId,
    shareUrl,
    form: newForm
  });
});

app.post('/api/forms/:id/submit', (req, res) => {
  const { id } = req.params;
  const form = storage.forms[id];
  
  if (!form) return res.status(404).json({ error: 'Form not found' });
  
  const submissionId = storage.nextSubmissionId.toString();
  storage.nextSubmissionId++;
  
  storage.submissions[submissionId] = {
    id: submissionId,
    formId: id,
    data: req.body,
    submitted_at: new Date().toISOString()
  };
  
  console.log(`📝 Form submitted: ${id}`);
  res.status(201).json({ success: true, submissionId });
});

app.get('/api/forms/:id/submissions', (req, res) => {
  const submissions = Object.values(storage.submissions)
    .filter(s => s.formId === req.params.id);
  res.json({ success: true, submissions });
});

// Serve form HTML
app.get('/form/:id', (req, res) => {
  const form = storage.forms[req.params.id];
  if (!form) return res.status(404).send('<h1>Form Not Found</h1>');
  
  const fieldsHtml = form.fields.map(field => {
    if (field.type === 'dropdown') {
      const options = field.options?.map(opt => 
        `<option value="${opt.value}">${opt.label}</option>`
      ).join('') || '';
      return `
        <div style="margin: 15px 0;">
          <label><strong>${field.question}</strong></label>
          <select name="${field.id}" required style="width:100%;padding:8px;">
            <option value="">Select...</option>
            ${options}
          </select>
        </div>`;
    }
    return `
      <div style="margin: 15px 0;">
        <label><strong>${field.question}</strong></label>
        <input type="text" name="${field.id}" required style="width:100%;padding:8px;" />
      </div>`;
  }).join('');
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${form.title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: Arial; max-width: 600px; margin: 50px auto; padding: 20px; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        button { background: #3b82f6; color: white; padding: 12px 30px; border: none; border-radius: 4px; cursor: pointer; }
        .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; display: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${form.title}</h1>
        <p>${form.description}</p>
        <form id="form">
          ${fieldsHtml}
          <button type="submit">Submit</button>
        </form>
        <div id="success" class="success">Thank you! Form submitted successfully.</div>
      </div>
      <script>
        document.getElementById('form').onsubmit = async (e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target));
          try {
            await fetch('/api/forms/${form.id}/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            document.getElementById('success').style.display = 'block';
            e.target.reset();
          } catch (err) {
            alert('Error submitting form');
          }
        };
      </script>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Sample form: http://localhost:${PORT}/form/1`);
});

module.exports = app; 
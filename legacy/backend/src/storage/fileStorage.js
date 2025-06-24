const fs = require('fs').promises;
const path = require('path');

// Data directory path - use the data directory we created
const DATA_DIR = path.join(__dirname, '../../../data');

// Initialize the file storage system
async function initializeStorage() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`Data directory ensured at: ${DATA_DIR}`);
    
    // Initialize data files if they don't exist
    const formsPath = path.join(DATA_DIR, 'forms.json');
    const submissionsPath = path.join(DATA_DIR, 'submissions.json');
    
    // Check and initialize forms.json
    try {
      await fs.access(formsPath);
      console.log('Forms data file exists');
    } catch (err) {
      await fs.writeFile(formsPath, JSON.stringify([], null, 2));
      console.log('Created forms.json file');
    }
    
    // Check and initialize submissions.json
    try {
      await fs.access(submissionsPath);
      console.log('Submissions data file exists');
    } catch (err) {
      await fs.writeFile(submissionsPath, JSON.stringify([], null, 2));
      console.log('Created submissions.json file');
    }
    
    console.log('✅ File storage system initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing file storage:', error.message);
    return false;
  }
}

// Get all forms from file
async function getForms() {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'forms.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading forms:', error.message);
    return [];
  }
}

// Get a specific form by ID
async function getFormById(id) {
  try {
    const forms = await getForms();
    return forms.find(form => form.id === id) || null;
  } catch (error) {
    console.error('Error getting form by ID:', error.message);
    return null;
  }
}

// Create a new form
async function createForm(formData) {
  try {
    const forms = await getForms();
    const newForm = {
      ...formData,
      id: Date.now().toString(),
      created_at: new Date().toISOString()
    };
    
    forms.push(newForm);
    await fs.writeFile(path.join(DATA_DIR, 'forms.json'), JSON.stringify(forms, null, 2));
    return newForm;
  } catch (error) {
    console.error('Error creating form:', error.message);
    throw error;
  }
}

// Get all submissions
async function getSubmissions() {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'submissions.json'), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading submissions:', error.message);
    return [];
  }
}

// Get submissions for a specific form
async function getSubmissionsByFormId(formId) {
  try {
    const submissions = await getSubmissions();
    return submissions.filter(sub => sub.formId === formId);
  } catch (error) {
    console.error('Error getting form submissions:', error.message);
    return [];
  }
}

// Create a new submission
async function createSubmission(formId, submissionData) {
  try {
    const submissions = await getSubmissions();
    const newSubmission = {
      id: Date.now().toString(),
      formId,
      data: submissionData,
      submitted_at: new Date().toISOString()
    };
    
    submissions.push(newSubmission);
    await fs.writeFile(
      path.join(DATA_DIR, 'submissions.json'), 
      JSON.stringify(submissions, null, 2)
    );
    return newSubmission;
  } catch (error) {
    console.error('Error creating submission:', error.message);
    throw error;
  }
}

module.exports = {
  initializeStorage,
  getForms,
  getFormById,
  createForm,
  getSubmissions,
  getSubmissionsByFormId,
  createSubmission
};

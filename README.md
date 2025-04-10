# Marketing Campaign Form Builder

A full-stack application for creating, managing and analyzing marketing campaigns with dynamic form creation capabilities.

## Features

- **Drag-and-Drop Form Builder** - Intuitive interface to design custom forms
- **Multiple Field Types** - Text inputs, dropdowns, checkboxes, tables, and file uploads
- **Form Preview** - Test your forms before saving them
- **Admin Dashboard** - View and manage all created forms
- **Database Integration** - Store form data in MySQL or file storage
- **Responsive Design** - Works on desktop and mobile devices
- **Real-time Validation** - Check form data as users interact
- **Theme Customization** - Choose from multiple visual themes for your forms
- **Conditional Logic** - Create dynamic forms with conditional field display
- **Form Validation** - Set validation rules and test them before saving
- **File Upload Support** - Allow users to upload files within forms

## Domain Model

```
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│     User          │     │     Form          │     │  FormSubmission   │
├───────────────────┤     ├───────────────────┤     ├───────────────────┤
│ id                │     │ id                │     │ id                │
│ username          │     │ title             │     │ form_id           │
│ email             │     │ description       │     │ response_data     │
│ password_hash     │     │ user_id           │     │ submitted_at      │
│ role              │     │ created_at        │     └───────────────────┘
└───────────────────┘     │ updated_at        │              ▲
         │                │ theme_id          │              │
         │                │ validation_code   │              │
         │                └───────────────────┘              │
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                        ┌───────────────────┐
                        │      Field        │
                        ├───────────────────┤
                        │ id                │
                        │ form_id           │
                        │ type              │      ┌───────────────────┐
                        │ question          │      │  FileUpload       │
                        │ is_required       │      ├───────────────────┤
                        │ options           ├─────▶│ id                │
                        │ validation        │      │ form_id           │
                        │ conditions        │      │ file_name         │
                        │ order             │      │ file_path         │
                        └───────────────────┘      │ mime_type         │
                                                   │ file_size         │
                                                   │ uploaded_at       │
                                                   └───────────────────┘
```

This domain model illustrates the relationships between the main entities in the application:
- **User**: Administrators who create and manage forms
- **Form**: A collection of fields with metadata and theme settings
- **Field**: Individual form elements with various types and properties
- **FormSubmission**: Responses submitted by end users
- **FileUpload**: Files attached to form submissions

## Project Structure

```
/Marketing Campaign/
├── backend/                      # Express.js backend
│   ├── src/                      # Source code
│   │   ├── server.js             # Server entry point
│   │   ├── controllers/          # API controllers
│   │   │   ├── formController.js # Form management controller
│   │   │   ├── submissionController.js # Form submission controller  
│   │   │   └── adminController.js # Admin dashboard controller
│   │   ├── models/               # Data models
│   │   │   ├── Form.js           # Form model
│   │   │   ├── Submission.js     # Submission model
│   │   │   └── FileUpload.js     # File upload model
│   │   ├── middleware/           # Express middleware
│   │   │   ├── auth.js           # Authentication middleware
│   │   │   └── upload.js         # File upload middleware
│   │   ├── routes/               # API routes
│   │   │   ├── formRoutes.js     # Form management routes
│   │   │   └── adminRoutes.js    # Admin routes
│   │   └── storage/              # Storage adapters
│   │       ├── fileStorage.js    # File-based storage implementation
│   │       └── dbStorage.js      # Database storage implementation
│   └── public/                   # Static assets
│       ├── admin/                # Admin dashboard files
│       │   └── dashboard.html    # Admin interface
│       └── styles/               # CSS stylesheets
│           └── admin.css         # Admin dashboard styles
├── frontend/                     # React.js frontend
│   ├── src/                      # Source code
│   │   ├── components/           # UI components
│   │   │   ├── ui/               # UI components
│   │   │   │   ├── Button.js     # Button component
│   │   │   │   └── Card.js       # Card component
│   │   │   ├── builder/          # Form builder components
│   │   │   │   ├── FormBuilder.js # Main form builder
│   │   │   │   ├── FieldPalette.js # Field type selector
│   │   │   │   ├── FormCanvas.js # Form building area
│   │   │   │   ├── FieldConfigPanel.js # Field configuration
│   │   │   │   ├── FormBuilderPage.js # Builder page component
│   │   │   │   └── ThemeSelector.js # Theme selection component
│   │   │   ├── fields/           # Field type components
│   │   │   │   ├── FieldRenderer.js # Field rendering logic
│   │   │   │   ├── TextInputField.js # Text input component
│   │   │   │   ├── DropdownField.js # Dropdown component
│   │   │   │   ├── TableField.js # Table input component
│   │   │   │   └── FileUploadField.js # File upload component
│   │   │   ├── tables/           # Table components
│   │   │   │   └── TableInputField.js # Table input component
│   │   │   └── preview/          # Form preview components
│   │   │       └── FormPreview.js # Form preview component
│   │   ├── context/              # React context providers
│   │   │   ├── FormBuilderContext.js # Form builder state
│   │   │   ├── FormContext.js    # Form data context
│   │   │   ├── ThemeContext.js   # Theme context
│   │   │   └── CampaignContext.js # Campaign context
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useApi.js         # API request hook
│   │   │   ├── useDebounce.js    # Value debouncing hook
│   │   │   ├── useForm.js        # Form state management hook
│   │   │   └── useFormSubmission.js # Form submission hook
│   │   ├── api/                  # API service layer
│   │   │   ├── apiConfig.js      # API configuration
│   │   │   ├── formService.js    # Forms API client
│   │   │   └── campaignService.js # Campaign API client
│   │   ├── pages/                # Page components
│   │   │   ├── HomePage.js       # Home page
│   │   │   ├── DashboardPage.js  # Dashboard page
│   │   │   └── CampaignFormPage.js # Campaign form page
│   │   ├── utils/                # Utility functions
│   │   │   ├── validation.js     # Validation utilities
│   │   │   └── formValidation.js # Form validation utilities
│   │   ├── router.js             # Application routing
│   │   └── index.js              # Application entry point
│   └── public/                   # Static assets
├── sql/                          # Database scripts
│   ├── initialize.sql            # Database schema
│   ├── init-db.js                # DB initialization script
│   └── modules/                  # SQL modules
│       ├── ID01_Forms.sql        # Forms table definition
│       ├── ID02_Fields.sql       # Fields table definition
│       └── ID08_File_Uploads.sql # File uploads table definition
├── scripts/                      # Utility scripts
│   └── test-db-connection.js     # Database connection tester
├── .env                          # Environment variables
├── package.json                  # Project dependencies
└── README.md                     # Project documentation
```

## Running the Application

### Backend

```bash
# Navigate to the backend
cd "../Marketing Campaign"
cd backend

# Install dependencies
npm install
#If encounter any problem, try to check your version or:
npm install -- force fix

# Start the backend server
npm start

# For development with auto-restart
npm run dev
```

Backend will be available at: http://localhost:3001

### Frontend

```bash
# Navigate to the frontend directory
cd "../Marketing Campaign/frontend"

# Install dependencies
npm install
#If encounter any problem, try to check your version or:
npm install -- force fix

#Start development server
npm start
```

Frontend will be available at: http://localhost:3000

## Database Setup

### Initializing the MySQL Database

The application requires a MySQL database. Follow these steps to set it up:

1. **Install MySQL** if not already installed:
   - macOS: `brew install mysql`
   - Windows: Download and install from [MySQL website](https://dev.mysql.com/downloads/installer/)
   - Linux: `sudo apt install mysql-server`

2. **Start MySQL service**:
   - macOS: `brew services start mysql`
   - Windows: Windows Services or `net start mysql`
   - Linux: `sudo systemctl start mysql`

3. **Initialize the database**:
   ```bash
   # Navigate to the backend directory
   cd "../Marketing Campaign/backend"
   
   # Run the database initialization script
   npm run init-db
   ```

4. **Troubleshooting database connection**:
   If you encounter database connection issues, verify:
   - MySQL is running
   - Credentials in your .env file are correct
   - The database exists
   ```bash
   # Test database connection
   node scripts/test-db-connection.js
   ```

### Creating a New MySQL User

For better security, create a dedicated user for this application:

1. **Log in to MySQL as root**:
   ```bash
   mysql -u root -p
   ```

2. **Create a new user**:
   ```sql
   CREATE USER 'marketing_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   ```

3. **Grant necessary permissions**:
   ```sql
   GRANT ALL PRIVILEGES ON marketing_campaign_form.* TO 'marketing_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Update your .env file** with the new credentials:
   ```
   DB_USER=marketing_user
   DB_PASSWORD=your_secure_password
   ```

5. **Verify the connection** with the new user:
   ```bash
   mysql -u marketing_user -p
   ```

## Using the Form Builder

1. Access the form builder at http://localhost:3000
2. Drag field components from the left panel to your form
3. Configure field properties using the right panel
4. Use the **Preview** button to test your form
5. Use the **Save** button to store your form

## Admin Interface

The admin dashboard at http://localhost:3001/admin gives you access to:

- View all created forms
- Edit existing forms
- Preview form layouts
- Add and modify form fields

## Extending the Application

### Adding a New Field Type

You can extend the application by adding new field types. Follow these steps:

1. **Create a new field component** in `/frontend/src/components/fields/`:

```javascript
// Example: ColorPickerField.js
import React from 'react';

const ColorPickerField = ({ 
  question, 
  required, 
  value = '#000000', 
  onChange,
  isPreview = true
}) => {
  return (
    <div className="margin-responsive">
      <label className="form-label">
        {question}
        {required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={!isPreview}
        className="input"
        style={{ width: '100%', height: '40px' }}
      />
    </div>
  );
};

export default ColorPickerField;
```

2. **Update the FieldRenderer component** to include your new field type:

```javascript
// Update FieldRenderer.js
import ColorPickerField from './ColorPickerField';

const FieldRenderer = ({ field, isPreview, onChange }) => {
  // ...existing code...
  
  switch (field.type) {
    // ...existing cases...
    
    case 'color':
      return (
        <ColorPickerField
          question={field.question}
          required={field.isRequired}
          value={field.value || '#000000'}
          onChange={(value) => onChange && onChange(value)}
          isPreview={isPreview}
        />
      );
    
    // ...existing default case...
  }
};
```

3. **Add the new field type to the field palette** in `/frontend/src/components/builder/FieldPalette.js`:

```javascript
// Update in FieldPalette.js
const fieldTypes = [
  // ...existing field types...
  { type: 'color', label: 'Color Picker', icon: '🎨' },
];
```

4. **Add configuration options** in `/frontend/src/components/builder/FieldConfigPanel.js`:

```javascript
// Update in FieldConfigPanel.js
// Within the component:
{field.type === 'color' && (
  <div className="config-field">
    <label className="form-label">Default Color</label>
    <input
      type="color"
      name="defaultValue"
      value={field.defaultValue || '#000000'}
      onChange={handleChange}
      className="input"
    />
  </div>
)}
```

5. **Update backend validation** to handle the new field type if necessary.

### Adding a New Theme

You can add custom themes to the application by following these steps:

1. **Add a new theme** to the ThemeSelector component in `/frontend/src/components/builder/ThemeSelector.js`:

```javascript
// Update in ThemeSelector.js
const themes = [
  // ...existing themes...
  { 
    id: 'purple', 
    name: 'Royal Purple',
    primaryColor: '#7e22ce',
    icon: '👑'
  },
];
```

2. **Define the theme colors** in the ThemeContext in `/frontend/src/context/ThemeContext.js`:

```javascript
// Update in ThemeContext.js
const themes = {
  // ...existing themes...
  purple: {
    primaryColor: '#7e22ce',
    secondaryColor: '#581c87',
    backgroundColor: '#ffffff',
    cardBackground: '#f5f3ff',
    textColor: '#4c1d95'
  },
};
```

3. **Create a CSS class** for your theme (optional):

```css
/* Add to your CSS file */
.theme-purple {
  --primary-color: #7e22ce;
  --secondary-color: #581c87;
  --background-color: #ffffff;
  --card-background: #f5f3ff;
  --text-color: #4c1d95;
}
```

4. **Test the new theme** by selecting it in the Theme Selector panel of the form builder.

## API Endpoints

### Form Management

#### Exist Functions
- `GET /api/forms` - List all forms
  ```bash
  # Example usage with curl
  curl -X GET http://localhost:3001/api/forms
  
  # Example response
  {
    "success": true,
    "forms": [
      {
        "id": 1,
        "title": "Customer Feedback Survey",
        "description": "Help us improve our products and services",
        "created_at": "2023-04-10T15:30:00.000Z"
      }
    ]
  }
  ```

- `GET /api/forms/:id` - Get a specific form
  ```bash
  # Replace :id with the actual form ID
  curl -X GET http://localhost:3001/api/forms/1
  
  # Example response
  {
    "success": true,
    "form": {
      "id": 1,
      "title": "Customer Feedback Survey",
      "description": "Help us improve our products and services",
      "fields": [...],
      "created_at": "2023-04-10T15:30:00.000Z"
    }
  }
  ```

- `POST /api/forms` - Create a new form
  ```bash
  # Create a new form
  curl -X POST http://localhost:3001/api/forms \
    -H "Content-Type: application/json" \
    -d '{
      "title": "New Product Survey",
      "description": "Tell us what you think about our new product",
      "fields": [
        {
          "id": "name",
          "type": "text",
          "question": "Your name",
          "isRequired": true
        },
        {
          "id": "rating",
          "type": "dropdown",
          "question": "How would you rate our product?",
          "isRequired": true,
          "options": [
            {"value": "5", "label": "Excellent"},
            {"value": "4", "label": "Good"},
            {"value": "3", "label": "Average"},
            {"value": "2", "label": "Below Average"},
            {"value": "1", "label": "Poor"}
          ]
        }
      ]
    }'
  
  # Example response
  {
    "success": true,
    "message": "Form created successfully",
    "formId": 2
  }
  ```

#### Functions release in the Future
- `PUT /api/forms/:id` - Update a form
  ```bash
  # Replace :id with the actual form ID
  curl -X PUT http://localhost:3001/api/forms/2 \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Updated Product Survey",
      "description": "We've improved our survey",
      "fields": [
        {
          "id": "name",
          "type": "text",
          "question": "Your full name",
          "isRequired": true
        },
        {
          "id": "email",
          "type": "text",
          "question": "Your email address",
          "isRequired": true
        }
      ]
    }'
  
  # Example response
  {
    "success": true,
    "message": "Form updated successfully"
  }
  ```

- `DELETE /api/forms/:id` - Delete a form
  ```bash
  # Replace :id with the actual form ID
  curl -X DELETE http://localhost:3001/api/forms/2
  
  # Example response
  {
    "success": true,
    "message": "Form deleted successfully"
  }
  ```

### Form Submissions

- `POST /api/forms/:id/submit` - Submit responses to a form
  ```bash
  # Replace :id with the actual form ID
  curl -X POST http://localhost:3001/api/forms/1/submit \
    -H "Content-Type: application/json" \
    -d '{
      "name": "John Doe",
      "email": "john@example.com",
      "rating": "5",
      "feedback": "Great service!"
    }'
  
  # Example response
  {
    "success": true,
    "message": "Form submitted successfully",
    "submissionId": 1
  }
  ```

- `GET /api/forms/:id/submissions` - Get all submissions for a form
  ```bash
  # Replace :id with the actual form ID
  curl -X GET http://localhost:3001/api/forms/1/submissions
  
  # Example response
  {
    "success": true,
    "submissions": [
      {
        "id": 1,
        "response_data": {
          "name": "John Doe",
          "email": "john@example.com",
          "rating": "5",
          "feedback": "Great service!"
        },
        "submitted_at": "2023-04-10T16:00:00.000Z"
      }
    ]
  }
  ```

## API Endpoints Guide

Below are instructions for testing the API endpoints using terminal commands:

### Form Submission Endpoints

```bash
# Submit a form response
# Replace 1 with your form ID
curl -X POST http://localhost:3001/api/forms/1/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "rating": "5",
    "feedback": "Great service!"
  }'

# Get all submissions for a form
# Replace 1 with your form ID
curl -X GET http://localhost:3001/api/forms/1/submissions
```

### Admin Endpoints

```bash
# Get all forms (admin view)
curl -X GET http://localhost:3001/api/admin/forms

# Get all submissions (admin view)
curl -X GET http://localhost:3001/api/admin/submissions

# Get specific form (admin view)
# Replace 1 with your form ID
curl -X GET http://localhost:3001/api/admin/forms/1

# Get specific submission (admin view)
# Replace 1 with your submission ID
curl -X GET http://localhost:3001/api/admin/submissions/1

# Delete a form (admin)
# Replace 1 with your form ID
curl -X DELETE http://localhost:3001/api/admin/forms/1

# Delete a submission (admin)
# Replace 1 with your submission ID
curl -X DELETE http://localhost:3001/api/admin/submissions/1
```

### File Upload Endpoints

```bash
# Upload a file
# Replace 1 with your form ID
curl -X POST http://localhost:3001/api/upload \
  -F "file=@/path/to/your/file.pdf" \
  -F "formId=1"

# Get files for a form
# Replace 1 with your form ID
curl -X GET http://localhost:3001/api/files/1
```

## Contributing

We welcome contributions to improve the Marketing Campaign Form Builder! Here's how you can contribute:

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
   ```bash
   git clone https://github.com/yourusername/marketing-campaign.git
   cd marketing-campaign
   ```
3. **Create a new branch** for your feature or bugfix
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and commit them with descriptive messages
   ```bash
   git commit -m "Add feature: description of your changes"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Submit a pull request** to the main repository

### Contribution Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Include tests for new features
- Update documentation for any API changes
- Keep pull requests focused on a single feature or bugfix

## Acknowledgements

This project was developed with assistance from:

- **Claude 3.7 Sonnet** - Helped with code implementation and debugging
- **ChatGPT-4o** - Assisted in project design and architecture

We also want to thank the open-source community for the various libraries and frameworks that made this project possible.
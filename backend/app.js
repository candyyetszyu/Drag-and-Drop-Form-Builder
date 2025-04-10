const formRoutes = require('./routes/formRoutes');
const authRoutes = require('./routes/authRoutes');

// Route for handling form-related operations
app.use('/api/forms', formRoutes);

// Route for handling authentication-related operations
app.use('/api/auth', authRoutes);
const express = require('express');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const adminRoutes = require('./routes/admin');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => res.json({ok: true, message: 'Intern assignment API v1'}));

// Serve a small frontend from /client (for production serve built files under client/dist)
app.use('/client', express.static(path.join(__dirname, '..', 'client')));

// Simple API index to help testing from Postman/browser
app.get('/api/v1', (req, res) => {
  res.json({
    endpoints: [
      { method: 'GET', path: '/api/v1/health' },
      { method: 'POST', path: '/api/v1/auth/register' },
      { method: 'POST', path: '/api/v1/auth/login' },
      { method: 'GET', path: '/api/v1/auth/me' },
      { method: 'GET', path: '/api/v1/tasks' },
      { method: 'POST', path: '/api/v1/tasks' }
    ]
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({error: message});
});

module.exports = app;

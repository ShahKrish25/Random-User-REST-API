const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // Adds security headers
app.use(morgan('combined')); // Logging
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use('/api', limiter);

// Load users data
let users = [];
try {
  const rawData = fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8');
  users = JSON.parse(rawData);
} catch (error) {
  console.error('Error loading users data:', error);
}

// Utility functions
const getRandomUsers = (count = 1) => {
  const randomUsers = [];
  const usersCount = users.length;
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * usersCount);
    randomUsers.push(users[randomIndex]);
  }
  
  return randomUsers;
};

const filterUsers = (query) => {
  let filteredUsers = [...users];
  
  // Filter by city
  if (query.city) {
    filteredUsers = filteredUsers.filter(user => 
      user.city.toLowerCase() === query.city.toLowerCase()
    );
  }
  
  // Filter by age range
  if (query.min_age) {
    filteredUsers = filteredUsers.filter(user => 
      user.age >= parseInt(query.min_age)
    );
  }
  
  if (query.max_age) {
    filteredUsers = filteredUsers.filter(user => 
      user.age <= parseInt(query.max_age)
    );
  }
  
  // Filter by occupation
  if (query.occupation) {
    filteredUsers = filteredUsers.filter(user => 
      user.occupation.toLowerCase() === query.occupation.toLowerCase()
    );
  }
  
  // Filter by hobby
  if (query.hobby) {
    filteredUsers = filteredUsers.filter(user => 
      user.hobby.some(h => h.toLowerCase() === query.hobby.toLowerCase())
    );
  }
  
  return filteredUsers;
};

// API Routes
// Get API info
app.get('/api', (req, res) => {
  res.json({
    name: "Random Users API",
    version: "1.0.0",
    endpoints: [
      "/api/users",
      "/api/users/:id",
      "/api/users/random",
      "/api/users/random/:count",
      "/api/stats/cities",
      "/api/stats/ages",
      "/api/stats/occupations"
    ],
    documentation: "/api-docs"
  });
});

// Get all users with filtering and pagination
app.get('/api/users', (req, res) => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    
    // Apply filters
    let results = filterUsers(filters);
    
    // Get total count before pagination
    const totalCount = results.length;
    
    // Apply pagination
    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;
    results = results.slice(startIndex, endIndex);
    
    // Send response with pagination metadata
    res.json({
      total: totalCount,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      data: results
    });
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = users.find(user => user.id === userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a random user
app.get('/api/users/random', (req, res) => {
  try {
    const randomUser = getRandomUsers(1)[0];
    res.json(randomUser);
  } catch (error) {
    console.error('Error retrieving random user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get multiple random users
app.get('/api/users/random/:count', (req, res) => {
  try {
    const count = parseInt(req.params.count);
    
    if (isNaN(count) || count < 1) {
      return res.status(400).json({ error: 'Count must be a positive number' });
    }
    
    const maxCount = Math.min(count, 50); // Limit to 50 users max
    const randomUsers = getRandomUsers(maxCount);
    res.json(randomUsers);
  } catch (error) {
    console.error('Error retrieving random users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get city statistics
app.get('/api/stats/cities', (req, res) => {
  try {
    const cityCounts = {};
    
    users.forEach(user => {
      cityCounts[user.city] = (cityCounts[user.city] || 0) + 1;
    });
    
    // Convert to array for easier sorting
    const cityStats = Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count,
      percentage: (count / users.length * 100).toFixed(2) + '%'
    }));
    
    // Sort by count in descending order
    cityStats.sort((a, b) => b.count - a.count);
    
    res.json(cityStats);
  } catch (error) {
    console.error('Error retrieving city stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get age distribution statistics
app.get('/api/stats/ages', (req, res) => {
  try {
    // Group users by age ranges
    const ageRanges = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    };
    
    users.forEach(user => {
      const age = user.age;
      if (age < 25) ageRanges['18-24']++;
      else if (age < 35) ageRanges['25-34']++;
      else if (age < 45) ageRanges['35-44']++;
      else if (age < 55) ageRanges['45-54']++;
      else ageRanges['55+']++;
    });
    
    // Convert to array for easier consumption
    const ageStats = Object.entries(ageRanges).map(([range, count]) => ({
      range,
      count,
      percentage: (count / users.length * 100).toFixed(2) + '%'
    }));
    
    res.json(ageStats);
  } catch (error) {
    console.error('Error retrieving age stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get occupation statistics
app.get('/api/stats/occupations', (req, res) => {
  try {
    const occupationCounts = {};
    
    users.forEach(user => {
      occupationCounts[user.occupation] = (occupationCounts[user.occupation] || 0) + 1;
    });
    
    // Convert to array for easier sorting
    const occupationStats = Object.entries(occupationCounts).map(([occupation, count]) => ({
      occupation,
      count,
      percentage: (count / users.length * 100).toFixed(2) + '%'
    }));
    
    // Sort by count in descending order
    occupationStats.sort((a, b) => b.count - a.count);
    
    res.json(occupationStats);
  } catch (error) {
    console.error('Error retrieving occupation stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search functionality
app.get('/api/search', (req, res) => {
  try {
    const searchTerm = req.query.q?.toLowerCase();
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    
    const results = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.city.toLowerCase().includes(searchTerm) ||
      user.occupation.toLowerCase().includes(searchTerm) ||
      user.hobby.some(h => h.toLowerCase().includes(searchTerm))
    );
    
    res.json({
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle 404 - Route not found
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'The requested endpoint does not exist.' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong on the server.' 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
});

module.exports = app; // For testing purposes
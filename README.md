# Random-User-REST-API

A powerful and flexible REST API for serving random user data with advanced filtering, statistics, and search capabilities.

## Features

- 🔒 **Secure**: Built-in rate limiting and security headers
- 🔍 **Searchable**: Full-text search across multiple user attributes
- 📊 **Statistical**: Endpoints for analyzing user demographics
- 🎯 **Filterable**: Filter users by age, location, hobbies, and more
- 📄 **Documented**: Complete API documentation with Swagger UI
- 📱 **Responsive**: Pagination support for handling large datasets

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/random-user-rest-api.git
```

2. Install the dependencies:
```bash
cd random-user-rest-api
npm install
```

3. Start the server:
```bash
npm start
```

4. The API will be running at `http://localhost:3000` with documentation available at `http://localhost:3000/api-docs`.

## API Endpoints

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Retrieve a list of users with optional filtering and pagination |
| GET | `/api/users/:id` | Retrieve a user by ID |
| GET | `/api/users/random` | Retrieve a random user |
| GET | `/api/users/random/:count` | Retrieve multiple random users (max 50) |

### Statistics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats/cities` | Retrieve statistics on the distribution of users by city |
| GET | `/api/stats/ages` | Retrieve statistics on the age distribution of users |
| GET | `/api/stats/occupations` | Retrieve statistics on the distribution of user occupations |

### Search Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=term` | Search for users by name, city, occupation, or hobby |

## Query Parameters

### Filtering

- `city`: Filter users by city (e.g., `/api/users?city=New+York`)
- `min_age`: Filter users by minimum age (e.g., `/api/users?min_age=25`)
- `max_age`: Filter users by maximum age (e.g., `/api/users?max_age=35`)
- `occupation`: Filter users by occupation (e.g., `/api/users?occupation=Engineer`)
- `hobby`: Filter users by hobby (e.g., `/api/users?hobby=reading`)

### Pagination

- `page`: Page number (default: 1)
- `limit`: Number of results per page (default: 10)

## Example Requests

```bash
# Get all users from New York between ages 25-35
curl http://localhost:3000/api/users?city=New+York&min_age=25&max_age=35

# Get 5 random users
curl http://localhost:3000/api/users/random/5

# Search for users who like reading
curl http://localhost:3000/api/search?q=reading
```

## Security Testing

To test the rate limiting and security features, you can use the included Python script:

```bash
# Install the requests module
pip install requests

# Run the test script
python test_rate_limit.py
```

This script will make multiple requests to test how the server handles excess traffic.

## Development

### Environment Variables

- `PORT`: Set the server port (default: 3000)

### Using Nodemon for Auto-Restart

```bash
npm install -g nodemon
nodemon server.js
```

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Performance Considerations

- The API implements rate limiting to prevent abuse
- For large datasets, consider implementing database integration
- Use the pagination parameters to limit response size

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- Express.js for the web framework
- Swagger UI for API documentation
- Helmet for security headers
- Morgan for request logging

# Art Community Platform - Backend

A comprehensive backend API for a global artist community platform built with Node.js, Express, MongoDB, and PostgreSQL.

## Features

- **User Authentication**: JWT-based authentication with social login support
- **Artist Profiles**: Portfolio management, social media integration, badges system
- **Artwork Management**: Upload, categorization, likes, comments, tips
- **Competitions**: Art contests with submission and voting systems
- **Tutorials**: User-generated learning content
- **Payments**: *(disabled — all payment endpoints removed)*
- **Real-time Features**: WebSocket support for chat and live auctions
- **Analytics**: User engagement and artwork performance tracking

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: 
  - MongoDB (artworks, users, chat)
  - PostgreSQL (transactions, payments, analytics)
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Real-time**: Socket.io
- **Payments**: Stripe, PayPal, Razorpay
- **Validation**: express-validator

## Project Structure

```
backend/
├── src/
│   ├── config/          # Database and configuration files
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Authentication and validation
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── utils/          # Helper functions
│   └── server.ts       # Main server file
├── .env                # Environment variables
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (make sure the daemon is running; `mongod` on port 27017 or use a managed/remote cluster)
  > **Note:** If the server cannot connect to MongoDB it runs in "limited mode". In that state
  > `/api/auth/login` and `/api/auth/register` return **503** with the message
  > `Authentication service unavailable (database disconnected)`. Start MongoDB before
  > running the backend to avoid auth failures.
  > 
  > On Windows you can start the service with:
  > ```powershell
  > net start MongoDB        # if installed as a service
  > mongod --dbpath "C:\data\db" # manual start
  > ```
  > Alternatively run a temporary container:
  > ```bash
  > docker run --rm -p 27017:27017 -v mongo-data:/data/db mongo:6
  > ```
  > 
  > **Automatic dev fallback:** when `NODE_ENV=development` and the first
  > connection attempt fails, the backend will automatically spin up an
  > in‑memory MongoDB instance using `mongodb-memory-server`. This means you
  > can run the app without installing Mongo locally; the memory server
  > satisfies authentication and other features. The in-memory database is
  > reset each restart.
- PostgreSQL
- Cloudinary account

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/github` - GitHub OAuth

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow user
- `POST /api/users/:id/unfollow` - Unfollow user

### Artworks
- `GET /api/artworks` - Get all artworks
- `GET /api/artworks/:id` - Get artwork by ID
- `POST /api/artworks` - Create new artwork
- `PUT /api/artworks/:id` - Update artwork
- `DELETE /api/artworks/:id` - Delete artwork
- `POST /api/artworks/:id/like` - Like artwork
- `POST /api/artworks/:id/comment` - Add comment

### Competitions
- `GET /api/competitions` - Get all competitions
- `POST /api/competitions` - Create competition
- `POST /api/competitions/:id/submit` - Submit artwork
- `POST /api/competitions/:id/vote` - Vote in competition

<!-- Payments endpoints removed -->

## Database Schema

### MongoDB Collections
- **Users**: User profiles and authentication
- **Artworks**: Artwork metadata and media
- **Competitions**: Contest information and entries
- **Tutorials**: Learning content

### PostgreSQL Tables
- **users**: User reference table
- **tips**: Tip transactions
- **sales**: Artwork purchases
- **auction_bids**: Auction bid history
- **competition_entries**: Competition submissions
- **analytics**: User engagement metrics

## Environment Variables

Key environment variables required:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/art_community  # use 127.0.0.1 to avoid IPv6 lookup problems
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Cloud Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payments
STRIPE_SECRET_KEY=your_stripe_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
```

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.
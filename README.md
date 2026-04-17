# ArtHub - Global Artist Community Platform

Welcome to ArtHub, a comprehensive platform connecting artists worldwide. This platform allows artists to showcase their work, connect with fans, receive tips, participate in competitions, and build a thriving creative community.

## Features

- **Artist Profiles**: Portfolio uploads (images, videos, PDFs), category tags, social media links, followers/following, badges, and total tips earned
- **Feed & Galleries**: Global feed filtered by category, grid layout for artworks, likes, comments, tip button, save/bookmark artworks
- **Tips & Payments**: *(disabled – payment features have been removed)*
- **Weekly Leaderboard**: Rankings based on user votes, likes, and tips, per category
- **Art Competitions & Gallery Shows**: Submission system, voting, countdown timers, virtual gallery with interactive views
- **Shop & Auctions**: Artists can sell directly or host auctions with real-time bid updates
- **One-on-One Chat**: Real-time messaging, multimedia support
- **User-Driven Learning & Tips**: Community tutorials, tips, and guides
- **Notifications**: In-app and push notifications
- **Search & Discovery**: Advanced search by artist, artwork, category, or tags
- **Analytics Dashboard**: Track views, likes, tips, sales, and competition entries
- **Security & Moderation**: Content scanning and protection features

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Databases**: MongoDB for unstructured data (users, artworks, chats), PostgreSQL for structured data (transactions, analytics)
- **Payment Processing**: Stripe
- **Real-time Features**: Socket.IO
- **Styling**: Tailwind CSS with dark/light mode support

## Prerequisites

Before running the application, you'll need:

1. **Node.js** (v18 or higher)
2. **MongoDB** (running locally on port 27017 – service must be started before launching the app)

   > If you get ECONNREFUSED errors for ::1 or 127.0.0.1, ensure `mongod` is running and the connection string
   > uses `127.0.0.1` instead of `localhost` to bypass IPv6 resolution issues.
3. **PostgreSQL** (running locally on port 5432)
4. **Stripe Account** (for payment processing)
*Payment features have been removed from the application.*

<!--
### Stripe Checkout Integration
The application now supports real payments using Stripe Checkout. Visitors can tip artists using credit/debit cards directly from the UI. To enable this feature:

1. Add your publishable key to the frontend environment: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
2. Keep `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` set on the backend.
3. Configure a webhook endpoint (`/api/payments/webhook`) in your Stripe dashboard so that `payment_intent.succeeded` events update the database.
4. (Optional) Customize the `success_url` in `backend/src/routes/payments.ts` if you want users to land on a different page after checkout.

With these variables in place, the "Send Tip" modal will display a *Pay with Card* button alongside the existing UPI options.

> ⚠️ **UPI payments:** artists may now supply a `upiId` in their profile. When present the tip modal shows a UPI button that opens the payer's UPI app and records the tip in the database. The previous `ENABLE_UPI_SIMULATION` flags only control the optional **UTR verification** step and are not required to show the button; they can be turned off for production to simplify the flow:
> ```env
> ENABLE_UPI_SIMULATION=false  # verification dialog disabled
> NEXT_PUBLIC_ENABLE_UPI_SIMULATION=false
> ```
> With the flags disabled the modal will still ask the user to scan the QR code, but it will not prompt for a reference number – tapping **"I've Completed the Payment"** immediately marks the tip as complete. All orders are logged regardless, and you can still call `/api/users/tip/verify` with a UTR if you need to retrospectively attach one. Stripe remains the primary real‑money channel, but UPI now provides a way to capture manual transfers without the hassle of fake reference numbers.

### Currency support
The tip modal now lets users pick any ISO currency code (e.g. USD, INR, EUR, JPY). The chosen currency is passed to Stripe; if Stripe does not support the code an error will be shown. This also applies to purchases, auction bids, and competition entries which accept an optional `currency` field in the API.

To make a payment in a different currency select or type the appropriate code when entering an amount.
-->

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Configuration

Create `.env` files in both frontend and backend directories:

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arthub
PG_HOST=localhost
PG_PORT=5432
PG_USER=your_postgres_user
PG_PASSWORD=your_postgres_password
PG_DATABASE=arthub
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Database Setup

Make sure MongoDB and PostgreSQL are running on your local machine:

- MongoDB should be running on `localhost:27017` (or `127.0.0.1:27017`); start the MongoDB service with
  `mongod` or via your OS service manager before starting the server.
- PostgreSQL should be running on `localhost:5432`

### 4. Running the Application

**Start the Backend:**

```bash
cd backend
npm run build  # Compile TypeScript
npm start      # Run the server
```

**Start the Frontend:**

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Type check without emitting

### Backend
- `npm run build` - Compile TypeScript
- `npm start` - Start the server
- `npm run dev` - Start with nodemon (if configured)

## Payment Integration

The platform uses Stripe for payment processing. You'll need to:

1. Create a Stripe account
2. Obtain your API keys
3. Configure webhooks for payment confirmation
   - make sure the webhook URL points to `https://<your-domain>/api/payments/webhook`
4. Set up your `.env` file with the appropriate keys

## Troubleshooting

- **"Database disconnected. Cannot authenticate."**: This error occurs when the backend cannot connect to MongoDB. 
  1.  **Check if MongoDB is running**: Run `mongod` in a terminal or check Windows Services for "MongoDB Server".
  2.  **Run Diagnostics**: `cd backend && npx ts-node src/check_db.ts`. This script will check both MongoDB and PostgreSQL status.
  3.  **Check .env**: Ensure `MONGODB_URI` in `backend/.env` is correct (use `127.0.0.1` instead of `localhost` to avoid IPv6 issues).

- **PostgreSQL Connection Issues**: Ensure PostgreSQL is running on port 5432 and the credentials in `backend/.env` match your local setup.
- **Port Already in Use**: Check if another process is using ports 3000 or 5006 (backend port from your .env).
- **TypeScript Errors**: Run `npx tsc --noEmit` to check for compilation issues.

## Security Notes

- Never commit secret keys to version control
- Use environment variables for all sensitive data
- Implement proper validation and sanitization
- Regularly update dependencies

## Contributing

We welcome contributions to improve the platform. Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
# Bitespeed Identity Reconciliation Service

A Node.js/TypeScript web service that identifies and consolidates customer contact information across multiple purchases using email addresses and phone numbers.

## Live API Endpoint
- **Production**: `https://bitespeed-identity-reconciliation.onrender.com/identify` (Will be updated after deployment)
- **Method**: POST
- **Content-Type**: application/json

## **Testing Status**
All test scenarios have been validated:
- New primary contact creation
- Secondary contact linking via email/phone
- Contact querying by email/phone
- Primary contact consolidation (older primary wins)
- Response format compliance
- All business logic requirements met

## Features

- **Contact Reconciliation**: Links customer contacts using email or phone number
- **Primary-Secondary Hierarchy**: Maintains oldest contact as primary, newer ones as secondary
- **Dynamic Linking**: Converts primary contacts to secondary when they get linked
- **PostgreSQL Database**: Uses Sequelize ORM with TypeScript decorators
- **RESTful API**: Single `/identify` endpoint for all operations

## Technology Stack

- **Backend**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **ORM**: Sequelize-TypeScript with decorators
- **Environment**: dotenv for configuration

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bitespeed-identity-reconciliation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup PostgreSQL database**
   ```sql
   CREATE DATABASE bitespeed_db;
   ```

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://username:password@localhost:5432/bitespeed_db
   NODE_ENV=development
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

6. **API will be available at**: `http://localhost:3000`

## API Usage

### Endpoint: POST /identify

**Request Body:**
```json
{
  "email": "example@email.com",
  "phoneNumber": "1234567890"
}
```

**Response:**
```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["lorraine@hillvalley.edu", "mcfly@hillvalley.edu"],
    "phoneNumbers": ["123456"],
    "secondaryContactIds": [23]
  }
}
```

## Database Schema

### Contact Table
```typescript
{
  id: number;                    // Primary key, auto-increment
  phoneNumber: string?;          // Optional phone number
  email: string?;               // Optional email address
  linkedId: number?;            // ID of linked primary contact
  linkPrecedence: "primary" | "secondary"; // Contact hierarchy
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
  deletedAt: Date?;             // Soft delete timestamp
}
```

## Business Logic Examples

### Case 1: New Customer
**Request:**
```json
{
  "email": "newcustomer@example.com",
  "phoneNumber": "9876543210"
}
```

**Result:** Creates new primary contact

### Case 2: Linking Contacts
**Existing Contact:**
```json
{
  "id": 1,
  "email": "lorraine@hillvalley.edu",
  "phoneNumber": "123456",
  "linkPrecedence": "primary"
}
```

**New Request:**
```json
{
  "email": "mcfly@hillvalley.edu",
  "phoneNumber": "123456"
}
```

**Result:** Creates secondary contact linked to primary (same phone number)

### Case 3: Primary Consolidation
When two primary contacts get linked through a new request, the older primary remains primary and the newer one becomes secondary.

## Testing

### Manual Testing with curl
```bash
# Test new contact creation
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phoneNumber":"1234567890"}'

# Test contact linking
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{"email":"another@example.com","phoneNumber":"1234567890"}'

# Health check
curl http://localhost:3000/
```

### Test Cases Covered
- New contact creation
- Contact linking via email
- Contact linking via phone number
- Primary contact consolidation
- Secondary contact creation
- Duplicate request handling

## Deployment

### Using Render.com (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: Bitespeed Identity Reconciliation Service"
   git push origin main
   ```

2. **Deploy on Render**
   - Sign up at [render.com](https://render.com)
   - Create new Web Service
   - Connect your GitHub repository
   - Set environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `NODE_ENV`: production

3. **Database Setup**
   - Use Render's PostgreSQL addon or external service
   - Update `DATABASE_URL` in environment variables

### Environment Variables for Production
```env
PORT=3000
DATABASE_URL=postgresql://user:password@hostname:port/database
NODE_ENV=production
```

## Project Structure
```
bitespeed-identity-reconciliation/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── controllers/
│   │   └── identifyController.ts # Request handlers
│   ├── models/
│   │   └── Contact.ts           # Sequelize model
│   ├── routes/
│   │   └── identifyRoute.ts     # API routes
│   ├── services/
│   │   └── contactService.ts    # Business logic
│   └── index.ts                 # Application entry point
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## Development Notes

- Uses TypeScript strict mode for type safety
- Sequelize with TypeScript decorators for clean model definitions
- Comprehensive error handling and validation
- Proper database connection management
- CORS enabled for cross-origin requests

## License

This project is licensed under the ISC License.

## Issue Reporting

If you find any bugs or have feature requests, please create an issue on GitHub with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details

---

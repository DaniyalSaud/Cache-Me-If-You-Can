# Payment API Connection Fix

## Issues Identified

### 1. **Backend Not Running**
The error `ERR_CONNECTION_REFUSED` indicates the backend server is not running on port 8000.

### 2. **Missing Environment Configuration**
The backend requires a `.env` file that was not present in the repository.

### 3. **Import Errors in Payment Controller**
- Missing `.js` extension in asyncHandler import
- Wrong model file name (`payment.model.js` should be `payment.models.js`)
- Missing named export syntax for Payment and User models

### 4. **Missing Mongoose Import in Payment Model**
The payment model was missing the mongoose import.

## Fixes Applied

### ✅ Fixed Import Issues
**File: `Backend/src/controllers/payment.controller.js`**
```javascript
// Before:
import { asyncHandler } from "../utils/asyncHandler";
import Payment from "../models/payment.model.js";
import User from "../models/user.models.js";

// After:
import { asyncHandler } from "../utils/asyncHandler.js";
import { Payment } from "../models/payment.models.js";
import { User } from "../models/user.models.js";
```

### ✅ Fixed Payment Model
**File: `Backend/src/models/payment.models.js`**
```javascript
// Added mongoose import
import mongoose, {Schema} from 'mongoose';
```

### ✅ Created Environment Template
**File: `Backend/.env.example`**
Created a template for required environment variables.

## Steps to Start the Backend

1. **Create `.env` file in the Backend directory:**
   ```bash
   cd Backend
   cp .env.example .env
   ```

2. **Update the `.env` file with your actual values:**
   ```env
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/your-database-name
   CORS_ORIGIN=http://localhost:5173
   ACCESS_TOKEN_SECRET=your-secret-key-here
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your-refresh-secret-here
   REFRESH_TOKEN_EXPIRY=10d
   ```

3. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

5. **Verify the server is running:**
   You should see: `⚙️  Server is running on port 8000`

## Testing the Payment Endpoint

Once the backend is running, you can test the endpoint:

```bash
# Test Easypaisa number endpoint
curl http://localhost:8000/api/v/payments/easypaisa-number
```

Expected response:
```json
{
  "easypaisaNumber": "03001234567"
}
```

## Additional Notes

- Make sure MongoDB is running before starting the backend
- The Easypaisa number is fetched from the first admin user in the database
- Ensure you have at least one admin user seeded in your database
- The frontend is configured to connect to `http://localhost:8000` by default

## Troubleshooting

If you still get connection errors:

1. **Check if port 8000 is available:**
   ```powershell
   netstat -ano | findstr :8000
   ```

2. **Check MongoDB connection:**
   Ensure MongoDB is running and the connection string in `.env` is correct

3. **Check CORS settings:**
   Make sure `CORS_ORIGIN=http://localhost:5173` matches your frontend port

4. **Check for import errors:**
   Look at the terminal where backend is running for any error messages

# Quick Reference - Lavoro AI Ferri Test Environment

## 🚀 Quick Start Commands

```bash
# Start backend
npm run dev

# Seed complete test data (run once)
./seed-test-data.sh

# Test all textile APIs
./test-textile-operations.sh
```

---

## 🔑 Login Credentials

### Main Test User (Permanent)
```
Email: test@lavoro.com
Phone: +919876543210
Password: Test@123
```

### Main User (Owns All 5 Companies)
```
test{TIMESTAMP}@lavoro.com → Owns all 5 companies:
  1. Premium Textiles Ltd (Textile Manufacturing)
  2. Fashion Garments Co (Garment Production)
  3. Quality Fabrics Inc (Fabric Processing)
  4. ColorTech Dyeing (Dyeing & Finishing)
  5. Design Studio Pro (Apparel Design)

Password: Test@123

Note: Email is generated using timestamp (e.g., test1764833405@lavoro.com)
Check script output for the actual email after running seed-test-data.sh
```

### Employee Users (After Seeding)
```
employee{N}_{TIMESTAMP}@lavoro.com (N = 1 to 15)
Password: Test@123
All invited to Company 1 (Premium Textiles Ltd) with roles:
  - ADMIN: employees 1, 4, 7, 10, 13
  - MANAGER: employees 2, 5, 8, 11, 14
  - EMPLOYEE: employees 3, 6, 9, 12, 15

Example: employee1_1764833405@lavoro.com
Check script output for actual emails
```

---

## 📊 Seeded Data Summary

| Item | Count | Notes |
|------|-------|-------|
| Main User | 1 | test1@lavoro.com (owns all companies) |
| Companies | 5 | Different industries, all owned by test1 |
| Locations | 6 extra | 3 each for Companies 1 & 2 |
| Products | 50 | 35 (Co. 1), 15 (Co. 2) |
| Customers | 50 | 10 per company |
| Suppliers | 50 | 10 per company |
| Employee Users | 15 | employee1-15@lavoro.com |
| Invitations | 15 | All accepted in Company 1 (one per employee) |
| Quality Items | 45 | 3 each type × 5 companies |
| Textile Ops | 125 | 5 each type × 5 companies |

---

## 🌐 API Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
```bash
# Register
POST /auth/register

# Login
POST /auth/login
```

### Company Management
```bash
# Get companies
GET /companies

# Create company
POST /companies

# Switch company
POST /companies/:id/switch
```

### Textile Operations
```bash
GET/POST /textile/fabrics
GET/POST /textile/yarns
GET/POST /textile/dyeing
GET/POST /textile/garments
GET/POST /textile/designs
```

---

## 🧪 Testing Scenarios

### Test Multi-Company Access (Same Owner)
1. Login as `test1@lavoro.com`
2. View Company 1 data
3. Switch to Company 2 using company switcher
4. Verify Company 2 data is separate
5. Test switching between all 5 companies

### Test Role-Based Access
1. Login as `employee1@lavoro.com`
2. Access Company 1
3. Verify role-specific permissions

### Test Textile Operations
1. Login as any company owner
2. Navigate to Textile Operations menu
3. View/Edit/Delete records

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `seed-test-data.sh` | Creates complete test environment |
| `test-textile-operations.sh` | Tests all textile APIs |
| `TEST_CREDENTIALS.md` | Detailed credential information |
| `DATA_SEEDING_GUIDE.md` | Complete seeding documentation |
| `QUICK_REFERENCE.md` | This file |

---

## 🔧 Troubleshooting

### Backend not responding
```bash
# Check if running
curl http://localhost:3000/health

# Restart
npm run dev
```

### Database issues
```bash
# Check connection
psql -U nivetharamdev -d lavoro_ai_ferri -c "SELECT 1;"

# Reset database
npm run db:reset
```

### Script permission denied
```bash
chmod +x seed-test-data.sh
chmod +x test-textile-operations.sh
```

---

## 📝 Notes

- All test users use password: `Test@123`
- Seeding script takes 2-3 minutes
- **No need to clear database between runs** - uses timestamp-based unique emails
- Each run creates completely new users and companies
- API test script creates temporary users
- Frontend runs on: `http://localhost:5173`
- Backend runs on: `http://localhost:3000`

---

## 🎯 Common Tasks

### Create a new test user
```bash
curl -X POST "http://localhost:3000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@test.com",
    "phone": "+919999999999",
    "password": "Test@123",
    "firstName": "New",
    "lastName": "User"
  }'
```

### Login and get token
```bash
curl -X POST "http://localhost:3000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "test@lavoro.com",
    "password": "Test@123"
  }'
```

### Create a company
```bash
curl -X POST "http://localhost:3000/api/v1/companies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My Company",
    "slug": "my-company",
    "industry": "textile_manufacturing",
    "country": "India",
    "establishedDate": "2024-01-01",
    "businessType": "PRIVATE_LIMITED",
    "defaultLocation": "HQ",
    "addressLine1": "123 Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "contactInfo": "{\"email\": \"contact@company.com\", \"phone\": \"+919876543210\"}"
  }'
```

---

**For detailed information, see the full documentation files!**

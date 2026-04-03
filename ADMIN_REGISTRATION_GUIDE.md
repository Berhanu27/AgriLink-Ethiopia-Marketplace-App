# AgriLink - Admin Registration Guide

## Setup Key
**AGRILINK_ADMIN_2024**

Keep this key secure! It's required to create the first admin account.

---

## How to Register as Admin

### Step 1: Access the Admin Setup Page
Go to: **http://localhost:3000/admin-setup**

### Step 2: Enter Setup Key
- You'll see a page asking for the "Setup Key"
- Enter: `AGRILINK_ADMIN_2024`
- Click "Verify Setup Key"

### Step 3: Fill Registration Form
After the key is verified, fill in your details:
- **Full Name**: Your name
- **Phone Number**: Your phone (this will be your username)
  - Example: `+251911234567`
- **Email**: Your email address
- **Password**: Create a strong password (min 6 characters)
- **Confirm Password**: Re-enter your password

### Step 4: Create Account
- Click "Create Admin Account"
- Wait for confirmation
- You'll be redirected to the login page

### Step 5: Login
- Go to: **http://localhost:3000/login**
- Enter your phone number and password
- You're now logged in as admin!

---

## Security Features

1. **Setup Key Protection**: The registration form is protected by a setup key
2. **One-Time Setup**: Only ONE admin can be created through this form
3. **Verified Status**: Admin account is automatically verified
4. **Full Permissions**: Admin has access to all platform features

---

## What You Can Do as Admin

- View all registered users
- See statistics by role (farmers, buyers, transporters, cooperatives)
- Verify/approve user accounts
- Manage listings
- Handle disputes
- Access platform analytics

---

## Troubleshooting

### "Invalid setup key"
- Make sure you're typing: `AGRILINK_ADMIN_2024` (case-sensitive)
- Copy and paste it to avoid typos

### "Admin user already exists"
- An admin has already been created
- Use the regular login page instead
- If you forgot credentials, contact database administrator

### "Failed to create admin account"
- Make sure backend is running on port 8080
- Check backend logs for errors
- Verify database connection

---

## Important Notes

- The setup key is: **AGRILINK_ADMIN_2024**
- Keep this key confidential
- Only share with authorized personnel
- After creating admin, regular users register through the normal registration page
- Admin registration is a one-time process

---

## Quick Start

1. Start backend (IntelliJ)
2. Start frontend (`npm run dev`)
3. Go to http://localhost:3000/admin-setup
4. Enter setup key: `AGRILINK_ADMIN_2024`
5. Fill in your details
6. Create account
7. Login at http://localhost:3000/login

Done!

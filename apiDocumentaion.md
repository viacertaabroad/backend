# API Documentation Viacerta-Abroad

## Table of Contents

- [API Documentation Viacerta-Abroad](#api-documentation-viacerta-abroad)
  - [Table of Contents](#table-of-contents)
- [Base URL : http://localhost:8000/api/](#base-url--httplocalhost8000api)
- [Endpoints](#endpoints)
  - [Authentication](#authentication)
  - [User Endpoints](#user-endpoints)
      - [Sign Up](#sign-up)
      - [Request Body for form](#request-body-for-form)
      - [Verify OTP](#verify-otp)
      - [Login](#login)
      - [Get User Profile](#get-user-profile)
      - [Update Password](#update-password)
      - [Forgot Password](#forgot-password)
      - [Reset Password](#reset-password)
      - [Logout](#logout)
  - [Error Responses](#error-responses)
  - [Common status codes:](#common-status-codes)

#  Base URL : http://localhost:8000/api/


#  Endpoints
## Authentication

Most endpoints require authentication via JWT token. The token should be included in the request cookies automatically after login/signup.

## User Endpoints

All user-related endpoints for authentication and profile management.

#### Sign Up

**URL**: `/signup`  
**Method**: `GET`  
**Access**: Public

#### Request Body for form

```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "mobile": "string (required, 10 digits)",
  "password": "string (required)",
  "address": {
    "pinCode": "string",
    "city": "string",
    "state": "string",
    "country": "string"
  },
  "role": "string (enum: ['user', 'admin'], default: 'user')"
}
```

Success Response

```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete sign-up."
}
```

Error Responses

```json
400: Missing required fields
409: User already exists
500: Internal server error
```

#### Verify OTP

**URL**: `/signupverify`  
**Method**: `POST`  
**Access**: Public

Request Body

```json
{
  "email": "string (required)",
  "otp": "string (required)"
}
```

Success Response

```json
{
  "success": true,
  "message": "OTP verified successfully.",
  "description": "User Signed Up and logged In.",
  "user": {
    "id": "string",
    "email": "string",
    "mobile": "string",
    "role": "string",
    "isVerified": "boolean"
  }
}
```

Error Responses

```json
400: Missing email or OTP
401: Invalid or expired OTP
404: User not found
500: Internal server error
```

#### Login

**URL**: `/login`  
**Method**: `POST`  
**Access**: Public

Request Body (Email Login)

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

Success Response (Email Login)

```json
{
  "success": true,
  "message": "Logged-In successful.",
  "userId": "string"
}
```

Error Responses

```json
400: Invalid credentials format
401: Invalid credentials
403: User not verified
404: User not found
500: Internal server error
```

#### Get User Profile

**URL**: `/me`  
**Method**: `GET`  
**Access**: Private (Requires authentication)

Success Response

```json
{
  "success": true,
  "message": "Protected route accessed",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "mobile": "string",
    "address": {
      "pinCode": "string",
      "city": "string",
      "state": "string",
      "country": "string"
    },
    "role": "string",
    "isVerified": "boolean",
    "isMobileVerified": "boolean",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

Error Responses

```json
401: Unauthorized
404: User not found
500: Internal server error
```

**URL**: `/update_profile`  
**Method**: `PUT`  
**Access**: Private (Requires authentication)

Request Body

```json
{
  "name": "string",
  "email": "string",
  "mobile": "string",
  "address": {
    "pinCode": "string",
    "city": "string",
    "state": "string",
    "country": "string"
  },
  "role": "string"
}
```

Success Response

```json
{
  "success": true,
  "message": "User updated successfully.",
  "user": {
    // Updated user object
  }
}
```

```json
Error Responses
400: Invalid data
401: Unauthorized
404: User not found
500: Internal server error
```

#### Update Password

**URL**: `/update_password`  
**Method**: `PUT`  
**Access**: Private (Requires authentication)

Request Body

```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required)"
}
```

Success Response

```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

Error Responses

```json
400: Missing fields
401: Wrong password/Unauthorized
404: User not found
500: Internal server error
```

#### Forgot Password

**URL**: `/forgot-password`  
**Method**: `POST`  
**Access**: Public

Request Body

```json
{
  "email": "string (required)"
}
```

Success Response

```json
{
  "success": true,
  "message": "OTP sent to your registered email."
}
```

Error Responses

```json
400: Missing email
404: User not found
500: Internal server error
```

#### Reset Password

**URL**: `/reset-password`  
**Method**: `POST`  
**Access**: Public

Request Body

```json
{
  "email": "string (required)",
  "otp": "string (required)",
  "newPassword": "string (required)"
}
```

Success Response

```json
{
  "success": true,
  "message": "Password reset successfully, Log in again with new Password."
}
```

Error Responses

```json
400: Missing fields
401: Invalid/expired OTP
404: User/OTP not found
500: Internal server error
```

#### Logout

**URL**: `/logout`  
**Method**: `POST`  
**Access**: Private (Requires authentication)

Success Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

Error Responses

```json
500: Internal server error
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (optional)",
  "description": "Additional context (optional)"
}
```

## Common status codes:

```json
400: Bad Request
401: Unauthorized
403: Forbidden
404: Not Found
409: Conflict
500: Internal Server Error
```

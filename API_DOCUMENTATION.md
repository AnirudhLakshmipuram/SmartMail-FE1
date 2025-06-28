# AI Email Auto-Responder API Documentation

## Overview

This document outlines all the APIs required for the AI Email Auto-Responder application. The APIs are organized by module and include authentication, email processing, AI integration, and configuration management.

## Base URL
```
https://api.email-autoresponder.com/v1
```

## Authentication

All API requests require authentication using Bearer tokens.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 1. Authentication APIs

### 1.1 User Registration
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "domain": "example.com" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "domain": "example.com",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### 1.2 User Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "domain": "example.com"
    },
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600
  }
}
```

### 1.3 Refresh Token
**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.4 Logout
**Endpoint:** `POST /auth/logout`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Category Management APIs

### 2.1 Get All Categories
**Endpoint:** `GET /categories`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_123",
      "name": "Customer Support",
      "description": "Handle customer support inquiries",
      "tone": "professional",
      "template": "Thank you for contacting our support team...",
      "custom_prompt": "Always be empathetic and solution-focused",
      "color": "bg-blue-500",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 2.2 Create Category
**Endpoint:** `POST /categories`

**Request Body:**
```json
{
  "name": "Customer Support",
  "description": "Handle customer support inquiries",
  "tone": "professional",
  "template": "Thank you for contacting our support team...",
  "custom_prompt": "Always be empathetic and solution-focused",
  "color": "bg-blue-500"
}
```

### 2.3 Update Category
**Endpoint:** `PUT /categories/{category_id}`

**Request Body:**
```json
{
  "name": "Updated Customer Support",
  "description": "Updated description",
  "tone": "friendly",
  "template": "Updated template...",
  "custom_prompt": "Updated prompt",
  "color": "bg-green-500"
}
```

### 2.4 Delete Category
**Endpoint:** `DELETE /categories/{category_id}`

**Response:**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

## 3. Document Management APIs

### 3.1 Upload Document
**Endpoint:** `POST /documents/upload`

**Request:** Multipart form data
```
file: [binary file data]
categories: ["cat_123", "cat_456"]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "name": "company_policy.pdf",
    "type": "pdf",
    "size": 1024000,
    "upload_date": "2024-01-15T10:30:00Z",
    "categories": ["cat_123", "cat_456"],
    "processing_status": "processing"
  }
}
```

### 3.2 Get All Documents
**Endpoint:** `GET /documents`

**Query Parameters:**
- `category_id` (optional): Filter by category
- `type` (optional): Filter by document type
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "doc_123",
        "name": "company_policy.pdf",
        "type": "pdf",
        "size": 1024000,
        "upload_date": "2024-01-15T10:30:00Z",
        "categories": ["cat_123", "cat_456"],
        "processing_status": "completed",
        "content_preview": "This document contains..."
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

### 3.3 Get Document Content
**Endpoint:** `GET /documents/{document_id}/content`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_123",
    "name": "company_policy.pdf",
    "content": "Full document content here...",
    "metadata": {
      "word_count": 1500,
      "language": "en",
      "extracted_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

### 3.4 Delete Document
**Endpoint:** `DELETE /documents/{document_id}`

---

## 4. Email Integration APIs

### 4.1 Configure Gmail Integration
**Endpoint:** `POST /mailbox/configure`

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "app_password": "encrypted_app_password",
  "auto_reply_emails": ["support@company.com", "sales@company.com"],
  "confidence_threshold": 0.8,
  "enabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "config_123",
    "email": "user@gmail.com",
    "connection_status": "connected",
    "last_sync": "2024-01-15T10:30:00Z",
    "auto_reply_emails": ["support@company.com"],
    "confidence_threshold": 0.8,
    "enabled": true
  }
}
```

### 4.2 Test Gmail Connection
**Endpoint:** `POST /mailbox/test-connection`

**Request Body:**
```json
{
  "email": "user@gmail.com",
  "app_password": "encrypted_app_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connection_status": "success",
    "message": "Successfully connected to Gmail",
    "inbox_count": 150,
    "last_email_date": "2024-01-15T09:45:00Z"
  }
}
```

### 4.3 Get Mailbox Configuration
**Endpoint:** `GET /mailbox/configuration`

### 4.4 Update Mailbox Configuration
**Endpoint:** `PUT /mailbox/configuration`

---

## 5. Email Processing APIs

### 5.1 Get Inbox Emails
**Endpoint:** `GET /emails/inbox`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `filter` (optional): all, unread, starred, important
- `search` (optional): Search query

**Response:**
```json
{
  "success": true,
  "data": {
    "emails": [
      {
        "id": "email_123",
        "from": "customer@example.com",
        "from_name": "John Customer",
        "to": "support@company.com",
        "subject": "Need help with billing",
        "body": "I have a question about my invoice...",
        "html_body": "<p>I have a question about my invoice...</p>",
        "timestamp": "2024-01-15T10:30:00Z",
        "is_read": false,
        "is_starred": false,
        "has_attachments": true,
        "priority": "high",
        "category": "Customer Support",
        "labels": ["billing", "urgent"],
        "thread_id": "thread_123",
        "ai_analysis": {
          "category_prediction": "Customer Support",
          "confidence": 0.92,
          "sentiment": "neutral",
          "urgency": "high",
          "keywords": ["billing", "invoice", "help"]
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 200
    }
  }
}
```

### 5.2 Get Email Details
**Endpoint:** `GET /emails/{email_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "email_123",
    "from": "customer@example.com",
    "from_name": "John Customer",
    "to": "support@company.com",
    "subject": "Need help with billing",
    "body": "I have a question about my invoice...",
    "html_body": "<p>I have a question about my invoice...</p>",
    "timestamp": "2024-01-15T10:30:00Z",
    "is_read": false,
    "is_starred": false,
    "has_attachments": true,
    "priority": "high",
    "category": "Customer Support",
    "labels": ["billing", "urgent"],
    "thread": [
      {
        "id": "email_122",
        "from": "support@company.com",
        "subject": "Re: Need help with billing",
        "body": "Thank you for reaching out...",
        "timestamp": "2024-01-15T09:30:00Z"
      }
    ],
    "attachments": [
      {
        "id": "att_123",
        "name": "invoice.pdf",
        "size": 256000,
        "type": "application/pdf",
        "download_url": "/emails/email_123/attachments/att_123"
      }
    ]
  }
}
```

### 5.3 Mark Email as Read/Unread
**Endpoint:** `PATCH /emails/{email_id}/read-status`

**Request Body:**
```json
{
  "is_read": true
}
```

### 5.4 Star/Unstar Email
**Endpoint:** `PATCH /emails/{email_id}/star-status`

**Request Body:**
```json
{
  "is_starred": true
}
```

### 5.5 Archive Email
**Endpoint:** `POST /emails/{email_id}/archive`

### 5.6 Delete Email
**Endpoint:** `DELETE /emails/{email_id}`

---

## 6. AI Response Generation APIs

### 6.1 Generate AI Response
**Endpoint:** `POST /ai/generate-response`

**Request Body:**
```json
{
  "email_id": "email_123",
  "context": {
    "sender_history": true,
    "company_documents": true,
    "previous_conversations": true
  },
  "preferences": {
    "tone": "professional",
    "length": "medium",
    "include_signature": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response_id": "resp_123",
    "suggestion": "Dear John,\n\nThank you for reaching out regarding your billing inquiry...",
    "confidence": 0.92,
    "category": "Customer Support",
    "tone": "professional",
    "reasoning": "High confidence due to clear billing context. Used professional tone to match customer service standards.",
    "alternative_suggestions": [
      {
        "suggestion": "Hi John,\n\nI'd be happy to help with your billing question...",
        "tone": "friendly",
        "confidence": 0.87
      }
    ],
    "used_documents": ["doc_123", "doc_456"],
    "processing_time_ms": 1500
  }
}
```

### 6.2 Get AI Response History
**Endpoint:** `GET /ai/responses`

**Query Parameters:**
- `email_id` (optional): Filter by email
- `confidence_min` (optional): Minimum confidence score
- `page`, `limit`: Pagination

### 6.3 Approve AI Response
**Endpoint:** `POST /ai/responses/{response_id}/approve`

**Request Body:**
```json
{
  "edited_content": "Modified response content...",
  "send_immediately": true
}
```

### 6.4 Reject AI Response
**Endpoint:** `POST /ai/responses/{response_id}/reject`

**Request Body:**
```json
{
  "reason": "Tone not appropriate",
  "feedback": "Response was too formal for this customer"
}
```

---

## 7. Email Sending APIs

### 7.1 Send Reply
**Endpoint:** `POST /emails/{email_id}/reply`

**Request Body:**
```json
{
  "content": "Thank you for your inquiry...",
  "html_content": "<p>Thank you for your inquiry...</p>",
  "include_signature": true,
  "cc": ["manager@company.com"],
  "bcc": [],
  "attachments": ["att_123"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sent_email_id": "sent_123",
    "message_id": "msg_123",
    "sent_at": "2024-01-15T10:35:00Z",
    "status": "sent",
    "recipients": ["customer@example.com"],
    "delivery_status": "delivered"
  }
}
```

### 7.2 Send Forward
**Endpoint:** `POST /emails/{email_id}/forward`

**Request Body:**
```json
{
  "to": ["colleague@company.com"],
  "content": "Please handle this inquiry...",
  "include_original": true
}
```

### 7.3 Get Sent Emails
**Endpoint:** `GET /emails/sent`

---

## 8. Auto-Reply Configuration APIs

### 8.1 Get Auto-Reply Rules
**Endpoint:** `GET /auto-reply/rules`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rule_123",
      "email_address": "support@company.com",
      "enabled": true,
      "categories": ["cat_123", "cat_456"],
      "confidence_threshold": 0.8,
      "keywords": ["billing", "payment", "invoice"],
      "schedule": {
        "enabled": true,
        "timezone": "UTC",
        "business_hours": {
          "start": "09:00",
          "end": "17:00",
          "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
        }
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### 8.2 Create Auto-Reply Rule
**Endpoint:** `POST /auto-reply/rules`

**Request Body:**
```json
{
  "email_address": "support@company.com",
  "enabled": true,
  "categories": ["cat_123"],
  "confidence_threshold": 0.8,
  "keywords": ["billing", "payment"],
  "schedule": {
    "enabled": true,
    "timezone": "UTC",
    "business_hours": {
      "start": "09:00",
      "end": "17:00",
      "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]
    }
  }
}
```

### 8.3 Update Auto-Reply Rule
**Endpoint:** `PUT /auto-reply/rules/{rule_id}`

### 8.4 Delete Auto-Reply Rule
**Endpoint:** `DELETE /auto-reply/rules/{rule_id}`

### 8.5 Toggle Auto-Reply Rule
**Endpoint:** `PATCH /auto-reply/rules/{rule_id}/toggle`

**Request Body:**
```json
{
  "enabled": false
}
```

---

## 9. Logging and Analytics APIs

### 9.1 Get Activity Logs
**Endpoint:** `GET /logs`

**Query Parameters:**
- `type` (optional): sent, failed, pending, approved, rejected
- `email` (optional): Filter by email address
- `date_from`, `date_to` (optional): Date range
- `confidence_min`, `confidence_max` (optional): Confidence range
- `page`, `limit`: Pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_123",
        "timestamp": "2024-01-15T10:30:00Z",
        "type": "sent",
        "email": "customer@example.com",
        "subject": "Re: Billing inquiry",
        "confidence": 0.92,
        "action": "AI response sent automatically",
        "category": "Customer Support",
        "response_time_ms": 1500,
        "user_action": "approved",
        "metadata": {
          "original_email_id": "email_123",
          "response_id": "resp_123",
          "auto_sent": true
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 50,
      "total_items": 1000
    }
  }
}
```

### 9.2 Get Analytics Dashboard
**Endpoint:** `GET /analytics/dashboard`

**Query Parameters:**
- `period` (optional): 7d, 30d, 90d, 1y
- `timezone` (optional): User timezone

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_emails": 1500,
      "ai_responses_generated": 1200,
      "auto_sent": 800,
      "manually_approved": 400,
      "success_rate": 0.85,
      "average_confidence": 0.87,
      "average_response_time_ms": 1200
    },
    "trends": {
      "daily_volumes": [
        {
          "date": "2024-01-15",
          "emails_received": 45,
          "responses_sent": 38,
          "success_rate": 0.84
        }
      ]
    },
    "category_breakdown": [
      {
        "category": "Customer Support",
        "count": 600,
        "success_rate": 0.92,
        "average_confidence": 0.89
      }
    ],
    "confidence_distribution": {
      "high": 800,
      "medium": 300,
      "low": 100
    }
  }
}
```

### 9.3 Export Logs
**Endpoint:** `GET /logs/export`

**Query Parameters:**
- Same as Get Activity Logs
- `format`: csv, json, xlsx

**Response:** File download

---

## 10. System Configuration APIs

### 10.1 Get System Settings
**Endpoint:** `GET /settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "ai_model": "gpt-4",
    "default_confidence_threshold": 0.8,
    "max_response_length": 1000,
    "rate_limits": {
      "emails_per_hour": 100,
      "ai_requests_per_minute": 10
    },
    "security": {
      "encryption_enabled": true,
      "audit_logging": true,
      "session_timeout": 3600
    }
  }
}
```

### 10.2 Update System Settings
**Endpoint:** `PUT /settings`

---

## 11. Webhook APIs

### 11.1 Register Webhook
**Endpoint:** `POST /webhooks`

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["email.received", "response.generated", "response.sent"],
  "secret": "webhook_secret_key"
}
```

### 11.2 Get Webhooks
**Endpoint:** `GET /webhooks`

### 11.3 Delete Webhook
**Endpoint:** `DELETE /webhooks/{webhook_id}`

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes:
- `INVALID_REQUEST` (400): Bad request
- `UNAUTHORIZED` (401): Authentication required
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMITED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## Rate Limits

- Authentication: 10 requests per minute
- Email processing: 100 requests per hour
- AI generation: 50 requests per hour
- File uploads: 20 requests per hour

---

## Webhooks

The system sends webhooks for important events:

### Email Received
```json
{
  "event": "email.received",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "email_id": "email_123",
    "from": "customer@example.com",
    "subject": "Need help",
    "category_prediction": "Customer Support",
    "confidence": 0.92
  }
}
```

### Response Generated
```json
{
  "event": "response.generated",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "email_id": "email_123",
    "response_id": "resp_123",
    "confidence": 0.92,
    "auto_send_eligible": true
  }
}
```

### Response Sent
```json
{
  "event": "response.sent",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "email_id": "email_123",
    "response_id": "resp_123",
    "sent_email_id": "sent_123",
    "method": "automatic"
  }
}
```

---

## SDK Examples

### JavaScript/Node.js
```javascript
const EmailAutoResponder = require('@email-autoresponder/sdk');

const client = new EmailAutoResponder({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.email-autoresponder.com/v1'
});

// Generate AI response
const response = await client.ai.generateResponse({
  emailId: 'email_123',
  preferences: {
    tone: 'professional',
    length: 'medium'
  }
});

console.log(response.suggestion);
```

### Python
```python
from email_autoresponder import Client

client = Client(
    api_key='your_api_key',
    base_url='https://api.email-autoresponder.com/v1'
)

# Get inbox emails
emails = client.emails.get_inbox(
    filter='unread',
    limit=10
)

for email in emails:
    print(f"From: {email.from_name}, Subject: {email.subject}")
```

This comprehensive API documentation covers all the endpoints needed for the AI Email Auto-Responder application, including authentication, email processing, AI integration, configuration management, and analytics.
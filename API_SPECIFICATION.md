# API Specification - Premium Rentals App

This document outlines all the API endpoints needed for the Premium Rentals mobile app (Cranes + Trucks).

---

## Base URL
```
Your backend base URL (://youre.g., https-api.create.xyz)
```

---

## Trucks API

### 1. List Trucks
**GET** `/api/trucks/list`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (e.g., "available") |

**Response:**
```json
{
  "success": true,
  "trucks": [
    {
      "id": 1,
      "name": "Heavy Duty Tipper Truck",
      "tonnage": "25T",
      "price_per_hour": 2000,
      "location": "Mumbai Depot",
      "description": "Reliable tipper truck for construction materials",
      "images": ["https://example.com/truck1.jpg"],
      "availability_status": "available",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 2. Get Truck Details
**GET** `/api/trucks/{id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Truck ID |

**Response:**
```json
{
  "success": true,
  "truck": {
    "id": 1,
    "name": "Heavy Duty Tipper Truck",
    "tonnage": "25T",
    "price_per_hour": 2000,
    "location": "Mumbai Depot",
    "description": "Reliable tipper truck for construction materials",
    "images": ["https://example.com/truck1.jpg"],
    "availability_status": "available",
    "features": [
      "Professional drivers available",
      "Well maintained fleet",
      "24/7 support available",
      "All permits and insurance included"
    ]
  }
}
```

---

### 3. Create Truck
**POST** `/api/trucks/create`

**Request Body:**
```json
{
  "name": "Heavy Duty Tipper Truck",
  "tonnage": "25T",
  "price_per_hour": 2000,
  "location": "Mumbai Depot",
  "description": "Reliable tipper truck for construction materials"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Truck added successfully",
  "truck": {
    "id": 1,
    "name": "Heavy Duty Tipper Truck",
    "tonnage": "25T",
    "price_per_hour": 2000,
    "availability_status": "available"
  }
}
```

---

### 4. Delete Truck
**DELETE** `/api/trucks/{id}`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Truck ID |

**Response:**
```json
{
  "success": true,
  "message": "Truck deleted successfully"
}
```

---

## Truck Bookings API

### 5. Create Truck Booking
**POST** `/api/truck-bookings/create`

**Request Body:**
```json
{
  "truck_id": 1,
  "user_name": "John Doe",
  "user_phone": "+919876543210",
  "booking_date": "2026-03-20",
  "start_time": "09:00",
  "duration_hours": 8,
  "site_location": "Construction Site, Andheri East",
  "is_emergency": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Truck booking created successfully",
  "booking": {
    "id": 1,
    "booking_id": "TRK-20260320-001",
    "truck_id": 1,
    "truck_name": "Heavy Duty Tipper Truck",
    "user_name": "John Doe",
    "user_phone": "+919876543210",
    "booking_date": "2026-03-20",
    "start_time": "09:00",
    "duration_hours": 8,
    "site_location": "Construction Site, Andheri East",
    "is_emergency": false,
    "total_price": 16000,
    "status": "pending",
    "created_at": "2026-02-15T10:00:00Z"
  }
}
```

---

## Admin Analytics API (Updated)

### 6. Get Admin Analytics
**GET** `/api/admin/analytics`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalBookings": 150,
    "pendingBookings": 12,
    "totalRevenue": 2500000,
    "availableCranes": 8,
    "availableTrucks": 5,
    "recentBookings": [
      {
        "id": 1,
        "booking_id": "CRN-20260320-001",
        "crane_name": "Hydraulic Mobile Crane 14T",
        "truck_name": null,
        "user_name": "John Doe",
        "user_phone": "+919876543210",
        "booking_date": "2026-03-20",
        "total_price": 12000,
        "status": "pending"
      }
    ]
  }
}
```

---

## Database Schema (Recommended)

### Trucks Table
```sql
CREATE TABLE trucks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  tonnage VARCHAR(50) NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  images JSONB DEFAULT '[]',
  availability_status VARCHAR(50) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Truck Bookings Table
```sql
CREATE TABLE truck_bookings (
  id SERIAL PRIMARY KEY,
  booking_id VARCHAR(50) UNIQUE NOT NULL,
  truck_id INTEGER REFERENCES trucks(id),
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  site_location TEXT NOT NULL,
  is_emergency BOOLEAN DEFAULT FALSE,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Error Responses

All endpoints may return:

```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing fields)
- `404` - Not Found
- `500` - Server Error

---

## Implementation Notes

1. **Authentication**: Admin endpoints require JWT Bearer token in Authorization header
2. **Price Calculation**: Emergency bookings add 50% surcharge
3. **Booking ID Format**: 
   - Cranes: `CRN-YYYYMMDD-XXX`
   - Trucks: `TRK-YYYYMMDD-XXX`
4. **Image Handling**: Images are stored as JSON array of URLs
5. **Status Values**: `pending`, `approved`, `rejected`, `completed`, `cancelled`

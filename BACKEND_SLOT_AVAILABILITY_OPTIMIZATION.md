# Backend Change Request: Slot Availability Optimization

## Overview
This document outlines backend changes needed to optimize the appointment booking experience by improving how slot availability is fetched and displayed.

## Current Issue
The frontend currently makes individual API calls for each day in a week to check slot availability. This results in:
- Multiple API calls (up to 7 per week view)
- Slower loading times
- Higher server load
- Poor user experience when checking availability

## Proposed Backend Changes

### 1. New Endpoint: Get Week Slot Availability

**Endpoint:** `GET /docs/schedule/week-availability/:doctorId`

**Query Parameters:**
- `startDate` (required): Start date of the week (ISO format: YYYY-MM-DD)
- `endDate` (optional): End date of the week (ISO format: YYYY-MM-DD). If not provided, defaults to 7 days from startDate

**Response Format:**
```json
{
  "success": true,
  "data": {
    "doctorId": "doctor_id_here",
    "weekStart": "2024-01-15",
    "weekEnd": "2024-01-21",
    "availability": [
      {
        "date": "2024-01-15",
        "hasSlots": true,
        "slotCount": 8,
        "availableSlots": [
          {
            "startTime": "09:00",
            "endTime": "09:30",
            "available": true
          }
          // ... more slots
        ]
      },
      {
        "date": "2024-01-16",
        "hasSlots": false,
        "slotCount": 0,
        "availableSlots": []
      }
      // ... more dates
    ]
  }
}
```

**Benefits:**
- Single API call instead of 7 separate calls
- Faster response time
- Reduced server load
- Better user experience

### 2. Enhanced Existing Endpoint (Alternative Approach)

If creating a new endpoint is not preferred, enhance the existing endpoint:

**Endpoint:** `GET /docs/schedule/available-slots/:doctorId`

**New Query Parameters:**
- `date` (existing): Single date
- `dateRange` (new, optional): Date range in format "YYYY-MM-DD,YYYY-MM-DD"
- `weekStart` (new, optional): Start date of week, returns availability for entire week

**Example:**
```
GET /docs/schedule/available-slots/:doctorId?weekStart=2024-01-15
```

**Response Format (when weekStart is provided):**
```json
{
  "success": true,
  "data": {
    "weekStart": "2024-01-15",
    "weekEnd": "2024-01-21",
    "availability": [
      {
        "date": "2024-01-15",
        "hasSlots": true,
        "slots": [...]
      },
      // ... more dates
    ]
  }
}
```

### 3. Optimization Considerations

**Caching:**
- Consider caching slot availability for a short period (e.g., 5-10 minutes)
- Cache key: `doctor_availability_{doctorId}_{date}`
- Invalidate cache when appointments are booked/cancelled

**Performance:**
- Use database indexes on:
  - `doctorId`
  - `date`
  - `available` status
- Consider batch queries instead of individual queries per date

**Filtering:**
- Only return dates that are:
  - Not in the past
  - Within the requested date range
  - Have at least one available slot (if `hasSlots` filter is requested)

### 4. Error Handling

**Error Responses:**
```json
{
  "success": false,
  "error": "Doctor not found",
  "code": "DOCTOR_NOT_FOUND"
}
```

**Common Error Codes:**
- `DOCTOR_NOT_FOUND`: Doctor ID is invalid
- `INVALID_DATE_RANGE`: Date range is invalid or too large
- `SERVER_ERROR`: Internal server error

## Implementation Priority

### High Priority (Required for optimal UX)
1. New endpoint or enhanced endpoint for week availability
2. Proper error handling
3. Date range validation

### Medium Priority (Performance improvements)
1. Caching implementation
2. Database query optimization
3. Response compression

### Low Priority (Nice to have)
1. Real-time availability updates via WebSocket
2. Availability predictions/forecasts

## Testing Requirements

### Unit Tests
- Test endpoint with valid doctor ID and date range
- Test endpoint with invalid doctor ID
- Test endpoint with invalid date range
- Test endpoint with doctor having no slots
- Test endpoint with doctor having slots on some days only

### Integration Tests
- Test with multiple concurrent requests
- Test cache invalidation on appointment booking
- Test performance with large date ranges

### Manual Testing
- Verify response format matches specification
- Verify all dates in range are included
- Verify `hasSlots` flag is accurate
- Verify slot count is accurate

## Migration Plan

### Phase 1: Backend Implementation
1. Implement new endpoint or enhance existing one
2. Add unit tests
3. Add integration tests
4. Deploy to staging environment

### Phase 2: Frontend Integration
1. Update frontend to use new endpoint
2. Keep old endpoint as fallback
3. Test in staging environment

### Phase 3: Production Deployment
1. Deploy backend changes
2. Deploy frontend changes
3. Monitor performance and errors
4. Remove old endpoint calls after verification

## API Documentation Updates

Update API documentation to include:
- New endpoint specification
- Request/response examples
- Error codes
- Rate limiting information (if applicable)

## Notes

- The frontend currently handles the case where no slots are available gracefully
- The frontend will continue to work with the existing endpoint if backend changes are not implemented immediately
- Consider rate limiting for the new endpoint to prevent abuse
- Consider adding analytics to track usage patterns

## Questions for Backend Team

1. What is the preferred approach: new endpoint or enhanced existing endpoint?
2. What caching strategy should be used?
3. What is the maximum date range that should be supported?
4. Are there any rate limiting requirements?
5. What is the expected response time for a week's worth of data?


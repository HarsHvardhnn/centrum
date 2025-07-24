# Appointment Reschedule Implementation

## Overview
This document describes the complete reschedule functionality that has been implemented in the patient list component within the dashboard.

## Features Implemented

### 1. Reschedule Modal Component (`src/components/Dashboard/RescheduleModal.jsx`)
- **Complete UI**: Modern, responsive modal with date picker and time slot selection
- **Available Slots Integration**: Fetches and displays available time slots for selected dates
- **Validation**: Comprehensive validation for date, time, and doctor ID
- **Error Handling**: User-friendly error messages and loading states
- **Consultation Type**: Support for both offline and online consultation types

### 2. Patient List Integration (`src/components/Dashboard/index.jsx`)
- **Role-Based Access**: Reschedule option only visible to admin and receptionist users
- **Status Filtering**: Only shows reschedule option for "booked" appointments
- **Dropdown Menu**: Integrated into existing action menu with Clock icon
- **State Management**: Proper state handling for modal visibility and appointment data

## Complete Flow

### 1. User Initiates Reschedule
- Admin/receptionist clicks "Przełóż wizytę" (Reschedule appointment) in dropdown menu
- Modal opens with current appointment details

### 2. Date and Time Selection
- User selects new date from 7-day calendar
- System fetches available slots for selected date
- User selects available time slot
- User can choose consultation type (offline/online)

### 3. Validation and Submission
- System validates all required fields
- Checks for doctor ID availability
- Submits reschedule request to API
- Handles success/error responses

### 4. Success Handling
- Shows success toast notification
- Updates local appointment data
- Refreshes patient list
- Closes modal

## API Integration

### Available Slots API
```javascript
GET /docs/schedule/available-slots/{doctorId}?date={date}
```

### Reschedule API
```javascript
PATCH /appointments/{appointmentId}/reschedule
{
  "newDate": "2024-01-20",
  "newStartTime": "14:30",
  "consultationType": "offline"
}
```

## User Interface

### Modal Features
- **Header**: Clear title and description with calendar icon
- **Current Appointment Info**: Shows patient name, current date, and time
- **Consultation Type**: Radio buttons for offline/online selection
- **Date Picker**: 7-day calendar with visual selection
- **Time Slots**: Grid of available time slots with loading states
- **Error Display**: Red error messages for validation issues
- **Action Buttons**: Cancel and reschedule buttons with loading states

### Responsive Design
- Mobile-friendly layout
- Proper spacing and typography
- Loading spinners and disabled states
- Smooth transitions and hover effects

## Error Handling

### Common Error Scenarios
1. **No Doctor ID**: Shows error when doctor ID cannot be found
2. **No Available Slots**: Displays message when no slots are available
3. **API Errors**: Shows specific error messages from backend
4. **Validation Errors**: Prevents submission with invalid data

### User Feedback
- Toast notifications for success/error
- Loading states during API calls
- Disabled buttons when appropriate
- Clear error messages in Polish

## Security Features

### Role-Based Access
- Only admin and receptionist can see reschedule option
- Proper authorization checks
- Input validation and sanitization

### Data Validation
- Date format validation
- Time slot availability checks
- Doctor ID verification
- Appointment status validation

## Technical Implementation

### State Management
```javascript
const [showRescheduleModal, setShowRescheduleModal] = useState(false);
const [selectedAppointment, setSelectedAppointment] = useState(null);
```

### Event Handlers
```javascript
const handleRescheduleClick = (appointment) => {
  setSelectedAppointment(appointment);
  setShowRescheduleModal(true);
};

const handleRescheduleSuccess = (rescheduledData) => {
  // Update local state and refresh list
};
```

### API Integration
```javascript
const response = await appointmentHelper.rescheduleAppointment(
  appointment._id,
  rescheduleData
);
```

## Testing Checklist

- [ ] Reschedule option appears for admin/receptionist only
- [ ] Modal opens with correct appointment data
- [ ] Date picker shows next 7 days
- [ ] Available slots load correctly
- [ ] Time slot selection works
- [ ] Validation prevents invalid submissions
- [ ] Success flow updates appointment data
- [ ] Error handling shows appropriate messages
- [ ] Modal closes properly after success/cancel

## Future Enhancements

1. **Doctor Name Resolution**: Handle cases where doctor field contains name instead of ID
2. **Bulk Reschedule**: Allow rescheduling multiple appointments
3. **Recurring Appointments**: Support for rescheduling recurring appointments
4. **Notification Preferences**: Allow users to choose notification settings
5. **Audit Trail**: Track reschedule history and reasons

## Files Modified

1. **src/components/Dashboard/RescheduleModal.jsx** (New)
   - Complete reschedule modal component
   - Available slots integration
   - Form validation and submission

2. **src/components/Dashboard/index.jsx** (Modified)
   - Added reschedule state management
   - Integrated reschedule option in dropdown menu
   - Added success handler for reschedule

## Dependencies

- **Lucide React**: Icons (Calendar, Clock, User, etc.)
- **Sonner**: Toast notifications
- **Axios**: API calls via apiCaller utility
- **Radix UI**: Dropdown menu components

## Browser Support

- Modern browsers with ES6+ support
- Responsive design for mobile devices
- Accessibility features included 
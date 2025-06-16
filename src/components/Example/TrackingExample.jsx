import React from 'react';
import { useGoogleAnalytics } from '../Analytics/GoogleAnalytics';

// Example showing how to integrate tracking into your existing components
const TrackingExample = () => {
  const {
    trackEvent,
    trackAppointmentBooking,
    trackServiceView,
    trackDoctorView,
    trackContactForm,
    trackPhoneCall,
    canTrack
  } = useGoogleAnalytics();

  // Example: Track appointment booking
  const handleAppointmentClick = (doctorId, serviceType) => {
    trackAppointmentBooking(doctorId, serviceType);
    // Your existing appointment booking logic here
  };

  // Example: Track service view
  const handleServiceClick = (serviceName) => {
    trackServiceView(serviceName);
    // Your existing service navigation logic here
  };

  // Example: Track phone call
  const handlePhoneClick = () => {
    trackPhoneCall();
    // Open phone dialer
    window.location.href = 'tel:797097487';
  };

  // Example: Track contact form submission
  const handleContactSubmit = (formData) => {
    trackContactForm('contact_page');
    // Your existing form submission logic here
  };

  // Example: Track custom events
  const handleCustomEvent = () => {
    trackEvent('custom_interaction', {
      interaction_type: 'button_click',
      button_name: 'special_offer',
      value: 1
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Google Analytics Tracking Examples</h2>
      
      {canTrack ? (
        <div className="text-green-600 mb-4">
          ✅ Analytics tracking is active (user consented)
        </div>
      ) : (
        <div className="text-orange-600 mb-4">
          ⚠️ Analytics tracking disabled (no consent or blocked)
        </div>
      )}

      <div className="space-y-4">
        <button 
          onClick={() => handleAppointmentClick('doctor-123', 'consultation')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Book Appointment (Tracked)
        </button>

        <button 
          onClick={() => handleServiceClick('cardiology')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          View Cardiology Service (Tracked)
        </button>

        <button 
          onClick={handlePhoneClick}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Call Now: 797-097-487 (Tracked)
        </button>

        <button 
          onClick={handleCustomEvent}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Custom Event (Tracked)
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">How to integrate tracking into your components:</h3>
        <pre className="text-sm overflow-x-auto">
{`// 1. Import the hook
import { useGoogleAnalytics } from '../Analytics/GoogleAnalytics';

// 2. Use in your component
const MyComponent = () => {
  const { trackEvent, trackAppointmentBooking } = useGoogleAnalytics();
  
  const handleClick = () => {
    trackEvent('button_click', { button_name: 'hero_cta' });
    // Your existing logic
  };
  
  return <button onClick={handleClick}>Book Appointment</button>;
};`}
        </pre>
      </div>
    </div>
  );
};

export default TrackingExample; 
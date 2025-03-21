import React from 'react';

const DoctorInfoCard = ({ doctor }) => {
  const {
    name,
    specialty,
    timeSlot,
    timeZone = 'BST',
    description,
    avatarUrl
  } = doctor;

  return (
    <div className="flex items-start p-4 bg-white rounded-lg">
      {/* Doctor Avatar */}
      <div className="mr-3">
        <img 
          src={avatarUrl} 
          alt={`Dr. ${name}`} 
          className="w-16 h-16 rounded-full object-cover border border-blue-100"
        />
      </div>
      
      {/* Doctor Information */}
      <div className="flex flex-col">
        {/* Name */}
        <h2 className="text-lg font-bold text-gray-800 mb-1">Dr. {name}</h2>
        
        {/* Specialty and Time Slot */}
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-4">
            <svg className="w-4 h-4 text-gray-500 mr-[6px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span className="text-gray-600 text-sm">{specialty}</span>
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-500 mr-[6px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-gray-600 text-sm">{timeSlot} {timeZone}</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-gray-600 text-sm leading-snug">{description}</p>
      </div>
    </div>
  );
};

export default DoctorInfoCard;

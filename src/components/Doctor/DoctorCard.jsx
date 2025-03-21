import React from "react";

const DoctorCard = ({ doctor }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-start border border-gray-100 mb-4">
      <div className="flex gap-6 items-center w-[60%]">
        <img 
          src={doctor.image} 
          alt={doctor.name} 
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-dark mb-2">{doctor.name}</h3>
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-gray-medium" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
            <span className="text-gray-medium">{doctor.specialty}</span>
            
            <svg className="w-5 h-5 text-gray-medium ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="text-gray-medium">{doctor.timing}</span>
            
            <svg className="w-5 h-5 text-gray-medium ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="text-gray-medium">{doctor.date}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-gray mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray">
              {doctor.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <button className="bg-primary-light text-white py-3 px-5 rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
          View Appointments
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
        
        <button className="text-gray-dark border border-gray-300 py-3 px-5 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
          View Doctor Details
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;

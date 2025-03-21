import DoctorDashboard from './DoctorDashboard';

function DoctorsPage() {
  // Sample data
  const doctorInfo = {
    name: "Ratul Ahamed",
    specialty: "Heart Specialist",
    timeSlot: "9:30am - 01:00am",
    timeZone: "BST",
    description: "Infectious Diseases Hub aims to provide up-to-date, essential research and on aspects of microbiology, virology, and parasitology.",
    avatarUrl: "/path/to/doctor-image.jpg"
  };
  
  const stats = {
    appointments: 165,
    newPatients: 102,
    surgery: 4,
    criticalPatients: 54
  };
  
  const patients = [
  ];
  
  const selectedPatient = {
    name: "Morshed Ali",
    patientId: "#85736733",
    avatar: "/path/to/patient-avatar.jpg",
    email: "Morshed@gmail.com",
    phone: "+8801780910722",
    lastChecked: "Dr. Derry on 20 November 2022",
    prescription: "#20151224-124",
    weight: "67 kg",
    bp: "120/80",
    pulseRate: "Normal",
    observation: "Left Fever and cough is normal.",
    medications: [
      { name: "Cap.ANTACID", dosage: "500mg 1+1+1", frequency: "After meal", duration: "X 5 Days" },
      { name: "Cap.DECILONE", dosage: "10mg 1+0", frequency: "After meal", duration: "X 5 Days" },
      { name: "Cap.LEVOLIN", dosage: "500mg 1+1+1", frequency: "After meal", duration: "X 5 Days" },
      { name: "Tab.METHAI", dosage: "10mg 1+0", frequency: "After meal", duration: "X 5 Days" }
    ],
    reports: {
      ecg: "/path/to/ecg-report.jpg",
      blood: {
        "WBC": "6.8", "RBC": "5.2", "HGB": "15.8", "HCT": "47.6", "MCV": "12.6", "MCH": "30.4"
      },
      xray: "/path/to/xray-report.jpg"
    }
  };
  
  return (
    <DoctorDashboard 
      doctor={doctorInfo}
      patients={patients}
      stats={stats}
      selectedPatient={selectedPatient}
      onPatientSelect={(id) => console.log(`Selected patient: ${id}`)}
      onDateSelect={(date) => console.log(`Selected date: ${date}`)}
      onSearch={(query) => console.log(`Search query: ${query}`)}
      onFilter={() => console.log('Filter clicked')}
      onBookAppointment={() => console.log('Book appointment clicked')}
    />
  );
}

export default DoctorsPage;

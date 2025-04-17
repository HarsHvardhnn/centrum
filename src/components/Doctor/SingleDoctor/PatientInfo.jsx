import React from "react";

const demoData = [
  {
    name: "Morshed Ali",
    age: 62,
    gender: "Male",
    email: "MorshedAli@mail.com",
    phone: "+8801718001122",
    bp: "120/80",
    pulse: "801m",
    weight: "62 Kg",
    lastChecked: "Dr- Everly on 20 November 2022",
    prescriptionId: "#20112022PO2S",
    observation: "High Fever and cough at normal.",
    tests: ["X-Ray", "Blood Test", "Urine Test", "Endoscopy"],
    prescriptions: [
      {
        name: "CALPOL",
        dosage: "500mg",
        pattern: "1 + 1 + 1",
        duration: "X 5 Days",
      },
      {
        name: "DELCON",
        dosage: "10mg",
        pattern: "0 + 1 + 0",
        duration: "X 3 Days",
      },
      {
        name: "LEVOLIN",
        dosage: "500mg",
        pattern: "1 + 1 + 1",
        duration: "X 5 Days",
      },
      {
        name: "ME-FTAL",
        dosage: "10mg",
        pattern: "0 + 1 + 0",
        duration: "X 3 Days",
      },
    ],
    ecgImage:
      "https://thumbs.dreamstime.com/b/heartbeat-normal-ecg-graph-illustration-electrocardiogram-ekg-diagnostic-tool-routinely-used-to-assess-71108214.jpg",
    xrayImage:
      "https://www.bhf.org.uk/-/media/images/information-support/tests/chest-x-ray/normal-chest-x-ray-620x400.jpg?h=400&w=620&rev=d9cfde6ea0a249649d60284ae972f2da&hash=116C2CF5D2AA30EC9CDCAE7712897203",
    bloodReport: {
      WBC: "5.5 [109/L]",
      RBC: "12.5 [109/L]",
      HGB: "136 [g/L]",
      HCT: "12.5 [L/L]",
      MCV: "12.5 [f/L]",
    },
  },
];

const PatientInfo = () => {
  return (
    <div className="bg-gray-50 ">
      {demoData.map((user, index) => (
        <div
          key={index}
          className=" rounded-2xl  max-w-5xl mx-auto flex flex-col gap-4"
        >
          <div className="border rounded-2xl p-4 bg-white">
            <div className="flex items-center space-x-6 mb-6 border-b pb-2 ">
              <div className="flex gap-2 w-full">
                <img
                  src="https://randomuser.me/api/portraits/men/75.jpg"
                  alt="User"
                  className="size-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold">{user.name}</h2>
                  <p className="text-xs">
                    {user.age} Years {user.gender}
                  </p>
                </div>
              </div>

              <p className="text-sm w-full flex flex-col border-l px-2">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p className="text-sm w-full flex flex-col border-l px-2">
                <span className="font-semibold">Phone:</span> {user.phone}
              </p>
            </div>

            <div className="flex gap-4 text-sm ">
              <div className="flex flex-col gap-8 w-1/3 border-r">
                <div className="flex flex-col gap-4">
                  <div>BP: {user.bp}</div>
                  <div>Pulse: {user.pulse}</div>
                  <div>Weight: {user.weight}</div>
                </div>
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Tests:</h3>
                  <ul className="list-disc list-inside space-y-4">
                    {user.tests.map((test, i) => (
                      <li key={i}>{test}</li>
                    ))}
                  </ul>
                </div>{" "}
              </div>
              <div className="flex flex-col gap-8 w-2/3">
                <div className="flex flex-col gap-4">
                  <div>Last Checked: {user.lastChecked}</div>
                  <div>Prescription ID: {user.prescriptionId}</div>
                  <div>Observation: {user.observation}</div>
                </div>
                <div className="mb-6 flex gap-2">
                  <h3 className=" mb-2">Prescription:</h3>
                  <div className="list-disc list-inside space-y-4">
                    {user.prescriptions.map((presc, i) => (
                      <p key={i}>
                        Cap {presc.name} {presc.dosage} {presc.pattern} -{" "}
                        {presc.duration}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className=" grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
            <div className="border rounded-2xl bg-white p-4 ">
              <h3 className="font-semibold mb-2 text-sm">ECG Report</h3>
              <div className="h-36">
                <img
                  src={user.ecgImage}
                  alt="ECG"
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="border rounded-2xl bg-white p-4">
              <h3 className="font-semibold mb-2 text-sm">Blood Report</h3>
              <div className="grid grid-cols-3 gap-2 text-sm  text-gray-500">
                {Object.entries(user.bloodReport).map(([key, val], i) => {
                  const [value, unit] = val.split(" ");
                  return (
                    <React.Fragment key={i}>
                      <div>{key}</div>
                      <div>{value}</div>
                      <div>{unit}</div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="border rounded-2xl bg-white p-4">
              <h3 className="font-semibold mb-2 text-sm">X-Ray Report</h3>

              <div className="h-36">
                <img
                  src={user.xrayImage}
                  alt="X-Ray"
                  className="rounded-lg w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PatientInfo;

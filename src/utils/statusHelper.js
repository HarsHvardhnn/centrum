export const translateStatus = (status) => {
  const statusMap = {
    completed: "Zakończona",
    checkedIn: "W trakcie wizyty",
    cancelled: "Anulowana",
    booked: "Zarezerwowana",
    billed: "Rozliczona"
  };
  
  return statusMap[status] || status;
};

export const getStatusStyle = (status) => {
  const styleMap = {
    completed: "bg-green-100 text-green-800",
    checkedIn: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    booked: "bg-yellow-100 text-yellow-800",
    billed: "bg-purple-100 text-purple-800"
  };
  
  return styleMap[status] || "bg-gray-100 text-gray-800";
}; 
import { useState } from "react";

export default function ServicesPricingComponent({ data }) {
  const [services, setServices] = useState(data.services || []);
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [priceError, setPriceError] = useState("");

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid positive numbers
    if (value === "" || (!isNaN(value) && Number(value) >= 0)) {
      setNewPrice(value);
      setPriceError("");
    } else {
      setPriceError("Cena musi być liczbą dodatnią");
    }
  };

  const handleAddService = () => {
    if (newService.trim() && newPrice.trim() && !isNaN(Number(newPrice))) {
      setServices([...services, { name: newService, price: newPrice }]);
      setNewService("");
      setNewPrice("");
      setPriceError("");
    } else if (!newPrice.trim() || isNaN(Number(newPrice))) {
      setPriceError("Wprowadź prawidłową cenę");
    }
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4">Usługi</h3>

      {/* Wyświetl istniejące usługi */}
      <div className="mb-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Usługa</th>
              <th className="border px-4 py-2 text-left">Cena</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, idx) => (
              <tr key={idx} className="even:bg-gray-50">
                <td className="border px-4 py-2">{service.name || service}</td>
                <td className="border px-4 py-2">{service.price || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formularz dodawania nowej usługi */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Nazwa usługi</label>
          <input
            type="text"
            value={newService}
            onChange={(e) => setNewService(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Wprowadź nazwę usługi"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Cena</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={newPrice}
            onChange={handlePriceChange}
            className={`w-full border rounded px-3 py-2 ${
              priceError ? "border-red-500" : ""
            }`}
            placeholder="Wprowadź cenę"
          />
          {priceError && (
            <p className="text-red-500 text-xs mt-1">{priceError}</p>
          )}
        </div>
        <button
          onClick={handleAddService}
          className="bg-primary-light text-white px-4 py-2 rounded hover:bg-primary"
        >
          Dodaj usługę
        </button>
      </div>
    </section>
  );
}

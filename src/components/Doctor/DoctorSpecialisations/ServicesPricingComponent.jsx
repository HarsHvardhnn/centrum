import { useState } from "react";

export default function ServicesPricingComponent({ data }) {
  const [services, setServices] = useState(data.services || []);
  const [newService, setNewService] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleAddService = () => {
    if (newService.trim() && newPrice.trim()) {
      setServices([...services, { name: newService, price: newPrice }]);
      setNewService("");
      setNewPrice("");
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
            type="text"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Wprowadź cenę"
          />
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

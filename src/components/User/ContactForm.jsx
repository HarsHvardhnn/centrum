import React, { useState } from "react";
import { apiCaller } from "../../utils/axiosInstance";

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await apiCaller("POST", "/api/contact", form);
      setStatus({ type: "success", message: "Wiadomość została wysłana!" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: "Wystąpił błąd podczas wysyłania. Spróbuj ponownie." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl shadow-md p-6 w-full h-full flex-1">
      <h3 className="md:text-xl font-bold text-neutral-800 mb-1">SKONTAKTUJ SIĘ Z NAMI</h3>
      <h2 className="text-3xl md:text-4xl font-bold text-main font-serif mb-6">
        Kontakt
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Imię i nazwisko"
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition w-full"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition w-full"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="text"
          name="subject"
          placeholder="Temat"
          className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition w-full"
          value={form.subject}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Wiadomość"
          className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-teal-500 transition w-full h-32 resize-none"
          value={form.message}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-colors text-lg"
          disabled={loading}
        >
          {loading ? "Wysyłanie..." : "Wyślij"}
        </button>
        {status.message && (
          <div className={`mt-2 text-center ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {status.message}
          </div>
        )}
      </form>
    </div>
  );
}

export default ContactForm;

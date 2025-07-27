import { FiPhoneCall } from "react-icons/fi";

export default function ScheduleCard() {
    return (
      <div className="max-w-md mx-auto bg-main text-white p-8 rounded-lg shadow-lg mt-12 ">
        <h2 className="text-3xl md:text-4xl font-semibold font-serif text-center text-purple-200 mb-4">Godziny przyjęć</h2>
        <div className="space-y-2">
          {[
            { day: "Poniedziałek", time: "09:00 - 19:00" },
            { day: "Wtorek", time: "09:00 - 19:00" },
            { day: "Środa", time: "09:00 - 19:00" },
            { day: "Czwartek", time: "09:00 - 19:00" },
            { day: "Piątek", time: "09:00 - 19:00" },
            { day: "Sobota", time: "09:00 - 19:00" },
            { day: "Niedziela", time: "Zamknięte" },
          ].map((item, index) => (
            <div key={index} className="flex justify-between border-b border-teal-600 py-2.5">
              <span>{item.day}</span>
              <span>—</span>
              <span>{item.time}</span>
            </div>
          ))}
        </div>
        <hr className="border-white my-4" />
        <div className="text-center">
          <p className="text-lg font-semibold text-purple-300 flex items-center justify-center gap-2">
            <span className="text-2xl"><FiPhoneCall/></span> Nagłe przypadki
          </p>
          <p className="text-lg text-purple-300">(+48) 681-812-255</p>
        </div>
      </div>
    );
  }
  
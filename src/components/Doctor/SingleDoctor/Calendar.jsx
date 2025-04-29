import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Calendar = ({ viewMode = "week", onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const changeDate = (direction) => {
    let newDate;
    if (viewMode === "month") {
      newDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1
      );
      setCurrentDate(newDate);
    } else if (viewMode === "week") {
      // Create a new date object to avoid mutation
      newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + direction * 7);
      setCurrentDate(newDate);
    }
  };

  const generateMonthDays = () => {
    const totalDays = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();
    return Array.from({ length: totalDays }, (_, i) => i + 1);
  };

  const generateWeekDays = () => {
    // Create a new date object to avoid mutation
    const dateCopy = new Date(currentDate);
    const startOfWeek = new Date(
      dateCopy.setDate(dateCopy.getDate() - dateCopy.getDay())
    );
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate() + i
      );
      return day;
    });
  };

  const daysToDisplay =
    viewMode === "month"
      ? generateMonthDays()
      : generateWeekDays().map((date) => date.getDate());

  const handleDateSelect = (day) => {
    setSelectedDay(day);

    // Create the selected date object
    let selectedDate;
    if (viewMode === "month") {
      selectedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
    } else {
      // For week view, find the actual date object from the week array
      selectedDate = generateWeekDays().find((date) => date.getDate() === day);
    }

          console.log("Selectsed date:", onDateSelect);

    // Call the onDateSelect prop with the updated date object
    if (onDateSelect && selectedDate) {
      console.log("Selected date:", selectedDate);
      onDateSelect(selectedDate);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full bg-gradient-to-b from-[#CCD0F86B] to-white rounded-xl px-2 py-3 shadow-sm border-[0.85px] border-[#D9EEEE]">
      <div className="text-gray-700 items-center justify-start px-4 text-md flex w-full font-bold">
        {viewMode === "month"
          ? currentDate.toLocaleString("default", { month: "long" })
          : `Week of ${new Date(currentDate).toLocaleString("default", {
              month: "long",
              day: "numeric",
            })}`}
      </div>

      <div className="relative flex items-center w-full">
        <button
          onClick={() => changeDate(-1)}
          className="absolute left-2 bg-primary-light p-[6px] rounded-full shadow-md hover:bg-primary flex items-center justify-center"
        >
          <ChevronLeft size={16} className="text-white" />
        </button>

        <div className="flex justify-evenly w-full items-center mx-8 overflow-x-auto whitespace-nowrap">
          {daysToDisplay.map((day, index) => {
            const dayOfWeek =
              viewMode === "month"
                ? new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day
                  ).getDay()
                : generateWeekDays()[index].getDay();

            const weekdayName = [
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ][dayOfWeek];

            return (
              <div
                key={`day-${day}`}
                className={`flex flex-col items-center justify-evenly cursor-pointer ${
                  day === selectedDay
                    ? "bg-[#7dd3c8] text-white border rounded-lg px-3 py-2"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => handleDateSelect(day)}
              >
                <div
                  className={`text-[12px] mb-[2px] ${
                    day === selectedDay ? "text-white" : "text-gray-500"
                  }`}
                >
                  {weekdayName}
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-md text-[15px] sm:text-s">
                  {day}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => changeDate(1)}
          className="absolute right-2 bg-primary-light p-[6px] rounded-full shadow-md hover:bg-primary flex items-center justify-center"
        >
          <ChevronRight size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Calendar;

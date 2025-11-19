import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export function DatePicker({
  date, // Date object or ISO string or null -> controlled if provided
  onDateChange, // function(Date|null)
  placeholder = "dd/mm/aaaa",
  className = ""
}) {
  const controlledDate = date ? (date instanceof Date ? date : new Date(date)) : null;
  const [internalDate, setInternalDate] = useState(controlledDate);
  const [currentMonth, setCurrentMonth] = useState(controlledDate || new Date());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // sync controlled value to internal state
    if (controlledDate) {
      setInternalDate(controlledDate);
      setCurrentMonth(new Date(controlledDate.getFullYear(), controlledDate.getMonth(), 1));
    }
  }, [controlledDate]);

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const dayNames = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];

  const getDaysInMonth = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    for (let i = 0; i < adjustedStartDay; i++) {
      const prevMonthDay = new Date(year, month, -adjustedStartDay + i + 1);
      days.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (d) => {
    // d is a Date
    if (onDateChange) {
      onDateChange(d);
    } else {
      setInternalDate(d);
    }
    setIsOpen(false);
  };

  const formatDate = (d) => {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isSelectedDate = (dateToCheck) => {
    const cmp = controlledDate || internalDate;
    if (!cmp) return false;
    return cmp.toDateString() === dateToCheck.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const displayedDate = controlledDate || internalDate;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors bg-white"
        type="button"
      >
        <span className={displayedDate ? "text-gray-700" : "text-gray-400"}>
          {displayedDate ? formatDate(displayedDate) : placeholder}
        </span>
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 z-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="font-semibold text-gray-800 capitalize">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((dn) => (
              <div key={dn} className="text-center text-xs font-semibold text-gray-600 py-1">
                {dn}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const disabled = !day.isCurrentMonth;
              const selected = isSelectedDate(day.date);
              return (
                <button
                  key={idx}
                  onClick={() => !disabled && handleDateSelect(day.date)}
                  disabled={disabled}
                  type="button"
                  className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                    ${disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'}
                    ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}`}
                >
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePicker;
import React, { useState } from 'react';
import './SimpleCalendar.css'; // We'll add styles soon

const SimpleCalendar = () => {
    const [date, setDate] = useState(new Date());

    const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...

    const month = date.getMonth();
    const year = date.getFullYear();
    const daysCount = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const renderDays = () => {
        const days = [];
        // Add empty cells for padding before the 1st day
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        // Add day cells
        for (let day = 1; day <= daysCount; day++) {
            const isToday = day === today && month === currentMonth && year === currentYear;
            days.push(
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    {day}
                </div>
            );
        }
        return days;
    };

    const goToPrevMonth = () => {
        setDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setDate(new Date(year, month + 1, 1));
    };

    return (
        <div className="simple-calendar">
            <div className="calendar-header">
                <button onClick={goToPrevMonth}>&lt;</button>
                <span>{monthNames[month]} {year}</span>
                <button onClick={goToNextMonth}>&gt;</button>
            </div>
            <div className="calendar-grid">
                <div className="calendar-weekday">Sun</div>
                <div className="calendar-weekday">Mon</div>
                <div className="calendar-weekday">Tue</div>
                <div className="calendar-weekday">Wed</div>
                <div className="calendar-weekday">Thu</div>
                <div className="calendar-weekday">Fri</div>
                <div className="calendar-weekday">Sat</div>
                {renderDays()}
            </div>
        </div>
    );
};

export default SimpleCalendar;
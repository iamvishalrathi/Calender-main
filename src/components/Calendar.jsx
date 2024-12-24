import React, { useState, useEffect } from 'react';
import moment from 'moment';
import './Calendar.css'; // Import custom styles
import EventModal from './EventModal';

const getEventColor = (eventType) => {
    switch (eventType) {
        case 'work':
            return '#4285f4';  // Blue for work
        case 'personal':
            return '#34a853';  // Green for personal
        case 'others':
            return '#fbbc05';  // Yellow for others
        default:
            return '#ccc';     // Default color
    }
};

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(moment());
    const [events, setEvents] = useState(JSON.parse(localStorage.getItem('events')) || []);
    const [selectedDay, setSelectedDay] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filterKeyword, setFilterKeyword] = useState('');
    const [alertMessage, setAlertMessage] = useState(''); // State for alert message

    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week');
    const endOfWeek = endOfMonth.clone().endOf('week');

    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
    }, [events]);

    const handleDayClick = (day) => {
        setSelectedDay(day);
        setSelectedEvent(null); // Clear selected event for new event creation
        setShowModal(true);
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const generateCalendarGrid = () => {
        const days = [];
        let day = startOfWeek.clone();
        while (day.isBefore(endOfWeek, 'day')) {
            days.push(day.clone());
            day.add(1, 'day');
        }

        days.push(day);
        return days;
    };

    const getEventsForDay = (day) => {
        return events.filter((event) => moment(event.day).isSame(day, 'day'));
    };

    const isToday = (day) => {
        return day.isSame(moment(), 'day');
    };

    const isWeekend = (day) => {
        return day.day() === 0 || day.day() === 6; // 0 for Sunday, 6 for Saturday
    };

    const handleAddEvent = (eventData) => {
        const newEventStart = moment(eventData.start);
        const newEventEnd = moment(eventData.end);

        const overlappingEvent = events.find((event) => {
            const existingEventStart = moment(event.start);
            const existingEventEnd = moment(event.end);

            return (
                newEventStart.isBetween(existingEventStart, existingEventEnd, null, '[)') ||
                newEventEnd.isBetween(existingEventStart, existingEventEnd, null, '(]') ||
                existingEventStart.isBetween(newEventStart, newEventEnd, null, '[)') ||
                existingEventEnd.isBetween(newEventStart, newEventEnd, null, '(]')
            );
        });

        if (overlappingEvent) {
            setAlertMessage('Event overlaps with an existing event!');
            return;
        }

        setEvents([...events, eventData]);
    };

    // Filter events by keyword
    const filteredEvents = events.filter((event) =>
        event.name.toLowerCase().includes(filterKeyword.toLowerCase())
    );

    return (
        <div className="calendar-container">
            <header className="calendar-header">
                <h2>{currentDate.format('MMMM YYYY')}</h2>
                <div className="calendar-navigation">
                    <button onClick={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}>
                        Prev
                    </button>
                    <button onClick={() => setCurrentDate(currentDate.clone().add(1, 'month'))}>
                        Next
                    </button>
                </div>

                <div className="calendar-filter">
                    <input
                        type="text"
                        placeholder="Search events"
                        value={filterKeyword}
                        onChange={(e) => setFilterKeyword(e.target.value)}
                        className="calendar-filter-input"
                    />
                    <button
                        onClick={() => setFilterKeyword('')}
                        className="calendar-filter-clear-button"
                    >
                        Clear
                    </button>
                    <div className="calendar-filter-result">
                        {filteredEvents.length} events found
                    </div>
                </div>
            </header>

            {alertMessage && (
                <div className="alert-message">
                    <div className="alert-box">
                        <span>{alertMessage}</span>
                        <button onClick={() => setAlertMessage('')}>X</button>
                    </div>
                </div>
            )}

            {/* Weekday Labels */}
            <div className="calendar-weekdays">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
                    <div key={weekday} className="weekday">
                        {weekday}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
                {generateCalendarGrid().map((day, index) => {
                    const isCurrentMonth = day.month() === currentDate.month();
                    const dayEvents = getEventsForDay(day);
                    const dayClass = `calendar-cell ${isCurrentMonth ? 'current-month' : 'other-month'
                        } ${isToday(day) ? 'today' : ''} ${isWeekend(day) ? 'weekend' : ''} ${selectedDay && selectedDay.isSame(day, 'day') ? 'selected' : ''
                        }`;

                    return (
                        <div
                            key={index}
                            className={dayClass}
                            onClick={() => handleDayClick(day)}
                        >
                            <div className="day-number">{day.date()}</div>
                            {dayEvents.filter(event =>
                                event.name.toLowerCase().includes(filterKeyword.toLowerCase())
                            ).map((event, idx) => (
                                <div
                                    key={idx}
                                    className="event"
                                    onClick={(e) => { e.stopPropagation(); handleEventClick(event); }}
                                    style={{
                                        backgroundColor: getEventColor(event.type),
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        marginTop: '4px'
                                    }}
                                >
                                    {event.name}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Event Modal */}
            {showModal && (
                <EventModal
                    day={selectedDay}
                    setShowModal={setShowModal}
                    setEvents={setEvents}
                    events={filteredEvents}
                    onAddEvent={handleAddEvent}
                    onUpdateEvent={(updatedEvent) => {
                        const updatedEvents = events.map((event) =>
                            event.id === updatedEvent.id ? updatedEvent : event
                        );
                        setEvents(updatedEvents);
                    }}
                    onDeleteEvent={(eventId) => {
                        const updatedEvents = events.filter((event) => event.id !== eventId);
                        setEvents(updatedEvents);
                    }}
                    selectedEvent={selectedEvent}
                    setSelectedEvent={setSelectedEvent}
                />
            )}
        </div>
    );
};

export default Calendar;
import React, { useState, useEffect } from 'react';
import Alert from '@mui/material/Alert';
import './EventModal.css'; // Import custom styles
import moment from 'moment';

const EventModal = ({
    day,
    setShowModal,
    setEvents,
    events,
    onAddEvent,
    onUpdateEvent,
    onDeleteEvent,
    selectedEvent,
    setSelectedEvent
}) => {
    const [name, setName] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState('work');  // Default to 'work'
    const [alert, setAlert] = useState('');
    const [eventDay, setEventDay] = useState(day.format('YYYY-MM-DD')); // Add state for the event day

    useEffect(() => {
        if (selectedEvent) {
            setName(selectedEvent.name);
            // Extract the time part from the moment object and format it as 'HH:mm'
            setStartTime(moment(selectedEvent.start).format('HH:mm'));
            setEndTime(moment(selectedEvent.end).format('HH:mm'));
            setDescription(selectedEvent.description);
            setEventType(selectedEvent.type); // Set event type for editing
            setEventDay(selectedEvent.day); // Set event day for editing
        } else {
            setEventDay(day.format('YYYY-MM-DD')); // Set event day if it's a new event
        }
    }, [selectedEvent, day]);

    const handleSave = () => {
        // Validation: Ensure all required fields are filled
        if (name.length === 0 || startTime.length === 0 || endTime.length === 0) {
            setAlert('Please fill all the required fields');
            return;
        }

        // Ensure start time is before end time
        if (startTime >= endTime) {
            setAlert('Please enter a valid time interval');
            return;
        }

        // Convert startTime and endTime to moment objects
        const newEvent = {
            id: selectedEvent ? selectedEvent.id : Date.now(),
            name,
            start: moment(`${eventDay} ${startTime}`, 'YYYY-MM-DD HH:mm'), // Combine date and time
            end: moment(`${eventDay} ${endTime}`, 'YYYY-MM-DD HH:mm'),     // Combine date and time
            description,
            type: eventType,
            day: eventDay
        };

        // If editing an existing event, update it, else add a new one
        if (selectedEvent) {
            onUpdateEvent(newEvent);  // Call onUpdateEvent for editing
        } else {
            onAddEvent(newEvent);     // Call onAddEvent for adding new
        }

        // Close modal after saving
        setShowModal(false);
    };

    const handleDelete = () => {
        if (selectedEvent) {
            onDeleteEvent(selectedEvent.id); // Delete event
        }
        setShowModal(false); // Close modal after deletion
    };

    return (
        <div className="event-modal">
            <div className="event-modal-content">
                <h3>{selectedEvent ? 'Edit Event' : 'Add Event'}</h3>

                {/* Alert Message */}
                {alert.length !== 0 && <Alert severity="error">{alert}</Alert>}

                <br />
                {/* Event Name */}
                <div>
                    <label>Event Name</label>
                    <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => { setAlert(''); setName(e.target.value); }}
                    />
                </div>

                {/* Start Time */}
                <div>
                    <label>Start Time</label>
                    <input
                        required
                        type="time"
                        value={startTime}
                        onChange={(e) => { setAlert(''); setStartTime(e.target.value); }}
                    />
                </div>

                {/* End Time */}
                <div>
                    <label>End Time</label>
                    <input
                        required
                        type="time"
                        value={endTime}
                        onChange={(e) => { setAlert(''); setEndTime(e.target.value); }}
                    />
                </div>

                {/* Description */}
                <div>
                    <label>Description (optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Event Type */}
                <div>
                    <label>Event Type</label>
                    <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                        <option value="work">Work</option>
                        <option value="personal">Personal</option>
                        <option value="others">Others</option>
                    </select>
                </div>

                {/* Event Day (display and optional change) */}
                <div>
                    <label>Event Day</label>
                    <input
                        type="date"
                        value={eventDay}
                        onChange={(e) => setEventDay(e.target.value)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="modal-actions">
                    <button onClick={() => setShowModal(false)}>Cancel</button>
                    <button onClick={handleSave}>Save</button>
                    {selectedEvent && (
                        <button onClick={handleDelete}>Delete</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventModal;
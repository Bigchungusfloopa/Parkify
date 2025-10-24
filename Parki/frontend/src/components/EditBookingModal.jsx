import React, { useState, useEffect } from 'react';

const EditBookingModal = ({ booking, isOpen, onClose, onUpdate }) => {
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (booking) {
            setVehicleNumber(booking.vehicleNumber || '');
            // Format dates for datetime-local input
            const formatForInput = (dateString) => {
                const date = new Date(dateString);
                return date.toISOString().slice(0, 16);
            };
            setStartTime(formatForInput(booking.startTime));
            setEndTime(formatForInput(booking.endTime));
            setCalculatedPrice(booking.price || 0);
        }
    }, [booking]);

    const calculatePrice = () => {
        // Simple price calculation - you can enhance this
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const hours = (end - start) / (1000 * 60 * 60);
            const price = Math.max(1, Math.ceil(hours)) * 100; // ₹100 per hour
            setCalculatedPrice(price);
        }
    };

    useEffect(() => {
        calculatePrice();
    }, [startTime, endTime]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const updatedBooking = {
                userId: booking.user.id,
                slotId: booking.slot.id,
                vehicleNumber: vehicleNumber,
                startTime: startTime.replace('T', ' ') + ':00',
                endTime: endTime.replace('T', ' ') + ':00'
            };

            const response = await fetch(`http://localhost:8080/api/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedBooking)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update booking');
            }

            const result = await response.json();
            onUpdate(result);
            onClose();
            
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !booking) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Booking</h2>
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Vehicle Number</label>
                        <input
                            type="text"
                            value={vehicleNumber}
                            onChange={(e) => setVehicleNumber(e.target.value)}
                            placeholder="e.g., KA01AB1234"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Start Time</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>End Time</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            min={startTime}
                            required
                        />
                    </div>

                    <div className="price-display">
                        Updated Price: <strong>₹{calculatedPrice.toFixed(2)}</strong>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? 'Updating...' : 'Update Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditBookingModal;
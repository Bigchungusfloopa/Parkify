import React, { useState, useEffect } from 'react';

const BASE_RATE_PER_HOUR = 100;
const EV_SURCHARGE = 50;
const VIP_SURCHARGE = 100;
const VEHICLE_NUMBER_PATTERN = /^[A-Z]{2}[- ]?[0-9]{1,2}[- ]?[A-Z]{1,2}[- ]?[0-9]{1,4}$/i;

export default function EditBookingModal({ booking, isOpen, onClose, onUpdate }) {
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [validationError, setValidationError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (booking && isOpen) {
            setVehicleNumber(booking.vehicleNumber || '');
            
            const formatForInput = (dateString) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                const offsetMs = date.getTimezoneOffset() * 60000;
                return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
            };
            
            setStartTime(formatForInput(booking.startTime));
            setEndTime(formatForInput(booking.endTime));
            setValidationError('');
        }
    }, [booking, isOpen]);

    useEffect(() => {
        if (booking && startTime && endTime) {
            calculatePrice();
        }
    }, [startTime, endTime, booking]);

    const calculatePrice = () => {
        try {
            const start = new Date(startTime);
            const end = new Date(endTime);
            
            if (isNaN(start) || isNaN(end) || end <= start) {
                setCalculatedPrice(0);
                return;
            }

            const durationMillis = end - start;
            const durationHours = durationMillis / (1000 * 60 * 60);

            let hourlyRate = BASE_RATE_PER_HOUR;
            const slotType = booking.slot?.type;

            if (slotType === 'EV' || slotType === 'Two-Wheeler-EV') {
                hourlyRate += EV_SURCHARGE;
            } else if (slotType === 'VIP') {
                hourlyRate += VIP_SURCHARGE;
            }

            const calculated = Math.max(1.0, Math.ceil(durationHours)) * hourlyRate;
            setCalculatedPrice(calculated);
        } catch (e) {
            console.error("Error calculating price:", e);
            setCalculatedPrice(0);
        }
    };

    const handleUpdate = async () => {
        setValidationError('');

        if (!vehicleNumber || !VEHICLE_NUMBER_PATTERN.test(vehicleNumber.trim())) {
            setValidationError('Invalid vehicle number format. Use format like KA01AB1234');
            return;
        }

        if (!startTime || !endTime) {
            setValidationError('Please select start and end times.');
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        if (isNaN(start) || isNaN(end)) {
            setValidationError('Invalid date/time format.');
            return;
        }

        if (end <= start) {
            setValidationError('End time must be after start time.');
            return;
        }

        setIsUpdating(true);

        try {
            const formatDateForBackend = (dateString) => {
                const date = new Date(dateString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

            // FIXED: Get userId and slotId from booking object or sessionStorage
            const userId = booking.userId || (booking.user && booking.user.id) || sessionStorage.getItem('userId');
            const slotId = booking.slotId || (booking.slot && booking.slot.id);

            if (!userId || !slotId) {
                throw new Error('Missing user or slot information');
            }

            const updatedData = {
                userId: parseInt(userId),
                slotId: parseInt(slotId),
                vehicleNumber: vehicleNumber.toUpperCase().replace(/[- ]/g, ''),
                startTime: formatDateForBackend(startTime),
                endTime: formatDateForBackend(endTime)
            };

            console.log('Updating booking with data:', updatedData);

            const response = await fetch(`http://localhost:8080/api/bookings/${booking.bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update booking');
            }

            const result = await response.json();
            onUpdate(result);
            onClose();
        } catch (error) {
            console.error('Failed to update booking:', error);
            setValidationError('Failed to update booking: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!isOpen || !booking) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Edit Booking</h2>

                {validationError && <p className="validation-error">{validationError}</p>}

                <div className="form-group">
                    <label htmlFor="editVehicleNumber">Vehicle Number</label>
                    <input
                        type="text"
                        id="editVehicleNumber"
                        placeholder="e.g., KA01AB1234"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="editStartTime">Start Time</label>
                    <input
                        type="datetime-local"
                        id="editStartTime"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="editEndTime">End Time</label>
                    <input
                        type="datetime-local"
                        id="editEndTime"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        min={startTime}
                    />
                </div>

                <div className="price-display">
                    Updated Price: <strong>₹{calculatedPrice.toFixed(2)}</strong>
                </div>

                <div className="modal-actions">
                    <button 
                        onClick={onClose} 
                        className="btn-secondary" 
                        disabled={isUpdating}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpdate} 
                        className="btn-primary" 
                        disabled={isUpdating}
                    >
                        {isUpdating ? 'Updating...' : 'Update Booking'}
                    </button>
                </div>
            </div>
        </div>
    );
}
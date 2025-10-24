import React, { useState, useEffect } from 'react';

// Pricing constants (in Rupees)
const BASE_RATE_PER_HOUR = 100;
const EV_SURCHARGE = 50;
const VIP_SURCHARGE = 100;

// Regex for Indian number plate format
const VEHICLE_NUMBER_PATTERN = /^[A-Z]{2}[- ]?[0-9]{1,2}[- ]?[A-Z]{1,2}[- ]?[0-9]{1,4}$/i;

export default function ReservationModal({ slot, onConfirm, onCancel, onBookingComplete }) {
    const [step, setStep] = useState(1);
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [calculatedPrice, setCalculatedPrice] = useState(0);
    const [isBooking, setIsBooking] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Credit Card');

    // Helper to get current local time formatted for datetime-local input
    const getLocalDateTimeNow = () => {
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
        return localISOTime;
    };

    // Reset state when the selected slot changes or modal closes
    useEffect(() => {
        if (slot) {
            setStep(1);
            setVehicleNumber('');
            setStartTime('');
            setEndTime('');
            setCalculatedPrice(0);
            setIsBooking(false);
            setValidationError('');
            setSelectedPaymentMethod('Credit Card');
        }
    }, [slot]);

    // Calculate price whenever times or slot change
    useEffect(() => {
        if (slot && startTime && endTime && (step === 2 || step === 3)) {
            calculatePrice();
        } else {
            setCalculatedPrice(0);
        }
    }, [slot, startTime, endTime, step]);

    if (!slot) return null;

    // Calculates the estimated price based on duration and slot type
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

            if (slot.type === 'EV' || slot.type === 'Two-Wheeler-EV') {
                hourlyRate += EV_SURCHARGE;
            } else if (slot.type === 'VIP') {
                hourlyRate += VIP_SURCHARGE;
            }

            const calculated = Math.max(1.0, Math.ceil(durationHours)) * hourlyRate;
            setCalculatedPrice(calculated);
        } catch (e) {
            console.error("Error calculating price:", e);
            setCalculatedPrice(0);
        }
    };

    // Moves from Step 1 (Info) to Step 2 (Form) and pre-fills times
    const handleReserveClick = () => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const formatForInput = (date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setStartTime(formatForInput(now));
        setEndTime(formatForInput(oneHourLater));
        setValidationError('');
        setStep(2);
    };

    // Validates Step 2 form and moves to Step 3 (Payment)
    const handleProceedToPayment = () => {
        setValidationError('');

        // Validate Vehicle Number
        if (!vehicleNumber || !VEHICLE_NUMBER_PATTERN.test(vehicleNumber.trim())) {
            setValidationError('Invalid vehicle number format. Use format like KA01AB1234');
            return;
        }

        // Validate Dates/Times
        if (!startTime || !endTime) {
            setValidationError('Please select start and end times.');
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();
        const slightlyInPast = new Date(now.getTime() - 60000);

        if (isNaN(start) || isNaN(end)) {
            setValidationError('Invalid date/time format.');
            return;
        }

        if (start < slightlyInPast) {
            setValidationError('Start time cannot be in the past.');
            return;
        }

        if (end <= start) {
            setValidationError('End time must be after start time.');
            return;
        }

        // Check for booking conflicts
        const userStart = new Date(startTime);
        const userEnd = new Date(endTime);
        if (slot.reservations && slot.reservations.length > 0) {
            for (const reservation of slot.reservations) {
                const reservedStart = new Date(reservation.startTime);
                const reservedEnd = new Date(reservation.endTime);

                if (userStart < reservedEnd && userEnd > reservedStart) {
                    setValidationError('This time is unavailable. The slot is already reserved.');
                    return;
                }
            }
        }

        setStep(3);
    };

    // Sends the booking request to the backend API
    const handleFinalBooking = async () => {
        try {
            // Get the current user ID
            const userId = sessionStorage.getItem('userId');
            
            if (!userId) {
                throw new Error("User not logged in");
            }

            if (!slot || !slot.id) {
                throw new Error("No slot selected");
            }

            if (!vehicleNumber) {
                throw new Error("Vehicle number is required");
            }

            // FIXED: Proper date formatting for backend
            const formatDateForBackend = (dateString) => {
                const date = new Date(dateString);
                
                // Format as: "2024-10-24T12:20:00" (without timezone)
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                
                return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
            };

            // Create the booking data object
            const bookingData = {
                userId: parseInt(userId),
                slotId: slot.id,
                vehicleNumber: vehicleNumber.toUpperCase().replace(/[- ]/g, ''),
                startTime: formatDateForBackend(startTime),
                endTime: formatDateForBackend(endTime),
            };

            console.log("Sending booking data:", bookingData);
            console.log("Original start time:", startTime);
            console.log("Original end time:", endTime);
            console.log("Formatted start time:", bookingData.startTime);
            console.log("Formatted end time:", bookingData.endTime);

            const response = await fetch('http://localhost:8080/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            console.log("Response status:", response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend error:", errorText);
                throw new Error(`Booking failed: ${errorText}`);
            }

            const result = await response.json();
            console.log("Booking successful!", result);
            
            // Handle success
            if (onBookingComplete) {
                onBookingComplete(result);
            }
            
            // Show success message and close modal
            alert("Booking confirmed successfully!");
            handleCancel();
            
        } catch (error) {
            console.error('Booking failed:', error);
            throw error;
        }
    };

    // Handles the final payment and booking
    const handlePayment = async () => {
        setIsBooking(true);
        try {
            console.log("Processing payment...");
            
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log("Payment successful, creating booking...");
            
            // Call the booking function
            await handleFinalBooking();
            
        } catch (error) {
            console.error('Payment/Booking failed:', error);
            alert(`Payment/Booking failed: ${error.message}`);
        } finally {
            setIsBooking(false);
        }
    };

    // Handles cancellation from any step
    const handleCancel = () => {
        setStep(1);
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {/* Step 1: Show Reservations (Initial View) */}
                {step === 1 && (
                    <>
                        <h2>Slot {slot.slotNumber} - Reservations</h2>
                        <p className="modal-subtitle">No current reservations for this slot.</p>
                        <div className="modal-actions">
                            <button onClick={handleCancel} className="btn-secondary">Close</button>
                            <button onClick={handleReserveClick} className="btn-primary">Reserve</button>
                        </div>
                    </>
                )}

                {/* Step 2: Reservation Form */}
                {step === 2 && (
                    <>
                        <h2>Reserve Slot {slot.slotNumber}</h2>
                        {validationError && <p className="validation-error">{validationError}</p>}

                        <div className="form-group">
                            <label htmlFor="vehicleNumber">Vehicle Number</label>
                            <input
                                type="text"
                                id="vehicleNumber"
                                placeholder="e.g., KA01AB1234 or KA-01-AB-1234"
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                            />
                            <small>Format: KA01AB1234 or KA-01-AB-1234</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="startTime">Start Time</label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                min={getLocalDateTimeNow()}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="endTime">End Time</label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                min={startTime || getLocalDateTimeNow()}
                            />
                        </div>

                        <div className="price-display">
                            Estimated Price: <strong>₹{calculatedPrice.toFixed(2)}</strong>
                        </div>

                        <div className="modal-actions">
                            <button onClick={handleCancel} className="btn-secondary" disabled={isBooking}>Cancel</button>
                            <button onClick={handleProceedToPayment} className="btn-primary" disabled={isBooking}>
                                {isBooking ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                    <>
                        <h2>Payment</h2>
                        <p className="modal-subtitle">Complete payment to reserve Slot {slot.slotNumber}.</p>

                        <div className="form-group">
                            <label>Payment Method</label>
                            <div className="payment-options">
                                <button
                                    className={`payment-btn ${selectedPaymentMethod === 'Credit Card' ? 'active' : ''}`}
                                    onClick={() => setSelectedPaymentMethod('Credit Card')}
                                >
                                    Credit Card
                                </button>
                                <button
                                    className={`payment-btn ${selectedPaymentMethod === 'Debit Card' ? 'active' : ''}`}
                                    onClick={() => setSelectedPaymentMethod('Debit Card')}
                                >
                                    Debit Card
                                </button>
                                <button
                                    className={`payment-btn ${selectedPaymentMethod === 'UPI' ? 'active' : ''}`}
                                    onClick={() => setSelectedPaymentMethod('UPI')}
                                >
                                    UPI
                                </button>
                                <button
                                    className={`payment-btn ${selectedPaymentMethod === 'Cash' ? 'active' : ''}`}
                                    onClick={() => setSelectedPaymentMethod('Cash')}
                                >
                                    Cash
                                </button>
                            </div>
                        </div>

                        {(selectedPaymentMethod === 'Credit Card' || selectedPaymentMethod === 'Debit Card') && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="cardNumber">Card Number</label>
                                    <input type="text" id="cardNumber" placeholder="•••• •••• •••• ••••"/>
                                </div>
                                <div className="form-group card-details-row">
                                    <div className="cvv-group">
                                        <label htmlFor="cvv">CVV</label>
                                        <input type="text" id="cvv" placeholder="•••" maxLength="3"/>
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedPaymentMethod === 'UPI' && (
                            <div className="form-group">
                                <label htmlFor="upiId">UPI ID</label>
                                <input type="text" id="upiId" placeholder="yourname@bank"/>
                            </div>
                        )}

                        <div className="price-display total">
                            Total Amount: <strong>₹{calculatedPrice.toFixed(2)}</strong>
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setStep(2)} className="btn-secondary" disabled={isBooking}>Back</button>
                            <button onClick={handlePayment} className="btn-primary" disabled={isBooking}>
                                {isBooking ? 'Processing...' :
                                 selectedPaymentMethod === 'Cash' ? 'Confirm (Pay at Counter)' :
                                 `Pay ₹${calculatedPrice.toFixed(2)}`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
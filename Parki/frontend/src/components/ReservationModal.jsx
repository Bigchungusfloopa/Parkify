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
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Credit Card'); // Default payment method

    // Helper to get current local time formatted for datetime-local input
    const getLocalDateTimeNow = () => {
        const now = new Date();
        // Adjust for local timezone offset to ensure the input displays the correct local time
        const offsetMs = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
        return localISOTime;
    };

    // Reset state when the selected slot changes or modal closes
    useEffect(() => {
        if (slot) {
            setStep(1); // Always start at step 1
            setVehicleNumber('');
            setStartTime(''); // Don't pre-fill times until "Reserve" is clicked
            setEndTime('');
            setCalculatedPrice(0);
            setIsBooking(false);
            setValidationError('');
            setSelectedPaymentMethod('Credit Card'); // Reset payment method
        }
    }, [slot]);

    // Calculate price whenever times or slot change (only in step 2 or 3)
    useEffect(() => {
        if (slot && startTime && endTime && (step === 2 || step === 3) ) {
            calculatePrice();
        } else {
            setCalculatedPrice(0);
        }
    }, [slot, startTime, endTime, step]);

    if (!slot) return null; // Don't render if no slot is selected

    // Calculates the estimated price based on duration and slot type
    const calculatePrice = () => {
        try {
            const start = new Date(startTime);
            const end = new Date(endTime);
            // Check if dates are valid and end is after start
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

            // Calculate price: minimum charge is 1 hour, round up the hours
            const calculated = Math.max(1.0, Math.ceil(durationHours)) * hourlyRate;
            setCalculatedPrice(calculated);
        } catch (e) {
            console.error("Error calculating price:", e);
            setCalculatedPrice(0); // Reset price on error
        }
    };

    // Moves from Step 1 (Info) to Step 2 (Form) and pre-fills times
    const handleReserveClick = () => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const formatForInput = (date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setStartTime(formatForInput(now));
        setEndTime(formatForInput(oneHourLater));
        setValidationError(''); // Clear previous errors
        setStep(2); // Move to the reservation form
    };

    // Validates Step 2 form and moves to Step 3 (Payment)
    const handleProceedToPayment = () => {
        setValidationError(''); // Clear previous errors

        // Validate Vehicle Number
        if (!vehicleNumber || !VEHICLE_NUMBER_PATTERN.test(vehicleNumber.trim())) {
            setValidationError('Invalid vehicle number format.');
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
        const slightlyInPast = new Date(now.getTime() - 60000); // Allow 1 min buffer

        if (isNaN(start) || isNaN(end)) {
             setValidationError('Invalid date/time format.');
             return;
        }
        if (start < slightlyInPast) { // Check if start time is in the past
            setValidationError('Start time cannot be in the past.');
            return;
        }
        if (end <= start) { // Check if end time is before start time
            setValidationError('End time must be after start time.');
            return;
        }

        // --- Check for booking conflicts ---
        const userStart = new Date(startTime);
        const userEnd = new Date(endTime);
        if (slot.reservations && slot.reservations.length > 0) {
            for (const reservation of slot.reservations) {
                // Parse ISO strings from backend
                const reservedStart = new Date(reservation.startTime);
                const reservedEnd = new Date(reservation.endTime);

                // Check for overlap: (StartA < EndB) and (EndA > StartB)
                if (userStart < reservedEnd && userEnd > reservedStart) {
                    setValidationError('This time is unavailable. The slot is already reserved.');
                    return; // Stop the process
                }
            }
        }
        // --- End conflict check ---

        // If all validations pass, always go to the payment step
        setStep(3);
    };

    // Handles the final 'Pay' or 'Confirm Cash' button click in Step 3
    const handlePayment = () => {
        if (selectedPaymentMethod === 'Cash') {
            // Book directly for cash, show specific message
            handleFinalBooking(true); // Pass true to indicate cash payment
        } else {
            // Simulate card/UPI payment (replace with actual integration)
            console.log(`Simulating ${selectedPaymentMethod} payment of ₹${calculatedPrice.toFixed(2)}.`);
            // Add validation for card number/CVV/UPI ID here if needed before proceeding
            handleFinalBooking(false); // Pass false for non-cash payment
        }
    };

    // Sends the booking request to the backend API
    const handleFinalBooking = async (isCashPayment = false) => {
        setIsBooking(true); // Set loading state
        // Get the current user's ID from session storage
        const currentUserId = sessionStorage.getItem('userId');
        if (!currentUserId) {
            alert("Error: User not identified. Please log in again.");
            setIsBooking(false);
            return;
        }
        try {
            const response = await fetch('http://localhost:8080/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slotId: slot.id,
                    userId: parseInt(currentUserId, 10), // Use stored user ID
                    vehicleNumber: vehicleNumber.toUpperCase().replaceAll("[- ]", ""), // Standardize format
                    startTime,
                    endTime,
                    // Optionally send price if needed by backend: price: calculatedPrice
                })
            });

            if (!response.ok) {
                // Try to get error message from backend response body
                const errorMessage = await response.text();
                throw new Error(errorMessage || 'Failed to book the slot.');
            }

            // Show different success message for cash
            if (isCashPayment) {
                alert('Reserved successfully! Payment pending - please pay at the counter.');
            } else {
                alert('Reserved successfully!');
            }
             // Delay the refresh slightly to allow backend to update
            setTimeout(() => {
                onBookingComplete?.(); // Callback to refresh the slot list in the parent component
            }, 100);

            onConfirm(); // Callback to close the modal

        } catch (error) {
            console.error("Booking Error:", error);
            alert(`Booking failed: ${error.message}`); // Show specific error from backend or generic message
        } finally {
             setIsBooking(false); // Reset loading state
        }
    };

    // Handles cancellation from any step
    const handleCancel = () => {
        setStep(1); // Reset to first step in case modal is reopened
        onCancel(); // Call parent's cancel handler (closes modal)
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
                            <button onClick={onCancel} className="btn-secondary">Close</button>
                            <button onClick={handleReserveClick} className="btn-primary">Reserve</button>
                        </div>
                    </>
                )}

                {/* Step 2: Reservation Form */}
                {step === 2 && (
                    <>
                        <h2>Reserve Slot {slot.slotNumber}</h2>
                        {/* Display validation error if any */}
                        {validationError && <p className="validation-error">{validationError}</p>}

                        {/* Vehicle Number Input */}
                        <div className="form-group">
                            <label htmlFor="vehicleNumber">Vehicle Number</label>
                            <input
                                type="text"
                                id="vehicleNumber"
                                placeholder="e.g., MH-04-AB-1234"
                                value={vehicleNumber}
                                onChange={(e) => setVehicleNumber(e.target.value)}
                            />
                        </div>
                        {/* Start Time Input */}
                        <div className="form-group">
                            <label htmlFor="startTime">Start</label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                min={getLocalDateTimeNow()} // Prevent selecting past dates/times
                            />
                        </div>
                        {/* End Time Input */}
                        <div className="form-group">
                            <label htmlFor="endTime">End</label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                min={startTime || getLocalDateTimeNow()} // End must be after start
                            />
                        </div>
                        {/* Price Display */}
                        <div className="price-display">
                            Estimated Price: <strong>₹{calculatedPrice.toFixed(2)}</strong>
                        </div>
                        {/* Action Buttons */}
                        <div className="modal-actions">
                            <button onClick={handleCancel} className="btn-secondary" disabled={isBooking}>Cancel</button>
                            <button onClick={handleProceedToPayment} className="btn-primary" disabled={isBooking}>
                                {isBooking ? 'Processing...' : 'Proceed to Payment'}
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Payment (Placeholder) */}
                 {step === 3 && (
                    <>
                        <h2>Payment</h2>
                        <p className="modal-subtitle">Complete payment to reserve Slot {slot.slotNumber}.</p>
                        {/* --- Payment Form --- */}
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

                        {/* Show card details only if card payment is selected */}
                        {(selectedPaymentMethod === 'Credit Card' || selectedPaymentMethod === 'Debit Card') && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="cardNumber">Card Number</label>
                                    <input type="text" id="cardNumber" placeholder="•••• •••• •••• ••••"/>
                                </div>
                                <div className="form-group card-details-row">
                                    {/* Add Expiry Date input group here if needed */}
                                    <div className="cvv-group">
                                        <label htmlFor="cvv">CVV</label>
                                        <input type="text" id="cvv" placeholder="•••" maxLength="3"/>
                                    </div>
                                </div>
                            </>
                        )}
                        {/* Show UPI ID input if UPI is selected */}
                        {selectedPaymentMethod === 'UPI' && (
                            <div className="form-group">
                                <label htmlFor="upiId">UPI ID</label>
                                <input type="text" id="upiId" placeholder="yourname@bank"/>
                            </div>
                        )}
                         {/* No specific input needed for Cash */}
                        {/* --- End Payment Form --- */}

                        {/* Total Amount Display */}
                        <div className="price-display total">
                            Total Amount: <strong>₹{calculatedPrice.toFixed(2)}</strong>
                        </div>
                        {/* Action Buttons */}
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
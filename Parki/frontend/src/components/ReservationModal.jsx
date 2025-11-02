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
    
    // Payment field states
    const [cardNumber, setCardNumber] = useState('');
    const [cvv, setCvv] = useState('');
    const [upiId, setUpiId] = useState('');
    const [paymentError, setPaymentError] = useState('');

    const getLocalDateTimeNow = () => {
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
        return localISOTime;
    };

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
            setCardNumber('');
            setCvv('');
            setUpiId('');
            setPaymentError('');
        }
    }, [slot]);

    useEffect(() => {
        if (slot && startTime && endTime && (step === 2 || step === 3)) {
            calculatePrice();
        } else {
            setCalculatedPrice(0);
        }
    }, [slot, startTime, endTime, step]);

    if (!slot) return null;

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

    const handleReserveClick = () => {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
        const formatForInput = (date) => new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        setStartTime(formatForInput(now));
        setEndTime(formatForInput(oneHourLater));
        setValidationError('');
        setStep(2);
    };

    const handleProceedToPayment = () => {
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

    const handleFinalBooking = async () => {
        try {
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

            // FIXED: Create clean booking data object
            const bookingData = {
                userId: parseInt(userId),
                slotId: slot.id,
                vehicleNumber: vehicleNumber.toUpperCase().replace(/[- ]/g, ''),
                startTime: formatDateForBackend(startTime),
                endTime: formatDateForBackend(endTime)
            };

            console.log("Sending booking data:", JSON.stringify(bookingData, null, 2));

            const response = await fetch('http://localhost:8080/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", response.headers);

            // FIXED: Read response as text first to see what we're getting
            const responseText = await response.text();
            console.log("Raw response:", responseText);

            if (!response.ok) {
                throw new Error(`Booking failed: ${responseText}`);
            }

            // FIXED: Try to parse as JSON only if we got a valid response
            let result;
            try {
                result = JSON.parse(responseText);
                console.log("Parsed booking result:", result);
            } catch (parseError) {
                console.error("JSON parse error:", parseError);
                throw new Error("Invalid response from server");
            }
            
            if (onBookingComplete) {
                onBookingComplete(result);
            }
            
            alert("Booking confirmed successfully!");
            handleCancel();
            
        } catch (error) {
            console.error('Booking failed:', error);
            throw error;
        }
    };

    const validatePayment = () => {
        setPaymentError('');

        if (selectedPaymentMethod === 'Credit Card' || selectedPaymentMethod === 'Debit Card') {
            // Validate card number (16 digits)
            const cardRegex = /^[0-9]{16}$/;
            if (!cardRegex.test(cardNumber.replace(/\s/g, ''))) {
                setPaymentError('Card number must be 16 digits');
                return false;
            }

            // Validate CVV (3 digits)
            const cvvRegex = /^[0-9]{3}$/;
            if (!cvvRegex.test(cvv)) {
                setPaymentError('CVV must be 3 digits');
                return false;
            }
        } else if (selectedPaymentMethod === 'UPI') {
            // Validate UPI ID (format: username@bank)
            const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
            if (!upiRegex.test(upiId)) {
                setPaymentError('Invalid UPI ID format (e.g., username@bank)');
                return false;
            }
        }
        // Cash doesn't need validation

        return true;
    };

    const handlePayment = async () => {
        if (!validatePayment()) {
            return;
        }

        setIsBooking(true);
        try {
            console.log("Processing payment...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Payment successful, creating booking...");
            await handleFinalBooking();
        } catch (error) {
            console.error('Payment/Booking failed:', error);
            alert(`Payment/Booking failed: ${error.message}`);
        } finally {
            setIsBooking(false);
        }
    };

    const handleCancel = () => {
        setStep(1);
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
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

                {step === 3 && (
                    <>
                        <h2>Payment</h2>
                        <p className="modal-subtitle">Complete payment to reserve Slot {slot.slotNumber}.</p>

                        {paymentError && <p className="validation-error">{paymentError}</p>}

                        <div className="form-group">
                            <label>Payment Method</label>
                            <div className="payment-options">
                                <button
                                    className={`payment-btn ${selectedPaymentMethod === 'Credit Card' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedPaymentMethod('Credit Card');
                                        setPaymentError('');
                                    }}
                                >
                                    Credit Card
                                </button>
                                <button
                                    className={`payment-btn ${selectedPaymentMethod === 'Debit Card' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedPaymentMethod('Debit Card');
                                        setPaymentError('');
                                    }}
                                >
                                    Debit Card
                                </button>
                                <button
                                    className={`payment-btn ${selectedPaymentMethod === 'UPI' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedPaymentMethod('UPI');
                                        setPaymentError('');
                                    }}
                                >
                                    UPI
                                </button>
                                <button
                                    className={`payment-btn ${selectedPaymentMethod === 'Cash' ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedPaymentMethod('Cash');
                                        setPaymentError('');
                                    }}
                                >
                                    Cash
                                </button>
                            </div>
                        </div>

                        {(selectedPaymentMethod === 'Credit Card' || selectedPaymentMethod === 'Debit Card') && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="cardNumber">Card Number</label>
                                    <input 
                                        type="text" 
                                        id="cardNumber" 
                                        placeholder="1234 5678 9012 3456"
                                        value={cardNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\s/g, '');
                                            if (/^\d*$/.test(value) && value.length <= 16) {
                                                setCardNumber(value.replace(/(\d{4})/g, '$1 ').trim());
                                            }
                                        }}
                                        maxLength="19"
                                        required
                                    />
                                </div>
                                <div className="form-group card-details-row">
                                    <div className="cvv-group">
                                        <label htmlFor="cvv">CVV</label>
                                        <input 
                                            type="text" 
                                            id="cvv" 
                                            placeholder="123" 
                                            value={cvv}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (/^\d*$/.test(value) && value.length <= 3) {
                                                    setCvv(value);
                                                }
                                            }}
                                            maxLength="3"
                                            required
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedPaymentMethod === 'UPI' && (
                            <div className="form-group">
                                <label htmlFor="upiId">UPI ID</label>
                                <input 
                                    type="text" 
                                    id="upiId" 
                                    placeholder="yourname@bank"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    required
                                />
                                <small>Format: username@bankname (e.g., john@paytm)</small>
                            </div>
                        )}

                        {selectedPaymentMethod === 'Cash' && (
                            <div className="form-group">
                                <p style={{opacity: 0.8, fontSize: '0.95rem', margin: '1rem 0'}}>
                                    Please pay ₹{calculatedPrice.toFixed(2)} at the counter upon arrival.
                                </p>
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
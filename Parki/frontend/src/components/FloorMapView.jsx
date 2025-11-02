import React, { useState, useEffect } from 'react';
import ReservationModal from './ReservationModal';

export default function FloorMapView({ selectedFloorId, onGoBack }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingSlot, setBookingSlot] = useState(null);

    // Function to fetch slots
    const fetchSlots = async () => {
        if (!selectedFloorId) return;
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/api/floors/${selectedFloorId}/slots`);
            if (!response.ok) throw new Error('Could not fetch slots');
            const data = await response.json();
            setSlots(data);
        } catch (error) {
            console.error("Failed to fetch slots:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch slots when the selected floor ID changes
    useEffect(() => {
        fetchSlots();
    }, [selectedFloorId]);

    // Opens the reservation modal - NOW allows clicking on ALL slots to see details
    const handleSlotClick = (slot) => {
        setBookingSlot(slot);
    };

    // Group slots by type
    const groupedSlots = slots.reduce((acc, slot) => {
        let groupTitle = "Error";
        switch(slot.type) {
            case "Two-Wheeler": groupTitle = "🏍️ Two-Wheeler"; break;
            case "Regular": groupTitle = "🚗 Four-Wheeler Regular"; break;
            case "EV": case "Two-Wheeler-EV": groupTitle = "⚡️ EV Charging Parking"; break;
            case "VIP": groupTitle = "⭐ VIP Parking"; break;
            default: groupTitle = "Other";
        }
        if (!acc[groupTitle]) acc[groupTitle] = [];
        acc[groupTitle].push(slot);
        return acc;
    }, {});

    // Define the order of groups
    const groupOrder = ["🏍️ Two-Wheeler", "🚗 Four-Wheeler Regular", "⚡️ EV Charging Parking", "⭐ VIP Parking"];

    // Show loading state
    if (loading) {
        return <div className="floor-map-loading">Loading Slots...</div>;
    }

    return (
        <div className="floor-map-container">
            <div className="floor-map-header">
                <button onClick={onGoBack} className="back-button">
                    &larr; Back to Floors
                </button>
                <h2>Floor {selectedFloorId} Layout</h2>
            </div>

            {/* Legend for slot colors */}
            <div className="slot-legend">
                <div className="legend-item">
                    <span className="legend-color available"></span>
                    <span>Available</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color occupied"></span>
                    <span>Currently Occupied</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color reserved"></span>
                    <span>Has Future Bookings</span>
                </div>
            </div>

            {/* Render groups in the specified order */}
            {groupOrder.map(groupTitle => (
                 groupedSlots[groupTitle] && (
                    <div key={groupTitle} className="slot-group">
                        <h3 className="slot-group-title">
                            {groupTitle}
                            {groupTitle === "⭐ VIP Parking" && (
                                <div className="tooltip-container">
                                    <span className="info-icon">ⓘ</span>
                                    <div className="tooltip-text">
                                        <strong>VIP Benefits:</strong>
                                        <ul>
                                            <li>Valet Parking</li>
                                            <li>Car Wash Service</li>
                                            <li>Closest to Exit</li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </h3>
                        <div className="slots-grid">
                            {groupedSlots[groupTitle].map(slot => {
                                // Determine Status and Title for tooltip
                                const isCurrentlyOccupied = slot.isOccupied;
                                const hasReservations = !isCurrentlyOccupied && slot.reservations && slot.reservations.length > 0;
                                let statusClass = 'available';
                                let statusTitle = 'Available - Click to book';

                                if (isCurrentlyOccupied) {
                                    statusClass = 'occupied';
                                    statusTitle = 'Occupied - Click to view details';
                                } else if (hasReservations) {
                                     statusClass = 'reserved';
                                     statusTitle = 'Has future bookings - Click to view available times';
                                }

                                return (
                                    <div
                                        key={slot.id}
                                        title={statusTitle}
                                        className={`parking-slot-box ${statusClass} ${slot.type.toLowerCase().replace('-', '')}`}
                                        onClick={() => handleSlotClick(slot)}
                                    >
                                        {(slot.type === 'EV' || slot.type === 'Two-Wheeler-EV') && (
                                            <span className="ev-type-label">
                                                {slot.type === 'EV' ? '4W' : '2W'}
                                            </span>
                                        )}
                                        {slot.slotNumber}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                 )
            ))}

            <ReservationModal
                slot={bookingSlot}
                onConfirm={() => setBookingSlot(null)}
                onCancel={() => setBookingSlot(null)}
                onBookingComplete={fetchSlots}
            />
        </div>
    );
}
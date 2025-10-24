import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Aurora from '../components/Aurora';
import EditBookingModal from '../components/EditBookingModal';
import '../styles/History.css';

// Update HistoryCard component
const HistoryCard = ({ booking, onEdit, onCancel, onDelete }) => (
    <div className="history-card">
        <div className="card-main-info">
            <span className="slot-info">Slot {booking.slotNumber}</span>
            <span className="floor-info">{booking.floorName}</span>
            <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                {booking.status}
            </span>
        </div>
        <div className="card-details">
            <p><strong>Vehicle:</strong> {booking.vehicleNumber}</p>
            <p><strong>From:</strong> {new Date(booking.startTime).toLocaleString()}</p>
            <p><strong>To:</strong> {new Date(booking.endTime).toLocaleString()}</p>
            <p><strong>Price:</strong> ₹{booking.price?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="card-actions">
            {booking.status === 'ACTIVE' && (
                <>
                    <button className="edit-btn" onClick={() => onEdit(booking)}>
                        Edit
                    </button>
                    <button className="cancel-btn" onClick={() => onCancel(booking.bookingId)}>
                        Cancel
                    </button>
                </>
            )}
            <button className="delete-btn" onClick={() => onDelete(booking.bookingId)}>
                Delete
            </button>
        </div>
    </div>
);

export default function History() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingBooking, setEditingBooking] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // ... existing fetchHistory function ...

    const handleEdit = (booking) => {
        setEditingBooking(booking);
        setIsEditModalOpen(true);
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

            // Refresh the history
            fetchHistory();
            alert('Booking cancelled successfully');
            
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            alert('Failed to cancel booking: ' + err.message);
        }
    };

    const handleDelete = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to delete booking');
            }

            // Refresh the history
            fetchHistory();
            alert('Booking deleted successfully');
            
        } catch (err) {
            console.error('Failed to delete booking:', err);
            alert('Failed to delete booking: ' + err.message);
        }
    };

    const handleUpdateBooking = (updatedBooking) => {
        // Refresh the history
        fetchHistory();
        alert('Booking updated successfully');
    };

    return (
        <div className="history-page">
            <div className="background"><Aurora /></div>
            <header className="history-header">
                <Link to="/dashboard" className="back-link">&larr; Back to Dashboard</Link>
                <h1>Booking History</h1>
            </header>
            <main className="history-content">
                {loading && <p>Loading history...</p>}
                {error && <p className="history-error">Error: {error}</p>}
                {!loading && !error && bookings.length > 0 && (
                    <div className="history-list">
                        {bookings.map(booking => (
                            <HistoryCard 
                                key={booking.bookingId} 
                                booking={booking}
                                onEdit={handleEdit}
                                onCancel={handleCancel}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
                {!loading && !error && bookings.length === 0 && (
                    <p>You have no past bookings.</p>
                )}
            </main>

            <EditBookingModal
                booking={editingBooking}
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingBooking(null);
                }}
                onUpdate={handleUpdateBooking}
            />
        </div>
    );
}
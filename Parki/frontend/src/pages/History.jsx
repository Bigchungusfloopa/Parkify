import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Aurora from '../components/Aurora';
import '../styles/History.css';

// HistoryCard component remains the same
const HistoryCard = ({ booking }) => (
    <div className="history-card">
        <div className="card-main-info">
            <span className="slot-info">Slot {booking.slotNumber}</span>
            <span className="floor-info">{booking.floorName}</span>
        </div>
        <div className="card-details">
            <p><strong>Vehicle:</strong> {booking.vehicleNumber}</p>
            <p><strong>From:</strong> {booking.startTime}</p>
            <p><strong>To:</strong> {booking.endTime || 'Ongoing'}</p>
        </div>
        <div className="card-footer-info">
            <span className="price">Price: ₹{booking.price ? booking.price.toFixed(2) : '0.00'}</span>
            <span className={`status-badge ${booking.status?.toLowerCase()}`}>{booking.status}</span>
        </div>
    </div>
);

export default function History() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State to handle errors

    useEffect(() => {
        // --- Get the logged-in user's ID ---
        const userId = sessionStorage.getItem('userId');
        
        if (!userId) {
            setError("Could not find user ID. Please log in again.");
            setLoading(false);
            return; // Stop if no user ID
        }
        // --- End Get User ID ---

        const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
        const userId = sessionStorage.getItem('userId');
        const response = await fetch(`http://localhost:8080/api/bookings/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // Remove Authorization header for now
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch history: ${errorText || response.status}`);
        }
        const data = await response.json();
        setBookings(data);
    } catch (err) {
        console.error(err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

        fetchHistory();
    }, []); // Run once on component mount

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
                        {bookings.map(booking => <HistoryCard key={booking.bookingId} booking={booking} />)}
                    </div>
                )}
                 {!loading && !error && bookings.length === 0 && (
                    <p>You have no past bookings.</p>
                )}
            </main>
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Aurora from '../components/Aurora';
import FloorMapView from '../components/FloorMapView';
import SimpleCalendar from '../components/SimpleCalendar';
import '../styles/Dashboard.css';

// InfoCard Component
const InfoCard = ({ title, icon, children, cardClass = '' }) => (
    <div className={`info-card ${cardClass}`}>
        <h3>{icon} {title}</h3>
        <div className="info-card-content">
            {children}
        </div>
    </div>
);

// RecentBookingItem Component
const RecentBookingItem = ({ booking }) => (
    <div className="recent-booking-item">
        <p><strong>Slot:</strong> {booking.slotNumber} ({booking.floorName})</p>
        <p><strong>Vehicle:</strong> {booking.vehicleNumber}</p>
        <p><strong>Time:</strong> {booking.startTime}</p>
        {/* Safely access status */}
        <span className={`status-badge ${booking.status?.toLowerCase()}`}>{booking.status}</span>
    </div>
);

export default function Dashboard() {
    const [floors, setFloors] = useState([]);
    const [selectedFloorId, setSelectedFloorId] = useState(null);
    const [userName, setUserName] = useState('User');
    const [recentBookings, setRecentBookings] = useState([]);
    const [userId, setUserId] = useState(null); // Initialize userId as null
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve user name
        const storedName = sessionStorage.getItem('userName');
        if (storedName) setUserName(storedName);

        // Retrieve user ID
        const storedUserId = sessionStorage.getItem('userId');
        if (storedUserId) {
            setUserId(storedUserId); // Set the userId state
            fetchRecentBookings(storedUserId); // Fetch bookings *after* userId is confirmed
        } else {
            console.warn("User ID not found in session storage. Cannot fetch recent bookings.");
            // Optionally redirect to login or show an error message
        }

        // Fetch floor data
        const fetchFloors = async () => {
             console.log("Dashboard attempting to fetch floor data...");
             try {
                const response = await fetch('http://localhost:8080/api/floors');
                 console.log("Dashboard received floor response:", response);
                if (!response.ok) {
                    throw new Error(`Could not fetch floor data: ${response.status}`);
                }
                const data = await response.json();
                console.log("Dashboard received floor data:", data);
                setFloors(data);
            } catch (error) {
                console.error("Failed to fetch floor data:", error);
                 setFloors([]); // Clear floors on error
            }
        };

        fetchFloors(); // Call the function to fetch floors
    }, []); // Run this effect only once on component mount

    // Fetch recent bookings using the provided user ID
    const fetchRecentBookings = async (currentUserId) => {
        console.log("Dashboard attempting to fetch recent bookings for userId:", currentUserId);

        if (!currentUserId) {
            console.log("Dashboard: No userId provided, skipping fetch.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/bookings/user/${currentUserId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch recent bookings: ${response.status}`);
            }
            const data = await response.json();
            console.log("Dashboard received recent bookings:", data);
            setRecentBookings(data.slice(0, 3)); // Get latest 3
        } catch (error) {
            console.error("Failed to fetch recent bookings:", error);
            setRecentBookings([]); // Clear bookings on error
        }
    };

    // Logout handler
    const handleLogout = () => {
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('userId'); // Clear userId
        navigate('/login');
    };

    // Back button handler (passed down to FloorMapView)
    const handleGoBack = () => {
        setSelectedFloorId(null);
    };

    return (
        <div className="dashboard-page">
            <div className="background"><Aurora /></div>

            <header className="dashboard-header">
                <div className="logo-text-dashboard">Parkify</div>
                <nav className="dashboard-nav">
                    <button className="nav-button history-button" onClick={() => navigate('/history')}>History</button>
                    <button className="nav-button logout-button" onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            <main className="dashboard-main-content">
                <div className="sidebar">
                    <p className="greeting">Hi, {userName}</p>
                    <h2 className="select-floor-title">Select Floor</h2>

                    <div className="parking-lot-graphic">
                        {floors.length === 0 && <p style={{color: '#9ca3af', padding: '1rem'}}>Loading floors...</p>}
                        {floors.map(floor => (
                            <div
                                key={floor.id}
                                className={`floor-level ${selectedFloorId === floor.id ? 'selected' : ''}`}
                                onClick={() => setSelectedFloorId(floor.id)}
                            >
                                <div className="floor-info">
                                    <h3>{floor.name}</h3>
                                    <p>{floor.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="floor-plan-view">
                    {selectedFloorId ? (
                        // Render Floor Map View when a floor is selected
                        <FloorMapView
                            selectedFloorId={selectedFloorId}
                            onGoBack={handleGoBack}
                        />
                    ) : (
                        // Render Info Cards and Recent Bookings when no floor is selected
                        <div className="dashboard-overview">
                            <div className="info-cards-grid">
                                <InfoCard title="Thane" icon={<span style={{fontSize: '2.5em', lineHeight: '1'}}>☀️</span>} cardClass="weather-card">
                                    <p className="weather-temp">31°C</p>
                                    <p className="weather-desc">Sunny</p>
                                    <p className="weather-feels">Feels like: 33°C</p>
                                </InfoCard>
                                <InfoCard title="Calendar" icon="📅">
                                    <SimpleCalendar />
                                </InfoCard>
                                <InfoCard title="Traffic in Thane" icon="🚦">
                                     <p>Current Status: Light Traffic</p>
                                     <p>Main Roads: Generally clear</p>
                                     <p>Est. Delay: &lt; 5 mins</p>
                                </InfoCard>
                            </div>

                            <div className="recent-bookings-section">
                                <h3>Recent Bookings</h3>
                                {recentBookings.length > 0 ? (
                                    <div className="recent-bookings-list">
                                        {recentBookings.map(booking => (
                                            <RecentBookingItem key={booking.bookingId} booking={booking} />
                                        ))}
                                    </div>
                                ) : (
                                    // Show appropriate message based on userId state
                                    userId ? <p>No recent bookings found for this account.</p> : <p>Loading booking data...</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
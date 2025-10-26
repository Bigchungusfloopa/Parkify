import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Aurora from '../components/Aurora';
import '../styles/Admin.css';

const StatCard = ({ title, value, color }) => (
    <div className={`stat-card ${color}`}>
        <div className="stat-content">
            <h3>{title}</h3>
            <p className="stat-value">{value}</p>
        </div>
    </div>
);

const FloorModal = ({ isOpen, onClose, floor, onSave }) => {
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');

    useEffect(() => {
        if (floor) {
            setName(floor.name || '');
            setDetails(floor.details || '');
        } else {
            setName('');
            setDetails('');
        }
    }, [floor]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            name,
            details
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{floor ? 'Edit Floor' : 'Add New Floor'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Floor Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Ground Floor, First Floor"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Details</label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="e.g., Premium parking with EV charging"
                            rows="3"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">
                            {floor ? 'Update Floor' : 'Create Floor'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SlotModal = ({ isOpen, onClose, slot, floors, onSave }) => {
    const [slotNumber, setSlotNumber] = useState('');
    const [type, setType] = useState('Regular');
    const [floorId, setFloorId] = useState('');
    const [isOccupied, setIsOccupied] = useState(false);

    useEffect(() => {
        if (slot) {
            setSlotNumber(slot.slotNumber || '');
            setType(slot.type || 'Regular');
            setFloorId(slot.floor?.id || '');
            setIsOccupied(slot.isOccupied || false);
        } else {
            setSlotNumber('');
            setType('Regular');
            setFloorId(floors.length > 0 ? floors[0].id : '');
            setIsOccupied(false);
        }
    }, [slot, floors]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            slotNumber,
            type,
            floorId: parseInt(floorId),
            isOccupied
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{slot ? 'Edit Slot' : 'Add New Slot'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Slot Number</label>
                        <input
                            type="text"
                            value={slotNumber}
                            onChange={(e) => setSlotNumber(e.target.value)}
                            placeholder="e.g., A1, B2, C3"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Slot Type</label>
                        <select value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="Regular">Regular</option>
                            <option value="Two-Wheeler">Two-Wheeler</option>
                            <option value="EV">EV Charging</option>
                            <option value="Two-Wheeler-EV">Two-Wheeler EV</option>
                            <option value="VIP">VIP</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Floor</label>
                        <select value={floorId} onChange={(e) => setFloorId(e.target.value)} required>
                            <option value="">Select Floor</option>
                            {floors.map(floor => (
                                <option key={floor.id} value={floor.id}>
                                    {floor.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={isOccupied}
                                onChange={(e) => setIsOccupied(e.target.checked)}
                            />
                            Currently Occupied
                        </label>
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">
                            {slot ? 'Update Slot' : 'Create Slot'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Admin() {
    const [stats, setStats] = useState({});
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [floors, setFloors] = useState([]);
    const [slots, setSlots] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
    const [editingFloor, setEditingFloor] = useState(null);
    const [editingSlot, setEditingSlot] = useState(null);
    const [selectedFloorForSlots, setSelectedFloorForSlots] = useState('');
    const navigate = useNavigate();

    // Colors for charts
    const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardStats();
            fetchBookings(); // For charts
            fetchFloors(); // For charts
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'floors') {
            fetchFloors();
        } else if (activeTab === 'slots') {
            fetchSlots();
            fetchFloors();
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedFloorForSlots && activeTab === 'slots') {
            fetchSlotsByFloor(selectedFloorForSlots);
        } else if (activeTab === 'slots' && !selectedFloorForSlots) {
            fetchSlots();
        }
    }, [selectedFloorForSlots, activeTab]);

    const fetchDashboardStats = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/dashboard/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    const fetchFloors = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/floors');
            const data = await response.json();
            setFloors(data);
        } catch (error) {
            console.error('Failed to fetch floors:', error);
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/slots');
            const data = await response.json();
            setSlots(data);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        }
    };

    const fetchSlotsByFloor = async (floorId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/admin/floors/${floorId}/slots`);
            const data = await response.json();
            setSlots(data);
        } catch (error) {
            console.error('Failed to fetch slots by floor:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/bookings');
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            await fetch(`http://localhost:8080/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            fetchUsers();
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const deleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                    method: 'DELETE'
                });
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    const handleSaveFloor = async (floorData) => {
        try {
            if (editingFloor) {
                await fetch(`http://localhost:8080/api/admin/floors/${editingFloor.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(floorData)
                });
            } else {
                await fetch('http://localhost:8080/api/admin/floors', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(floorData)
                });
            }
            setIsFloorModalOpen(false);
            setEditingFloor(null);
            fetchFloors();
        } catch (error) {
            console.error('Failed to save floor:', error);
            alert('Failed to save floor: ' + error.message);
        }
    };

    const handleSaveSlot = async (slotData) => {
        try {
            if (editingSlot) {
                await fetch(`http://localhost:8080/api/admin/slots/${editingSlot.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(slotData)
                });
            } else {
                await fetch('http://localhost:8080/api/admin/slots', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(slotData)
                });
            }
            setIsSlotModalOpen(false);
            setEditingSlot(null);
            
            if (selectedFloorForSlots) {
                fetchSlotsByFloor(selectedFloorForSlots);
            } else {
                fetchSlots();
            }
        } catch (error) {
            console.error('Failed to save slot:', error);
            alert('Failed to save slot: ' + error.message);
        }
    };

    const handleEditFloor = (floor) => {
        setEditingFloor(floor);
        setIsFloorModalOpen(true);
    };

    const handleAddFloor = () => {
        setEditingFloor(null);
        setIsFloorModalOpen(true);
    };

    const handleDeleteFloor = async (floorId) => {
        if (window.confirm('Are you sure you want to delete this floor? This will also delete all associated slots!')) {
            try {
                await fetch(`http://localhost:8080/api/admin/floors/${floorId}`, {
                    method: 'DELETE'
                });
                fetchFloors();
                if (activeTab === 'slots') {
                    fetchSlots();
                }
            } catch (error) {
                console.error('Failed to delete floor:', error);
                alert('Failed to delete floor: ' + error.message);
            }
        }
    };

    const handleEditSlot = (slot) => {
        setEditingSlot(slot);
        setIsSlotModalOpen(true);
    };

    const handleAddSlot = () => {
        setEditingSlot(null);
        setIsSlotModalOpen(true);
    };

    const handleDeleteSlot = async (slotId) => {
        if (window.confirm('Are you sure you want to delete this slot?')) {
            try {
                await fetch(`http://localhost:8080/api/admin/slots/${slotId}`, {
                    method: 'DELETE'
                });
                if (selectedFloorForSlots) {
                    fetchSlotsByFloor(selectedFloorForSlots);
                } else {
                    fetchSlots();
                }
            } catch (error) {
                console.error('Failed to delete slot:', error);
                alert('Failed to delete slot: ' + error.message);
            }
        }
    };

    const handleFloorFilterChange = (floorId) => {
        setSelectedFloorForSlots(floorId);
    };

    // Prepare data for charts
    const getBookingStatusData = () => {
        const statusCount = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
    };

    const getFloorOccupancyData = () => {
        return floors.map(floor => {
            const floorSlots = slots.filter(s => s.floor?.id === floor.id);
            const occupied = floorSlots.filter(s => s.isOccupied).length;
            const available = floorSlots.length - occupied;
            
            return {
                name: floor.name,
                Occupied: occupied,
                Available: available
            };
        });
    };

    const getRevenueData = () => {
        // Group bookings by date and calculate revenue
        const revenueByDate = bookings.reduce((acc, booking) => {
            if (booking.startTime) {
                const date = new Date(booking.startTime).toLocaleDateString();
                acc[date] = (acc[date] || 0) + (booking.price || 0);
            }
            return acc;
        }, {});

        return Object.entries(revenueByDate)
            .map(([date, revenue]) => ({ date, revenue: Math.round(revenue) }))
            .slice(-7); // Last 7 days
    };

    return (
        <div className="admin-page">
            <div className="background" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <Aurora />
            </div>
            
            <header className="admin-header">
                <div className="logo-text-admin">Parkify Admin</div>
                <nav className="admin-nav">
                    <button className="nav-button" onClick={() => navigate('/dashboard')}>User Dashboard</button>
                    <button className="nav-button logout-button" onClick={handleLogout}>Logout</button>
                </nav>
            </header>

            <main className="admin-main">
                <div className="admin-sidebar">
                    <h3>Admin Panel</h3>
                    <button 
                        className={`sidebar-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button 
                        className={`sidebar-tab ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button 
                        className={`sidebar-tab ${activeTab === 'floors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('floors')}
                    >
                        Floors
                    </button>
                    <button 
                        className={`sidebar-tab ${activeTab === 'slots' ? 'active' : ''}`}
                        onClick={() => setActiveTab('slots')}
                    >
                        Slots
                    </button>
                </div>

                <div className="admin-content">
                    {activeTab === 'dashboard' && (
                        <div className="dashboard-tab">
                            <h2>Admin Dashboard</h2>
                            <div className="stats-grid">
                                <StatCard 
                                    title="Total Users" 
                                    value={stats.totalUsers || 0} 
                                    color="blue" 
                                />
                                <StatCard 
                                    title="Total Bookings" 
                                    value={stats.totalBookings || 0} 
                                    color="green" 
                                />
                                <StatCard 
                                    title="Active Bookings" 
                                    value={stats.activeBookings || 0} 
                                    color="orange" 
                                />
                                <StatCard 
                                    title="Total Floors" 
                                    value={stats.totalFloors || 0} 
                                    color="purple" 
                                />
                                <StatCard 
                                    title="Total Revenue" 
                                    value={`₹${stats.totalRevenue || 0}`} 
                                    color="gold" 
                                />
                            </div>

                            <div className="charts-grid">
                                <div className="chart-card">
                                    <h3>Booking Status Distribution</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={getBookingStatusData()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {getBookingStatusData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="chart-card">
                                    <h3>Floor Occupancy</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={getFloorOccupancyData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="Occupied" fill="#f093fb" />
                                            <Bar dataKey="Available" fill="#4facfe" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="chart-card full-width">
                                    <h3>Revenue Trend (Last 7 Days)</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={getRevenueData()}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="revenue" stroke="#667eea" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                        <div className="users-tab">
                            <h2>User Management</h2>
                            <div className="users-list">
                                {users.map(user => (
                                    <div key={user.id} className="user-card">
                                        <div className="user-info">
                                            <h4>{user.name}</h4>
                                            <p>{user.email}</p>
                                            <span className={`role-badge ${user.role}`}>
                                                {user.role || 'ROLE_USER'}
                                            </span>
                                        </div>
                                        <div className="user-actions">
                                            <select 
                                                value={user.role || 'ROLE_USER'} 
                                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                            >
                                                <option value="ROLE_USER">User</option>
                                                <option value="ROLE_ADMIN">Admin</option>
                                            </select>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => deleteUser(user.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'floors' && (
                        <div className="floors-tab">
                            <div className="floors-header">
                                <h2>Floor Management</h2>
                                <button className="btn-primary" onClick={handleAddFloor}>
                                    + Add New Floor
                                </button>
                            </div>
                            <div className="floors-list">
                                {floors.map(floor => (
                                    <div key={floor.id} className="floor-card">
                                        <div className="floor-info">
                                            <h4>{floor.name}</h4>
                                            <p>{floor.details || 'No description'}</p>
                                            <div className="floor-stats">
                                                <span>Total Slots: {floor.totalSlots}</span>
                                            </div>
                                        </div>
                                        <div className="floor-actions">
                                            <button 
                                                className="edit-btn"
                                                onClick={() => handleEditFloor(floor)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteFloor(floor.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'slots' && (
                        <div className="slots-tab">
                            <div className="slots-header">
                                <h2>Slot Management</h2>
                                <div className="slots-controls">
                                    <select 
                                        value={selectedFloorForSlots} 
                                        onChange={(e) => handleFloorFilterChange(e.target.value)}
                                        className="floor-filter"
                                    >
                                        <option value="">All Floors</option>
                                        {floors.map(floor => (
                                            <option key={floor.id} value={floor.id}>
                                                {floor.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button className="btn-primary" onClick={handleAddSlot}>
                                        + Add New Slot
                                    </button>
                                </div>
                            </div>
                            <div className="slots-list">
                                {slots.length === 0 ? (
                                    <p>No slots found. {selectedFloorForSlots ? 'Try selecting a different floor.' : 'Add a new slot to get started.'}</p>
                                ) : (
                                    slots.map(slot => (
                                        <div key={slot.id} className={`slot-card ${slot.isOccupied ? 'occupied' : 'available'}`}>
                                            <div className="slot-info">
                                                <h4>Slot {slot.slotNumber}</h4>
                                                <p><strong>Type:</strong> {slot.type}</p>
                                                <p><strong>Floor:</strong> {slot.floor?.name || 'Unknown'}</p>
                                                <span className={`status-badge ${slot.isOccupied ? 'occupied' : 'available'}`}>
                                                    {slot.isOccupied ? 'Occupied' : 'Available'}
                                                </span>
                                            </div>
                                            <div className="slot-actions">
                                                <button 
                                                    className="edit-btn"
                                                    onClick={() => handleEditSlot(slot)}
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    className="delete-btn"
                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <FloorModal
                isOpen={isFloorModalOpen}
                onClose={() => {
                    setIsFloorModalOpen(false);
                    setEditingFloor(null);
                }}
                floor={editingFloor}
                onSave={handleSaveFloor}
            />

            <SlotModal
                isOpen={isSlotModalOpen}
                onClose={() => {
                    setIsSlotModalOpen(false);
                    setEditingSlot(null);
                }}
                slot={editingSlot}
                floors={floors}
                onSave={handleSaveSlot}
            />
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Bell,
  Search,
  ChevronRight,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { adminService, patientService, appointmentService } from '../api/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load multiple data sources in parallel
      const [statsData, patientsData, appointmentsData] = await Promise.all([
        adminService.getDashboardStats(),
        patientService.getAllPatients(1, 5),
        appointmentService.getAllAppointments()
      ]);

      setStats(statsData);
      setRecentPatients(patientsData.patients || patientsData.data || []);
      setRecentAppointments(appointmentsData.appointments || appointmentsData.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <style>{styles}</style>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <style>{styles}</style>
        <div className="error-container">
          <AlertCircle size={48} />
          <p>{error}</p>
          <button onClick={loadDashboardData} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <style>{styles}</style>

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="header-right">
          <div className="search-box">
            <Search size={20} />
            <input type="text" placeholder="Search patients, doctors..." />
          </div>
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge">3</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon-wrapper primary">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Patients</p>
            <h3 className="stat-value">{stats?.totalPatients || 0}</h3>
            <div className="stat-trend positive">
              <TrendingUp size={16} />
              <span>+12% from last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon-wrapper success">
            <UserPlus size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Doctors</p>
            <h3 className="stat-value">{stats?.totalDoctors || 0}</h3>
            <div className="stat-trend positive">
              <TrendingUp size={16} />
              <span>+5% from last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon-wrapper warning">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Appointments</p>
            <h3 className="stat-value">{stats?.totalAppointments || 0}</h3>
            <div className="stat-trend negative">
              <TrendingDown size={16} />
              <span>-3% from last month</span>
            </div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon-wrapper info">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Revenue</p>
            <h3 className="stat-value">${stats?.totalRevenue || '0'}</h3>
            <div className="stat-trend positive">
              <TrendingUp size={16} />
              <span>+18% from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Patients */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Patients</h2>
              <p className="card-subtitle">Latest registered patients</p>
            </div>
            <button className="view-all-btn">
              View All
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="card-body">
            {recentPatients.length > 0 ? (
              <div className="patients-list">
                {recentPatients.slice(0, 5).map((patient, index) => (
                  <div key={patient.id || index} className="patient-item">
                    <div className="patient-avatar">
                      {patient.name?.charAt(0) || patient.fullName?.charAt(0) || 'P'}
                    </div>
                    <div className="patient-info">
                      <h4>{patient.name || patient.fullName || 'Unknown'}</h4>
                      <p>{patient.email || 'No email'}</p>
                    </div>
                    <div className="patient-meta">
                      <span className="patient-id">#{patient.id || '000'}</span>
                      <button className="action-btn">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <p>No patients yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Appointments */}
        <div className="content-card">
          <div className="card-header">
            <div>
              <h2 className="card-title">Today's Appointments</h2>
              <p className="card-subtitle">Scheduled for today</p>
            </div>
            <button className="view-all-btn">
              View All
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="card-body">
            {recentAppointments.length > 0 ? (
              <div className="appointments-list">
                {recentAppointments.slice(0, 5).map((appointment, index) => (
                  <div key={appointment.id || index} className="appointment-item">
                    <div className="appointment-time">
                      <Clock size={16} />
                      <span>{appointment.time || '10:00 AM'}</span>
                    </div>
                    <div className="appointment-details">
                      <h4>{appointment.patientName || 'Patient Name'}</h4>
                      <p>Dr. {appointment.doctorName || 'Doctor Name'}</p>
                    </div>
                    <div className={`appointment-status status-${appointment.status || 'pending'}`}>
                      {appointment.status === 'completed' && <CheckCircle size={16} />}
                      {appointment.status === 'cancelled' && <XCircle size={16} />}
                      {(!appointment.status || appointment.status === 'pending') && <Clock size={16} />}
                      <span>{appointment.status || 'pending'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={48} />
                <p>No appointments today</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="content-card quick-actions-card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="quick-actions-grid">
              <button className="quick-action-btn">
                <UserPlus size={24} />
                <span>Add Patient</span>
              </button>
              <button className="quick-action-btn">
                <UserPlus size={24} />
                <span>Add Doctor</span>
              </button>
              <button className="quick-action-btn">
                <Calendar size={24} />
                <span>Schedule Appointment</span>
              </button>
              <button className="quick-action-btn">
                <Activity size={24} />
                <span>View Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="content-card activity-card">
          <div className="card-header">
            <h2 className="card-title">System Activity</h2>
            <p className="card-subtitle">Recent system events</p>
          </div>
          <div className="card-body">
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon success">
                  <CheckCircle size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">New patient registered</p>
                  <span className="activity-time">5 minutes ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon info">
                  <Calendar size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">Appointment scheduled</p>
                  <span className="activity-time">15 minutes ago</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon warning">
                  <AlertCircle size={16} />
                </div>
                <div className="activity-content">
                  <p className="activity-text">Appointment cancelled</p>
                  <span className="activity-time">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Sora', sans-serif;
    background: #f8fafb;
    color: #1a1d29;
  }

  .dashboard-container {
    min-height: 100vh;
    padding: 2rem;
    background: linear-gradient(135deg, #f8fafb 0%, #e8f0f5 100%);
    position: relative;
  }

  .dashboard-container::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at 20% 50%, rgba(6, 182, 212, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .dashboard-container > * {
    position: relative;
    z-index: 1;
  }

  /* Loading State */
  .loading-container,
  .error-container {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(6, 182, 212, 0.1);
    border-top-color: #06b6d4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-container {
    color: #ef4444;
  }

  .retry-btn {
    padding: 0.75rem 2rem;
    background: #06b6d4;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .retry-btn:hover {
    background: #0891b2;
    transform: translateY(-2px);
  }

  /* Header */
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
    animation: slideDown 0.6s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header-left {
    flex: 1;
  }

  .dashboard-title {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
    letter-spacing: -1px;
  }

  .dashboard-subtitle {
    color: #64748b;
    font-size: 0.95rem;
  }

  .header-right {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.25rem;
    background: #f1f5f9;
    border-radius: 12px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
  }

  .search-box:focus-within {
    border-color: #06b6d4;
    background: white;
    box-shadow: 0 0 0 4px rgba(6, 182, 212, 0.1);
  }

  .search-box input {
    border: none;
    background: none;
    outline: none;
    font-family: 'Sora', sans-serif;
    font-size: 0.95rem;
    width: 250px;
  }

  .search-box svg {
    color: #94a3b8;
  }

  .notification-btn {
    position: relative;
    padding: 0.75rem;
    background: #f1f5f9;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .notification-btn:hover {
    background: #e2e8f0;
    transform: scale(1.05);
  }

  .notification-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 18px;
    height: 18px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    font-size: 0.7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    border: 2px solid white;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .stat-card {
    background: white;
    padding: 2rem;
    border-radius: 20px;
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;
    animation: fadeInUp 0.6s ease-out backwards;
  }

  .stat-card:nth-child(1) { animation-delay: 0.1s; }
  .stat-card:nth-child(2) { animation-delay: 0.2s; }
  .stat-card:nth-child(3) { animation-delay: 0.3s; }
  .stat-card:nth-child(4) { animation-delay: 0.4s; }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  }

  .stat-icon-wrapper {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-icon-wrapper.primary {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(6, 182, 212, 0.3);
  }

  .stat-icon-wrapper.success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
  }

  .stat-icon-wrapper.warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
  }

  .stat-icon-wrapper.info {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
  }

  .stat-content {
    flex: 1;
  }

  .stat-label {
    font-size: 0.875rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1d29;
    margin-bottom: 0.75rem;
    font-family: 'JetBrains Mono', monospace;
  }

  .stat-trend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .stat-trend.positive {
    color: #10b981;
  }

  .stat-trend.negative {
    color: #ef4444;
  }

  .stat-trend svg {
    width: 16px;
    height: 16px;
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 1.5rem;
  }

  .content-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.8);
    overflow: hidden;
    animation: fadeInUp 0.6s ease-out backwards;
    animation-delay: 0.5s;
  }

  .card-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1a1d29;
    margin-bottom: 0.25rem;
  }

  .card-subtitle {
    font-size: 0.875rem;
    color: #64748b;
  }

  .view-all-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f1f5f9;
    border: none;
    border-radius: 8px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    color: #06b6d4;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .view-all-btn:hover {
    background: #e2e8f0;
    transform: translateX(3px);
  }

  .card-body {
    padding: 1.5rem 2rem;
  }

  /* Patients List */
  .patients-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .patient-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .patient-item:hover {
    background: #f1f5f9;
    transform: translateX(5px);
  }

  .patient-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #06b6d4 0%, #6366f1 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .patient-info {
    flex: 1;
  }

  .patient-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1d29;
    margin-bottom: 0.25rem;
  }

  .patient-info p {
    font-size: 0.875rem;
    color: #64748b;
  }

  .patient-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .patient-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    color: #64748b;
    font-weight: 600;
  }

  .action-btn {
    padding: 0.5rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: #94a3b8;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  .action-btn:hover {
    background: #e2e8f0;
    color: #1a1d29;
  }

  /* Appointments List */
  .appointments-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .appointment-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
    transition: all 0.3s ease;
  }

  .appointment-item:hover {
    background: #f1f5f9;
    transform: translateX(5px);
  }

  .appointment-time {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: white;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.875rem;
    color: #1a1d29;
    flex-shrink: 0;
  }

  .appointment-time svg {
    color: #06b6d4;
  }

  .appointment-details {
    flex: 1;
  }

  .appointment-details h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1a1d29;
    margin-bottom: 0.25rem;
  }

  .appointment-details p {
    font-size: 0.875rem;
    color: #64748b;
  }

  .appointment-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .appointment-status.status-completed {
    background: #d1fae5;
    color: #059669;
  }

  .appointment-status.status-cancelled {
    background: #fee2e2;
    color: #dc2626;
  }

  .appointment-status.status-pending {
    background: #fef3c7;
    color: #d97706;
  }

  /* Quick Actions */
  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .quick-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 2rem 1rem;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    color: #1a1d29;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .quick-action-btn:hover {
    background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
    color: white;
    border-color: #06b6d4;
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(6, 182, 212, 0.3);
  }

  .quick-action-btn svg {
    transition: transform 0.3s ease;
  }

  .quick-action-btn:hover svg {
    transform: scale(1.1);
  }

  /* Activity List */
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: #f8fafc;
    border-radius: 12px;
  }

  .activity-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .activity-icon.success {
    background: #d1fae5;
    color: #059669;
  }

  .activity-icon.info {
    background: #dbeafe;
    color: #0284c7;
  }

  .activity-icon.warning {
    background: #fef3c7;
    color: #d97706;
  }

  .activity-content {
    flex: 1;
  }

  .activity-text {
    font-weight: 600;
    color: #1a1d29;
    margin-bottom: 0.25rem;
  }

  .activity-time {
    font-size: 0.875rem;
    color: #64748b;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    color: #94a3b8;
  }

  .empty-state svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 0.95rem;
    font-weight: 500;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .dashboard-container {
      padding: 1rem;
    }

    .dashboard-header {
      flex-direction: column;
      gap: 1.5rem;
      align-items: stretch;
    }

    .header-right {
      flex-direction: column;
    }

    .search-box input {
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .quick-actions-grid {
      grid-template-columns: 1fr;
    }

    .dashboard-title {
      font-size: 1.5rem;
    }
  }
`;
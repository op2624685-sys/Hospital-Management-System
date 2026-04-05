import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User, Upload, Briefcase, Stethoscope, AlertCircle, Loader, Heart, MapPin, Phone, Droplet, Calendar, Award, Building2, X, Save, Edit2 } from 'lucide-react';
import { userAPI, doctorAPI, patientAPI, adminAPI } from '../api/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, isLoggedIn, updateUserProfile, updateProfileCompletionStatus } = useAuth();
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePhoto || null);
  
  // Role-specific data states
  const [roleData, setRoleData] = useState(null);
  const [isLoadingRoleData, setIsLoadingRoleData] = useState(false);
  const [roleDataError, setRoleDataError] = useState(null);

  // Edit profile states for patient
  const [editMode, setEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    birthDate: '',
    gender: '',
    bloodGroup: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [editFormError, setEditFormError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch role-specific data
  useEffect(() => {
    if (!user?.roles || user.roles.length === 0) return;

    const fetchRoleData = async () => {
      setIsLoadingRoleData(true);
      setRoleDataError(null);
      
      try {
        // Prioritize roles in order: DOCTOR > PATIENT > ADMIN > HEADADMIN
        if (user.roles.includes('DOCTOR')) {
          const response = await doctorAPI.getProfile();
          setRoleData({ type: 'DOCTOR', data: response.data });
        } else if (user.roles.includes('PATIENT')) {
          try {
            const response = await patientAPI.getProfile();
            setRoleData({ type: 'PATIENT', data: response.data });
          } catch (patientError) {
            // If patient profile doesn't exist (404), create empty patient data
            // This typically happens for OAuth users without initialized patient records
            if (patientError?.response?.status === 404) {
              setRoleData({ type: 'PATIENT', data: null }); // null indicates profile needs completion
              setEditMode(true); // Auto-enable edit mode
              toast.info('Complete your profile to get started!');
            } else {
              throw patientError; // Re-throw if it's a different error
            }
          }
        } else if (user.roles.includes('ADMIN')) {
          const response = await adminAPI.getProfile();
          setRoleData({ type: 'ADMIN', data: response.data });
        } else if (user.roles.includes('HEADADMIN')) {
          setRoleData({ type: 'HEADADMIN', data: null });
        }
      } catch (error) {
        console.error('Failed to fetch role data:', error);
        setRoleDataError(error?.response?.data?.message || 'Failed to load profile details');
      } finally {
        setIsLoadingRoleData(false);
      }
    };

    fetchRoleData();
  }, [user?.roles]);

  // Initialize edit form data when roleData is loaded
  useEffect(() => {
    if (roleData?.type === 'PATIENT' && roleData?.data) {
      setEditFormData({
        birthDate: roleData.data.birthDate || '',
        gender: roleData.data.gender || '',
        bloodGroup: roleData.data.bloodGroup || ''
      });
    }
  }, [roleData]);

  // Get user initials
  const getInitials = (username) => {
    if (!username) return 'U';
    const parts = username.split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : username.substring(0, 2).toUpperCase();
  };

  // Generate consistent avatar background color
  const getAvatarColor = (username) => {
    if (!username) return 'var(--primary)';
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF'
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUpload = async () => {
    if (!profilePhoto) return;

    setIsLoadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', profilePhoto);

      const response = await userAPI.updateProfilePhoto(formData);
      
      // Update context with new profile photo
      updateUserProfile({ profilePhoto: response.data.profilePhoto });
      
      toast.success('Profile photo updated successfully!');
      setProfilePhoto(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setIsLoadingPhoto(false);
    }
  };

  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setEditFormError(null);
  };

  const validateProfileForm = () => {
    if (!editFormData.birthDate) {
      setEditFormError('Birth date is required');
      return false;
    }
    if (!editFormData.gender) {
      setEditFormError('Gender is required');
      return false;
    }
    if (!editFormData.bloodGroup) {
      setEditFormError('Blood group is required');
      return false;
    }
    return true;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;

    setIsUpdatingProfile(true);
    try {
      const response = await patientAPI.updateProfile(editFormData);
      
      // Update roleData with new patient info
      setRoleData({
        type: 'PATIENT',
        data: response.data
      });
      
      // Update profile completion status in context
      updateProfileCompletionStatus(true);
      
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to update profile';
      setEditFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditFormError(null);
    if (roleData?.type === 'PATIENT' && roleData?.data) {
      setEditFormData({
        birthDate: roleData.data.birthDate || '',
        gender: roleData.data.gender || '',
        bloodGroup: roleData.data.bloodGroup || ''
      });
    }
  };

  const initials = getInitials(user?.username);
  const avatarColor = getAvatarColor(user?.username);

  // Helper function to format consultation fee
  const formatFee = (fee) => {
    if (!fee) return 'N/A';
    return `₹${fee.toLocaleString('en-IN')}`;
  };

  // Helper function to format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className='min-h-screen pb-12 px-2 sm:px-4' style={{ background: 'var(--background)' }}>
      {/* Top Navigation */}
      <div className='fixed top-0 left-0 right-0 z-50 pt-2 sm:pt-4 px-2 sm:px-4' style={{ background: 'var(--background)' }}>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-300 hover:-translate-x-1'
            style={{
              color: 'var(--primary)',
              background: 'color-mix(in srgb, var(--primary) 12%, transparent)'
            }}>
            <ArrowLeft size={16} className='sm:w-5 sm:h-5' />
            <span className='text-xs sm:text-sm font-semibold'>Back</span>
          </button>
        </div>
      </div>

      <div className='max-w-4xl mx-auto pt-16 sm:pt-20'>
        {/* Hero Profile Section */}
        <div
          className='rounded-2xl sm:rounded-3xl overflow-hidden mb-4 sm:mb-8 shadow-lg sm:shadow-2xl'
          style={{
            background: `linear-gradient(135deg, var(--primary) 0%, ${avatarColor}20 100%)`,
            border: '1px solid var(--border)'
          }}>
          <div className='p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 md:gap-8'>
            {/* Avatar Container */}
            <div className='relative shrink-0'>
              <div
                className='w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center text-white font-bold text-3xl sm:text-4xl md:text-5xl shadow-md sm:shadow-xl md:shadow-2xl relative border-3 sm:border-4'
                style={{
                  background: previewUrl
                    ? `url(${previewUrl}) center/cover`
                    : avatarColor,
                  borderColor: 'rgba(255, 255, 255, 0.3)'
                }}>
                {!previewUrl && initials}
                
                {/* Upload Button */}
                <label
                  htmlFor='photo-upload'
                  className='absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 p-2 sm:p-3 rounded-full cursor-pointer transition-all duration-300 shadow-md hover:scale-110 active:scale-95'
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    border: '3px sm:border-4 solid var(--card)'
                  }}>
                  <Upload size={16} className='sm:w-5 sm:h-5 md:w-6 md:h-6' />
                  <input
                    id='photo-upload'
                    type='file'
                    accept='image/*'
                    onChange={handlePhotoChange}
                    className='hidden'
                    disabled={isLoadingPhoto}
                  />
                </label>
              </div>
            </div>

            {/* User Info */}
            <div className='flex-1 text-center md:text-left w-full md:w-auto'>
              <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2 truncate'>
                {user?.username || 'User'}
              </h1>
              <p className='text-white text-opacity-90 text-xs sm:text-sm md:text-lg mb-2 sm:mb-4 truncate'>
                {user?.email || 'Email not available'}
              </p>
              <div className='flex gap-2 justify-center md:justify-start flex-wrap'>
                {user?.roles?.map((role, idx) => (
                  <span
                    key={idx}
                    className='px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold text-white'
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Upload Section */}
          {profilePhoto && (
            <div className='px-4 sm:px-6 md:px-8 lg:px-12 pb-4 sm:pb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 border-t' style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
              <button
                onClick={handlePhotoUpload}
                disabled={isLoadingPhoto}
                className='flex-1 px-4 py-2 sm:py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base'
                style={{
                  background: 'var(--primary)',
                  opacity: isLoadingPhoto ? 0.6 : 1,
                }}>
                {isLoadingPhoto ? 'Uploading...' : 'Save Photo'}
              </button>
              <button
                onClick={() => {
                  setProfilePhoto(null);
                  setPreviewUrl(user?.profilePhoto || null);
                }}
                className='flex-1 px-4 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base'
                style={{
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.2)',
                }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoadingRoleData && (
          <div
            className='rounded-xl sm:rounded-2xl p-6 sm:p-12 mb-4 sm:mb-6 shadow-md sm:shadow-lg flex items-center justify-center gap-3'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              minHeight: '150px'
            }}>
            <Loader size={20} className='sm:w-6 sm:h-6 md:w-7 md:h-7 animate-spin' style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--muted-foreground)' }} className='text-sm sm:text-base md:text-lg'>Loading profile details...</span>
          </div>
        )}

        {/* Error State */}
        {roleDataError && (
          <div
            className='rounded-lg sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 flex items-start gap-3 border-l-4'
            style={{
              background: 'rgba(220, 38, 38, 0.1)',
              borderLeftColor: '#dc2626',
              color: '#dc2626'
            }}>
            <AlertCircle size={20} className='shrink-0 mt-0.5 sm:w-6 sm:h-6' />
            <div className='min-w-0'>
              <p className='font-bold text-sm sm:text-lg'>Error Loading Profile Details</p>
              <p className='text-xs sm:text-sm mt-1 opacity-90'>{roleDataError}</p>
            </div>
          </div>
        )}

        {/* DOCTOR Profile - Modern Design */}
        {!isLoadingRoleData && roleData?.type === 'DOCTOR' && roleData?.data && (
          <div className='mb-6 sm:mb-8'>
            <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
              <div className='p-2 sm:p-3 rounded-lg' style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                <Stethoscope size={20} className='sm:w-6 sm:h-6' style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold' style={{ color: 'var(--foreground)' }}>Doctor Profile</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
              {/* Main Info Card */}
              <div className='md:col-span-2 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow' style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6'>
                  {/* Name */}
                  <div className='flex items-start gap-3'>
                    <User size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Full Name</p>
                      <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 wrap-break-word' style={{ color: 'var(--foreground)' }}>{roleData.data.name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className='flex items-start gap-3'>
                    <Mail size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Email</p>
                      <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 break-all text-ellipsis overflow-hidden' style={{ color: 'var(--foreground)' }}>{(roleData.data.email || user?.email) || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className='flex items-start gap-3'>
                    <Award size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Specialization</p>
                      <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1' style={{ color: 'var(--foreground)' }}>{roleData.data.specialization || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Consultation Fee */}
                  <div className='flex items-start gap-3'>
                    <Heart size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Consultation Fee</p>
                      <p className='text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1' style={{ color: 'var(--primary)' }}>{formatFee(roleData.data.consultationFee)}</p>
                    </div>
                  </div>

                  {/* Branch */}
                  {roleData.data.branch && (
                    <div className='flex items-start gap-3'>
                      <Building2 size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                      <div className='min-w-0'>
                        <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Branch</p>
                        <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1' style={{ color: 'var(--foreground)' }}>{roleData.data.branch.name || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Departments */}
              {roleData.data.departments && roleData.data.departments.length > 0 && (
                <div className='md:col-span-2 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow' style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <h3 className='text-base sm:text-lg font-bold mb-3 sm:mb-4' style={{ color: 'var(--foreground)' }}>Associated Departments</h3>
                  <div className='flex flex-wrap gap-2 sm:gap-3'>
                    {roleData.data.departments.map((dept, idx) => (
                      <div
                        key={idx}
                        className='px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold'
                        style={{
                          background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                          color: 'var(--primary)',
                          border: '1px solid color-mix(in srgb, var(--primary) 25%, transparent)'
                        }}>
                        {dept.name || 'Department'}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PATIENT Profile - Modern Design */}
        {!isLoadingRoleData && roleData?.type === 'PATIENT' && roleData?.data && (
          <div className='mb-6 sm:mb-8'>
            <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
              <div className='p-2 sm:p-3 rounded-lg' style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                <Heart size={20} className='sm:w-6 sm:h-6' style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold' style={{ color: 'var(--foreground)' }}>Patient Profile</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
              {/* Main Info Card */}
              <div className='md:col-span-2 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow' style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6'>
                  {/* Name */}
                  <div className='flex items-start gap-3'>
                    <User size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Full Name</p>
                      <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 wrap-break-word' style={{ color: 'var(--foreground)' }}>{roleData.data.name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className='flex items-start gap-3'>
                    <Mail size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Email</p>
                      <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 break-all text-ellipsis overflow-hidden' style={{ color: 'var(--foreground)' }}>{(roleData.data.email || user?.email) || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  {roleData.data.birthDate && (
                    <div className='flex items-start gap-3'>
                      <Calendar size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                      <div className='min-w-0'>
                        <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Date of Birth</p>
                        <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 wrap-break-word' style={{ color: 'var(--foreground)' }}>{formatDate(roleData.data.birthDate)}</p>
                      </div>
                    </div>
                  )}

                  {/* Gender */}
                  {roleData.data.gender && (
                    <div className='flex items-start gap-3'>
                      <User size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                      <div className='min-w-0'>
                        <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Gender</p>
                        <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1' style={{ color: 'var(--foreground)' }}>{roleData.data.gender}</p>
                      </div>
                    </div>
                  )}

                  {/* Blood Group */}
                  {roleData.data.bloodGroup && (
                    <div className='flex items-start gap-3'>
                      <Droplet size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                      <div className='min-w-0'>
                        <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Blood Group</p>
                        <p className='text-lg sm:text-xl md:text-2xl font-bold mt-0.5 sm:mt-1' style={{ color: 'var(--primary)' }}>{roleData.data.bloodGroup}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Button or Edit Form */}
            {!editMode ? (
              <div className='mt-4 sm:mt-6'>
                <button
                  onClick={() => setEditMode(true)}
                  className='flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto text-sm sm:text-base'
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                  }}>
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className='mt-6 sm:mt-8 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md' style={{ background: 'var(--card)', border: '2px solid var(--primary)' }}>
                <div className='flex items-center justify-between mb-4 sm:mb-6'>
                  <h3 className='text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2' style={{ color: 'var(--foreground)' }}>
                    <Edit2 size={20} style={{ color: 'var(--primary)' }} />
                    Edit Patient Profile
                  </h3>
                </div>

                {editFormError && (
                  <div className='mb-4 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3' style={{ background: 'color-mix(in srgb, #ef4444 15%, transparent)', borderLeft: '3px solid #ef4444' }}>
                    <AlertCircle size={18} style={{ color: '#ef4444', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <p style={{ color: '#ef4444' }} className='text-sm sm:text-base font-medium'>{editFormError}</p>
                  </div>
                )}

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8'>
                  {/* Birth Date */}
                  <div className='md:col-span-2'>
                    <label style={{ color: 'var(--foreground)' }} className='block text-sm sm:text-base font-semibold mb-2'>
                      <div className='flex items-center gap-2'>
                        <Calendar size={16} style={{ color: 'var(--primary)' }} />
                        Date of Birth<span style={{ color: '#ef4444' }}>*</span>
                      </div>
                    </label>
                    <input
                      type='date'
                      value={editFormData.birthDate}
                      onChange={(e) => handleEditFormChange('birthDate', e.target.value)}
                      className='w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base transition-all duration-300'
                      style={{
                        background: 'var(--background)',
                        border: '2px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label style={{ color: 'var(--foreground)' }} className='block text-sm sm:text-base font-semibold mb-2'>
                      Gender<span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select
                      value={editFormData.gender}
                      onChange={(e) => handleEditFormChange('gender', e.target.value)}
                      className='w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base transition-all duration-300'
                      style={{
                        background: 'var(--background)',
                        border: '2px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <option value=''>Select Gender</option>
                      <option value='MALE'>Male</option>
                      <option value='FEMALE'>Female</option>
                      <option value='OTHER'>Other</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label style={{ color: 'var(--foreground)' }} className='block text-sm sm:text-base font-semibold mb-2'>
                      <div className='flex items-center gap-2'>
                        <Droplet size={16} style={{ color: 'var(--primary)' }} />
                        Blood Group<span style={{ color: '#ef4444' }}>*</span>
                      </div>
                    </label>
                    <select
                      value={editFormData.bloodGroup}
                      onChange={(e) => handleEditFormChange('bloodGroup', e.target.value)}
                      className='w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base transition-all duration-300'
                      style={{
                        background: 'var(--background)',
                        border: '2px solid var(--border)',
                        color: 'var(--foreground)',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                      <option value=''>Select Blood Group</option>
                      <option value='A_POSITIVE'>A+</option>
                      <option value='A_NEGATIVE'>A-</option>
                      <option value='B_POSITIVE'>B+</option>
                      <option value='B_NEGATIVE'>B-</option>
                      <option value='AB_POSITIVE'>AB+</option>
                      <option value='AB_NEGATIVE'>AB-</option>
                      <option value='O_POSITIVE'>O+</option>
                      <option value='O_NEGATIVE'>O-</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3'>
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className='flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base flex-1 sm:flex-none'
                    style={{
                      background: 'var(--primary)',
                      color: 'white',
                      opacity: isUpdatingProfile ? 0.6 : 1,
                      cursor: isUpdatingProfile ? 'not-allowed' : 'pointer',
                    }}>
                    {isUpdatingProfile ? (
                      <>
                        <Loader size={16} className='animate-spin' />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isUpdatingProfile}
                    className='flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold transition-all duration-300 text-sm sm:text-base flex-1 sm:flex-none'
                    style={{
                      background: 'color-mix(in srgb, var(--primary) 12%, transparent)',
                      color: 'var(--primary)',
                      border: '2px solid var(--primary)',
                      opacity: isUpdatingProfile ? 0.6 : 1,
                      cursor: isUpdatingProfile ? 'not-allowed' : 'pointer',
                    }}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INCOMPLETE PATIENT Profile - Needs Completion */}
        {!isLoadingRoleData && roleData?.type === 'PATIENT' && !roleData?.data && (
          <div className='mb-6 sm:mb-8'>
            <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
              <div className='p-2 sm:p-3 rounded-lg' style={{ background: 'color-mix(in srgb, #fbbf24 15%, transparent)' }}>
                <AlertCircle size={20} className='sm:w-6 sm:h-6' style={{ color: '#fbbf24' }} />
              </div>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold' style={{ color: 'var(--foreground)' }}>Complete Your Patient Profile</h2>
            </div>

            <div className='mb-6 p-4 sm:p-5 md:p-6 rounded-lg sm:rounded-2xl' style={{ background: 'color-mix(in srgb, #fbbf24 15%, transparent)', border: '2px solid #fbbf24' }}>
              <p style={{ color: '#fbbf24' }} className='font-semibold text-sm sm:text-base flex items-start gap-2'>
                <AlertCircle size={18} className='shrink-0 mt-0.5' />
                <span>Your patient profile is incomplete. Please provide the required medical information below to book appointments.</span>
              </p>
            </div>

            {/* Edit Form for New Patient */}
            <div className='mt-6 sm:mt-8 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md' style={{ background: 'var(--card)', border: '2px solid var(--primary)' }}>
              <div className='flex items-center justify-between mb-4 sm:mb-6'>
                <h3 className='text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2' style={{ color: 'var(--foreground)' }}>
                  <Heart size={20} style={{ color: 'var(--primary)' }} />
                  Patient Information
                </h3>
              </div>

              {editFormError && (
                <div className='mb-4 p-3 sm:p-4 rounded-lg flex items-start gap-2 sm:gap-3' style={{ background: 'color-mix(in srgb, #ef4444 15%, transparent)', borderLeft: '3px solid #ef4444' }}>
                  <AlertCircle size={18} style={{ color: '#ef4444', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                  <p style={{ color: '#ef4444' }} className='text-sm sm:text-base font-medium'>{editFormError}</p>
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8'>
                {/* Date of Birth */}
                <div>
                  <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--foreground)' }}>
                    Date of Birth <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <input
                    type='date'
                    value={editFormData.birthDate}
                    onChange={(e) => handleEditFormChange('birthDate', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className='w-full px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base transition-all'
                    style={{
                      background: 'var(--background)',
                      border: '2px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--foreground)' }}>
                    Gender <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => handleEditFormChange('gender', e.target.value)}
                    className='w-full px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base transition-all'
                    style={{
                      background: 'var(--background)',
                      border: '2px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <option value=''>Select Gender</option>
                    <option value='MALE'>Male</option>
                    <option value='FEMALE'>Female</option>
                    <option value='OTHER'>Other</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div className='md:col-span-2'>
                  <label className='block text-sm font-semibold mb-2' style={{ color: 'var(--foreground)' }}>
                    Blood Group <span style={{ color: 'var(--primary)' }}>*</span>
                  </label>
                  <select
                    value={editFormData.bloodGroup}
                    onChange={(e) => handleEditFormChange('bloodGroup', e.target.value)}
                    className='w-full px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base transition-all'
                    style={{
                      background: 'var(--background)',
                      border: '2px solid var(--border)',
                      color: 'var(--foreground)',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <option value=''>Select Blood Group</option>
                    <option value='A_POSITIVE'>A+</option>
                    <option value='A_NEGATIVE'>A-</option>
                    <option value='B_POSITIVE'>B+</option>
                    <option value='B_NEGATIVE'>B-</option>
                    <option value='AB_POSITIVE'>AB+</option>
                    <option value='AB_NEGATIVE'>AB-</option>
                    <option value='O_POSITIVE'>O+</option>
                    <option value='O_NEGATIVE'>O-</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3'>
                <button
                  onClick={handleUpdateProfile}
                  disabled={isUpdatingProfile}
                  className='flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base flex-1 sm:flex-none'
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    opacity: isUpdatingProfile ? 0.6 : 1,
                    cursor: isUpdatingProfile ? 'not-allowed' : 'pointer',
                  }}>
                  {isUpdatingProfile ? (
                    <>
                      <Loader size={16} className='animate-spin' />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Complete Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN Profile - Modern Design */}
        {!isLoadingRoleData && roleData?.type === 'ADMIN' && roleData?.data && (
          <div className='mb-6 sm:mb-8'>
            <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
              <div className='p-2 sm:p-3 rounded-lg' style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                <Briefcase size={20} className='sm:w-6 sm:h-6' style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold' style={{ color: 'var(--foreground)' }}>Admin Profile</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
              {/* Admin Info Card */}
              <div className='md:col-span-2 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow' style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <h3 className='text-base sm:text-lg font-bold mb-3 sm:mb-4' style={{ color: 'var(--foreground)' }}>Your Information</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6'>
                  {/* Name */}
                  <div className='flex items-start gap-3'>
                    <User size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Name</p>
                      <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1' style={{ color: 'var(--foreground)' }}>{roleData.data.name || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className='flex items-start gap-3'>
                    <Mail size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Email</p>
                      <p className='text-base sm:text-lg md:text-xl font-bold break-all text-ellipsis overflow-hidden mt-0.5 sm:mt-1' style={{ color: 'var(--foreground)' }}>{(roleData.data.email || user?.email) || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch Info Card - Only if branch exists */}
              {roleData.data.branch && (
                <div className='md:col-span-2 rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow' style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <h3 className='text-base sm:text-lg font-bold mb-3 sm:mb-4' style={{ color: 'var(--foreground)' }}>Branch Assignment</h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6'>
                    {/* Branch Name */}
                    {roleData.data.branch.name && (
                      <div className='flex items-start gap-3'>
                        <Building2 size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                        <div className='min-w-0'>
                          <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Branch Name</p>
                          <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 wrap-break-word' style={{ color: 'var(--foreground)' }}>{roleData.data.branch.name}</p>
                        </div>
                      </div>
                    )}

                    {/* Branch Email */}
                    {roleData.data.branch.email && (
                      <div className='flex items-start gap-3'>
                        <Mail size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                        <div className='min-w-0'>
                          <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Branch Email</p>
                          <p className='text-base sm:text-lg md:text-xl font-bold break-all text-ellipsis overflow-hidden mt-0.5 sm:mt-1' style={{ color: 'var(--foreground)' }}>{roleData.data.branch.email}</p>
                        </div>
                      </div>
                    )}

                    {/* Contact Number */}
                    {roleData.data.branch.contactNumber && (
                      <div className='flex items-start gap-3'>
                        <Phone size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                        <div className='min-w-0'>
                          <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Contact Number</p>
                          <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1' style={{ color: 'var(--foreground)' }}>{roleData.data.branch.contactNumber}</p>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {roleData.data.branch.address && (
                      <div className='sm:col-span-2 flex items-start gap-3'>
                        <MapPin size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                        <div className='min-w-0'>
                          <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Address</p>
                          <p className='text-base sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 wrap-break-word' style={{ color: 'var(--foreground)' }}>{roleData.data.branch.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HEADADMIN Profile - Modern Design */}
        {!isLoadingRoleData && roleData?.type === 'HEADADMIN' && (
          <div className='mb-6 sm:mb-8'>
            <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6'>
              <div className='p-2 sm:p-3 rounded-lg' style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
                <Award size={20} className='sm:w-6 sm:h-6' style={{ color: 'var(--primary)' }} />
              </div>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold' style={{ color: 'var(--foreground)' }}>Head Admin Profile</h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6'>
              <div className='rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow' style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className='space-y-4 sm:space-y-5'>
                  {/* Username */}
                  <div className='flex items-start gap-3'>
                    <User size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                    <div className='min-w-0'>
                      <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Username</p>
                      <p className='text-base sm:text-lg font-bold mt-0.5 sm:mt-1 wrap-break-word' style={{ color: 'var(--foreground)' }}>{user?.username || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className='rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-md hover:shadow-lg transition-shadow' style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className='flex items-start gap-3'>
                  <Mail size={18} style={{ color: 'var(--primary)', marginTop: '2px' }} className='shrink-0 sm:w-5 sm:h-5' />
                  <div className='min-w-0'>
                    <p className='text-xs sm:text-sm font-semibold' style={{ color: 'var(--muted-foreground)' }}>Email</p>
                    <p className='text-base sm:text-lg font-bold break-all text-ellipsis overflow-hidden mt-0.5 sm:mt-1' style={{ color: 'var(--foreground)' }}>{user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div
          className='rounded-lg sm:rounded-xl p-3 sm:p-4 text-xs sm:text-sm mt-6 sm:mt-8 border-l-4'
          style={{
            background: 'color-mix(in srgb, var(--primary) 8%, transparent)',
            borderLeftColor: 'var(--primary)',
            color: 'var(--foreground)',
          }}>
          <p className='flex items-start gap-2'>
            <span className='text-base sm:text-lg shrink-0 mt-0.5'>💡</span>
            <span><strong>Pro Tip:</strong> Click the camera icon on your avatar to update your profile photo. Have a great day!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

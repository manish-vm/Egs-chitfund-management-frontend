import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdPerson, MdEmail, MdLock, MdPhone, MdLocationOn, MdHome, MdImage,
} from 'react-icons/md';
import { register } from '../services/auth';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    location: '',
    profileImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

    if (!emailRegex.test(formData.email)) {
      setError('❌ Invalid email format.');
      return false;
    }
    if (!passwordRegex.test(formData.password)) {
      setError('❌ Password must be 6+ chars, 1 uppercase, 1 number & 1 special char.');
      return false;
    }
    return true;
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  if (!validateForm()) return;

  const data = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null) data.append(key, value);
  });

  try {
    await register(data);
    const successMsg = '✅ Registration successful! Redirecting... 🚀';
    setSuccess(successMsg);
    alert(successMsg);
    setTimeout(() => navigate('/login'), 2000);
  } catch (err) {
    const message = err?.response?.data?.message || '❌ Registration failed. Please try again ⚠️';
    setError(message);
    alert(message);
  }
};

  return (
    <div className="register-wrapper">
      <div className="register-container">
        <h2 className="register-title">Create an Account</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="register-form">
          {/* Profile Image Upload */}
          <div className="image-upload">
            <label className="image-label">
              <div className="image-preview">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" />
                ) : (
                  <MdImage size={30} className="image-placeholder" />
                )}
              </div>
              <input
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="image-text">Upload Image</p>
            </label>
          </div>

          {/* Input Fields */}
          <div className="form-grid">
            <Input name="name" placeholder="Full Name" Icon={MdPerson} value={formData.name} onChange={handleChange} />
            <Input name="email" placeholder="Email" Icon={MdEmail} value={formData.email} onChange={handleChange} />
            <Input name="password" type="password" placeholder="Password" Icon={MdLock} value={formData.password} onChange={handleChange} />
            <Input name="phone" placeholder="Phone Number" Icon={MdPhone} value={formData.phone} onChange={handleChange} />
            <Input name="address" placeholder="Address" Icon={MdHome} value={formData.address} onChange={handleChange} />
            <Input name="location" placeholder="Location" Icon={MdLocationOn} value={formData.location} onChange={handleChange} />
          </div>

        
<div className="submit-container900">
  <button type="submit" className="register-btn900">Register</button>
</div>
      </form>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

const Input = ({ name, type = 'text', placeholder, Icon, value, onChange }) => (
  <div className="input-wrapper">
    <Icon className="input-icon" />
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
    />
  </div>
);

export default Register;

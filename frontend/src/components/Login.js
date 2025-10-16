import React, { useState } from 'react';

const Login = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting login with:', formData);

    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('currentPage', 'dashboard');
      console.log('Token saved:', data.token);
      onSwitch('dashboard');
    } catch (error) {
      console.error('Login error:', error.message);
      setErrors({ general: error.message });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-5">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-lg -z-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 -z-10" />
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex max-w-4xl w-full min-h-[600px]">
        <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center relative overflow-hidden">
          <div className="text-center text-white p-10 relative z-10">
            <h1 className="text-4xl font-bold mb-5 leading-tight">Home Energy Monitoring</h1>
            <p className="text-xl font-normal mb-10 opacity-90">Empowering Homes, Saving Energy</p>
            <div className="text-6xl text-yellow-300">
              <i className="fas fa-lightbulb"></i>
            </div>
          </div>
        </div>
        <div className="flex-1 p-16 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">Sign in</h2>
            {errors.general && <div className="text-red-500 text-sm mb-4">{errors.general}</div>}
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="relative flex items-center">
                    <i className="fas fa-envelope absolute left-4 text-gray-400 z-10"></i>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-base transition-all duration-300 box-border ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100'
                      }`}
                    />
                  </div>
                  {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email}</span>}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="relative flex items-center">
                    <i className="fas fa-lock absolute left-4 text-gray-400 z-10"></i>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl text-base transition-all duration-300 box-border ${
                        errors.password
                          ? 'border-red-500 focus:border-red-500'
                          : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-100'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-4 bg-transparent border-none text-gray-400 cursor-pointer p-1 transition-colors duration-300 hover:text-gray-600"
                      onClick={togglePasswordVisibility}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
                </div>
                <div className="flex justify-end items-center">
                  <button
                    type="button"
                    onClick={() => onSwitch && onSwitch('forgot')}
                    className="text-blue-500 text-sm font-semibold transition-colors duration-300 hover:text-blue-700 bg-transparent border-none cursor-pointer p-0"
                  >
                    Forgot Password?
                  </button>
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-4 px-8 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 mt-3 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-300 active:translate-y-0"
                >
                  Sign in
                </button>
              </div>
            </form>
            <div className="text-center mt-8">
              <p className="text-gray-600 m-0">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => onSwitch && onSwitch('signup')}
                  className="text-blue-500 no-underline font-semibold transition-colors duration-300 hover:text-blue-700 bg-transparent border-none cursor-pointer p-0"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
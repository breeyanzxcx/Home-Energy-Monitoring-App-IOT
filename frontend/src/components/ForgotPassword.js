import React, { useState } from 'react';

const ForgotPassword = ({ onSwitch }) => {
  const [step, setStep] = useState('phone'); // 'phone', 'otp', 'success', 'error'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handlePhoneSubmit = () => {
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }
    if (!/^\d{10,}$/.test(phoneNumber.replace(/[\s-]/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setError('');
    setStep('otp');
    console.log('OTP sent to:', phoneNumber);
  };

  const handleOtpSubmit = () => {
    if (!otp) {
      setError('OTP is required');
      return;
    }
    
    // Simulate OTP verification (replace with actual API call)
    if (otp === '123456') {
      setError('');
      setStep('success');
      console.log('OTP verified successfully');
    } else {
      setStep('error');
      setError('');
    }
  };

  const handleSendAnother = () => {
    setOtp('');
    setStep('phone');
    setError('');
  };

  const handleBackToLogin = () => {
    if (onSwitch) {
      onSwitch('login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-5">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-lg -z-10"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2016&q=80')"
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 -z-10" />
      
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex max-w-4xl w-full min-h-[600px]">
        <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center relative overflow-hidden">
          <div className="text-center text-white p-10 relative z-10">
            <h1 className="text-4xl font-bold mb-5 leading-tight">
              Home Energy Monitoring
            </h1>
            <p className="text-xl font-normal mb-10 opacity-90">
              Empowering Homes, Saving Energy
            </p>
            <div className="text-6xl text-yellow-300">
              <i className="fas fa-lightbulb"></i>
            </div>
          </div>
        </div>
        
        <div className="flex-1 p-16 flex items-center justify-center">
          <div className="w-full max-w-sm">
            {step === 'phone' && (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                  Forgot Password?
                </h2>
                <p className="text-gray-600 text-center mb-10 text-sm">
                  Enter your phone number to receive an OTP
                </p>
                
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="relative flex items-center">
                      <i className="fas fa-phone absolute left-4 text-gray-400 z-10"></i>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setError('');
                        }}
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-base transition-all duration-300 box-border ${
                          error 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100'
                        }`}
                      />
                    </div>
                    {error && (
                      <span className="text-red-500 text-sm mt-1">{error}</span>
                    )}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handlePhoneSubmit}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-4 px-8 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 mt-3 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-300 active:translate-y-0"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}

            {step === 'otp' && (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                  Enter OTP
                </h2>
                <p className="text-gray-600 text-center mb-10 text-sm">
                  We've sent a code to {phoneNumber}
                </p>
                
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="relative flex items-center">
                      <i className="fas fa-key absolute left-4 text-gray-400 z-10"></i>
                      <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => {
                          setOtp(e.target.value);
                          setError('');
                        }}
                        maxLength="6"
                        className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl text-base transition-all duration-300 box-border ${
                          error 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-100'
                        }`}
                      />
                    </div>
                    {error && (
                      <span className="text-red-500 text-sm mt-1">{error}</span>
                    )}
                  </div>
                  
                  <button 
                    type="button"
                    onClick={handleOtpSubmit}
                    className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none py-4 px-8 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 mt-3 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-300 active:translate-y-0"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}

            {step === 'success' && (
              <>
                <div className="text-center">
                  <div className="text-6xl text-green-500 mb-6">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Success!
                  </h2>
                  <p className="text-gray-600 mb-10">
                    Your password has been reset successfully
                  </p>
                  
                  <button 
                    type="button"
                    onClick={handleBackToLogin}
                    className="bg-gradient-to-r from-green-500 to-green-700 text-white border-none py-4 px-8 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-300 active:translate-y-0"
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}

            {step === 'error' && (
              <>
                <div className="text-center">
                  <div className="text-6xl text-red-500 mb-6">
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Wrong OTP
                  </h2>
                  <p className="text-gray-600 mb-10">
                    The OTP you entered is incorrect. Please send another request.
                  </p>
                  
                  <button 
                    type="button"
                    onClick={handleSendAnother}
                    className="bg-gradient-to-r from-red-500 to-red-700 text-white border-none py-4 px-8 rounded-xl text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-300 active:translate-y-0"
                  >
                    Send Another Request
                  </button>
                </div>
              </>
            )}
            
            <div className="text-center mt-8">
              <p className="text-gray-600 m-0">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-blue-500 no-underline font-semibold transition-colors duration-300 hover:text-purple-700 bg-transparent border-none cursor-pointer p-0"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
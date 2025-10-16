import React, { useState } from "react";
import axios from "axios";

const Signup = ({ onSwitch }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/users/register", formData);
      alert("Account created successfully!");
      console.log("✅ Server response:", response.data);
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      if (err.response) {
        alert(err.response.data.message || "Registration failed");
      } else {
        alert("Error connecting to server");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-5">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat blur-lg -z-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2016&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 -z-10" />

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex max-w-4xl w-full min-h-[600px]">
        <div className="flex-1 bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center">
          <div className="text-center text-white p-10">
            <h1 className="text-4xl font-bold mb-5">Home Energy Monitoring</h1>
            <p className="text-xl opacity-90 mb-10">
              Empowering Homes, Saving Energy
            </p>
            <div className="text-6xl text-yellow-400">
              <i className="fas fa-lightbulb"></i>
            </div>
          </div>
        </div>

        <div className="flex-1 p-16 flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
              Sign up
            </h2>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl text-base ${
                    errors.name
                      ? "border-red-500"
                      : "border-gray-200 focus:border-blue-500 focus:shadow-lg"
                  }`}
                />
                {errors.name && (
                  <span className="text-red-500 text-sm">{errors.name}</span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl text-base ${
                    errors.email
                      ? "border-red-500"
                      : "border-gray-200 focus:border-blue-500 focus:shadow-lg"
                  }`}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl text-base ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-200 focus:border-blue-500 focus:shadow-lg"
                  }`}
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">{errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 px-8 rounded-xl font-semibold hover:shadow-lg transition"
              >
                {loading ? "Creating Account..." : "Sign up"}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => onSwitch && onSwitch("login")}
                  className="text-blue-500 font-semibold hover:text-blue-700"
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

export default Signup;

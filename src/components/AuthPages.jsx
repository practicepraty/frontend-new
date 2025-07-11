import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Stethoscope, Check, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setPage } from '../utils/logSlice';
import { useAuth } from '../context/AuthContext';

const AuthPages = () => {
    const currentPage = useSelector((store) => store.log.currentPage);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, forgotPassword, isLoading, error, clearError } = useAuth();
    
    const setCurrentPage = (page) => {
        dispatch(setPage(page));
        clearError();
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        professionalEmail: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        specialty: '',
        licenseNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        if (error) {
            setShowMessage(true);
            const timer = setTimeout(() => {
                setShowMessage(false);
                clearError();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, clearError]);

    useEffect(() => {
        if (successMessage) {
            setShowMessage(true);
            const timer = setTimeout(() => {
                setShowMessage(false);
                setSuccessMessage('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.professionalEmail) {
            newErrors.professionalEmail = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.professionalEmail)) {
            newErrors.professionalEmail = 'Please enter a valid email address';
        }

        if (currentPage !== 'forgot') {
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            }
        }

        if (currentPage === 'signup') {
            if (!formData.fullName) {
                newErrors.fullName = 'Full name is required';
            }
            if (!formData.specialty) {
                newErrors.specialty = 'Medical specialty is required';
            }
            if (!formData.licenseNumber) {
                newErrors.licenseNumber = 'License number is required';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            if (currentPage === 'signin') {
                const result = await login({
                    professionalEmail: formData.professionalEmail,
                    password: formData.password
                });

                if (result.success) {
                    setSuccessMessage(result.message);
                    const from = location.state?.from?.pathname || '/builder';
                    setTimeout(() => navigate(from), 1000);
                }
            } else if (currentPage === 'signup') {
                navigate('/register');
            } else if (currentPage === 'forgot') {
                const result = await forgotPassword(formData.professionalEmail);
                
                if (result.success) {
                    setSuccessMessage(result.message);
                    setTimeout(() => setCurrentPage('signin'), 2000);
                }
            }
        } catch (error) {
            console.error('Form submission error:', error);
        }
    };

    const InputField = ({
        name,
        type = 'text',
        placeholder,
        icon: Icon,
        showPasswordToggle = false
    // eslint-disable-next-line no-unused-vars
    }) => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Icon className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className={`w-full pl-12 ${showPasswordToggle ? 'pr-12' : 'pr-4'} py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md ${errors[name]
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                placeholder={placeholder}
            />
            {showPasswordToggle && (
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                </button>
            )}
            {errors[name] && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors[name]}
                </p>
            )}
        </div>
    );

    const ConfirmPasswordField = () => (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md ${errors.confirmPassword
                        ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                placeholder="Confirm your password"
            />
            <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 hover:bg-gray-50 rounded-r-xl transition-colors duration-200"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
                {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
            </button>
            {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                    <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                    {errors.confirmPassword}
                </p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Message Notifications */}
                {showMessage && (error || successMessage) && (
                    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border-l-4 ${
                        error 
                            ? 'bg-red-50 border-red-500 text-red-700' 
                            : 'bg-green-50 border-green-500 text-green-700'
                    }`}>
                        <div className="flex items-center">
                            {error ? (
                                <X className="w-5 h-5 mr-2" />
                            ) : (
                                <Check className="w-5 h-5 mr-2" />
                            )}
                            <span className="font-medium">{error || successMessage}</span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-4 shadow-lg">
                        <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Doctor's Website Builder
                    </h1>
                    <p className="text-gray-600">
                        {currentPage === 'signin' && 'Sign in to your account'}
                        {currentPage === 'signup' && 'Create your professional account'}
                        {currentPage === 'forgot' && 'Reset your password'}
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* Back Button */}
                    {currentPage !== 'signin' && (
                        <button
                            onClick={() => setCurrentPage('signin')}
                            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200 hover:bg-blue-50 px-2 py-1 rounded-lg -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Sign In
                        </button>
                    )}

                    <div className="space-y-6">
                        {/* Sign In Form */}
                        {currentPage === 'signin' && (
                            <>
                                <InputField
                                    name="professionalEmail"
                                    type="email"
                                    placeholder="Enter your professional email address"
                                    icon={Mail}
                                />

                                <InputField
                                    name="password"
                                    placeholder="Enter your password"
                                    icon={Lock}
                                    showPasswordToggle={true}
                                />

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                                        />
                                        <span className="ml-3 text-sm text-gray-600">Remember me</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage('forgot')}
                                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
                                    >
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Signing in...
                                        </div>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                <div className="text-center pt-4">
                                    <span className="text-gray-600">Don't have an account? </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage('signup')}
                                        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200 hover:underline"
                                    >
                                        Sign up here
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Sign Up Form */}
                        {currentPage === 'signup' && (
                            <>
                                <InputField
                                    name="fullName"
                                    placeholder="Full Name (Dr. John Smith)"
                                    icon={User}
                                />

                                <InputField
                                    name="professionalEmail"
                                    type="email"
                                    placeholder="Professional email address"
                                    icon={Mail}
                                />

                                <div>
                                    <select
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 text-gray-700 shadow-sm hover:shadow-md ${errors.specialty
                                                ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-100'
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select your medical specialty</option>
                                        <option value="general">General Practice</option>
                                        <option value="cardiology">Cardiology</option>
                                        <option value="dermatology">Dermatology</option>
                                        <option value="neurology">Neurology</option>
                                        <option value="orthopedics">Orthopedics</option>
                                        <option value="pediatrics">Pediatrics</option>
                                        <option value="psychiatry">Psychiatry</option>
                                        <option value="surgery">Surgery</option>
                                        <option value="other">Other</option>
                                    </select>
                                    {errors.specialty && (
                                        <p className="mt-2 text-sm text-red-600 flex items-center">
                                            <span className="w-1 h-1 bg-red-600 rounded-full mr-2"></span>
                                            {errors.specialty}
                                        </p>
                                    )}
                                </div>

                                <InputField
                                    name="licenseNumber"
                                    placeholder="Medical license number"
                                    icon={Stethoscope}
                                />

                                <InputField
                                    name="password"
                                    placeholder="Create a strong password"
                                    icon={Lock}
                                    showPasswordToggle={true}
                                />

                                <ConfirmPasswordField />

                                <div className="flex items-start">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 mt-1"
                                        required
                                    />
                                    <span className="ml-3 text-sm text-gray-600 leading-relaxed">
                                        I agree to the <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline">Privacy Policy</a>
                                    </span>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Creating account...
                                        </div>
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </>
                        )}

                        {/* Forgot Password Form */}
                        {currentPage === 'forgot' && (
                            <>
                                <div className="text-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        Reset Your Password
                                    </h2>
                                    <p className="text-gray-600 leading-relaxed">
                                        Enter your email address and we'll send you instructions to reset your password.
                                    </p>
                                </div>

                                <InputField
                                    name="professionalEmail"
                                    type="email"
                                    placeholder="Enter your registered email address"
                                    icon={Mail}
                                />

                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Sending instructions...
                                        </div>
                                    ) : (
                                        'Send Reset Instructions'
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Secure • HIPAA Compliant • Professional</p>
                </div>
            </div>
        </div>
    );
};

export default AuthPages;
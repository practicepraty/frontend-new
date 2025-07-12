import React, { useState } from 'react';
import { Eye, EyeOff, Upload, Check, AlertCircle, Stethoscope, User, Mail, Lock, MapPin, Calendar, Award, Building, Phone, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DoctorRegistration = () => {
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuth();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Information
        title: '',
        firstName: '',
        lastName: '',
        professionalEmail: '',
        phone: '',
        dateOfBirth: '',
        gender: '',

        // Professional Information
        specialty: '',
        subSpecialty: '',
        licenseNumber: '',
        licenseState: '',
        yearsOfExperience: '',
        medicalSchool: '',
        degreeType: '',
        postGraduation: '',

        // Practice Information
        practiceType: '',
        institutionName: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        },

        // Account Security
        password: '',
        confirmPassword: '',

        // Additional
        profilePhoto: null,
        cv: null,
        acceptTerms: false,
        acceptPrivacy: false,
        marketingEmails: true
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    const steps = [
        { number: 1, title: 'Personal Information', icon: User },
        { number: 2, title: 'Professional Details', icon: Award },
        { number: 3, title: 'Practice Information', icon: Building },
        { number: 4, title: 'Account Security', icon: Lock }
    ];

    const indianStates = [
        { value: 'AN', label: 'Andaman and Nicobar Islands' },
        { value: 'AP', label: 'Andhra Pradesh' },
        { value: 'AR', label: 'Arunachal Pradesh' },
        { value: 'AS', label: 'Assam' },
        { value: 'BR', label: 'Bihar' },
        { value: 'CH', label: 'Chandigarh' },
        { value: 'CT', label: 'Chhattisgarh' },
        { value: 'DN', label: 'Dadra and Nagar Haveli' },
        { value: 'DD', label: 'Daman and Diu' },
        { value: 'DL', label: 'Delhi' },
        { value: 'GA', label: 'Goa' },
        { value: 'GJ', label: 'Gujarat' },
        { value: 'HR', label: 'Haryana' },
        { value: 'HP', label: 'Himachal Pradesh' },
        { value: 'JK', label: 'Jammu and Kashmir' },
        { value: 'JH', label: 'Jharkhand' },
        { value: 'KA', label: 'Karnataka' },
        { value: 'KL', label: 'Kerala' },
        { value: 'LD', label: 'Lakshadweep' },
        { value: 'MP', label: 'Madhya Pradesh' },
        { value: 'MH', label: 'Maharashtra' },
        { value: 'MN', label: 'Manipur' },
        { value: 'ML', label: 'Meghalaya' },
        { value: 'MZ', label: 'Mizoram' },
        { value: 'NL', label: 'Nagaland' },
        { value: 'OR', label: 'Odisha' },
        { value: 'PY', label: 'Puducherry' },
        { value: 'PB', label: 'Punjab' },
        { value: 'RJ', label: 'Rajasthan' },
        { value: 'SK', label: 'Sikkim' },
        { value: 'TN', label: 'Tamil Nadu' },
        { value: 'TG', label: 'Telangana' },
        { value: 'TR', label: 'Tripura' },
        { value: 'UP', label: 'Uttar Pradesh' },
        { value: 'UT', label: 'Uttarakhand' },
        { value: 'WB', label: 'West Bengal' }
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (name.includes('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.title) newErrors.title = 'Title is required';
            if (!formData.firstName) newErrors.firstName = 'First name is required';
            if (!formData.lastName) newErrors.lastName = 'Last name is required';
            if (!formData.professionalEmail) newErrors.professionalEmail = 'Professional email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.professionalEmail)) newErrors.professionalEmail = 'Invalid email format';
            if (!formData.phone) newErrors.phone = 'Mobile number is required';
            else if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = 'Enter valid Indian mobile number';
            if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
            if (!formData.gender) newErrors.gender = 'Gender is required';
        }

        if (step === 2) {
            if (!formData.specialty) newErrors.specialty = 'Medical specialty is required';
            if (!formData.licenseNumber) newErrors.licenseNumber = 'Registration number is required';
            if (!formData.licenseState) newErrors.licenseState = 'Registration state is required';
            if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
            if (!formData.medicalSchool) newErrors.medicalSchool = 'Medical college is required';
            if (!formData.degreeType) newErrors.degreeType = 'Degree type is required';
        }

        if (step === 3) {
            if (!formData.practiceType) newErrors.practiceType = 'Practice type is required';
            if (!formData.institutionName) newErrors.institutionName = 'Institution name is required';
            if (!formData.address.street) newErrors['address.street'] = 'Address is required';
            if (!formData.address.city) newErrors['address.city'] = 'City is required';
            if (!formData.address.state) newErrors['address.state'] = 'State is required';
            if (!formData.address.zipCode) newErrors['address.zipCode'] = 'ZIP code is required';
            else if (!/^\d{6}$/.test(formData.address.zipCode)) newErrors['address.zipCode'] = 'Enter valid 6-digit ZIP code';
        }

        if (step === 4) {
            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
            if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
            if (!formData.acceptPrivacy) newErrors.acceptPrivacy = 'You must accept the privacy policy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(4)) return;

        try {
            const formDataToSubmit = new FormData();
            
            // Personal Information
            formDataToSubmit.append('title', formData.title);
            formDataToSubmit.append('firstName', formData.firstName);
            formDataToSubmit.append('lastName', formData.lastName);
            formDataToSubmit.append('professionalEmail', formData.professionalEmail);
            formDataToSubmit.append('phone', formData.phone);
            formDataToSubmit.append('dateOfBirth', formData.dateOfBirth);
            formDataToSubmit.append('gender', formData.gender);
            
            // Professional Information
            formDataToSubmit.append('specialty', formData.specialty);
            formDataToSubmit.append('subSpecialty', formData.subSpecialty || '');
            formDataToSubmit.append('licenseNumber', formData.licenseNumber);
            formDataToSubmit.append('licenseState', formData.licenseState);
            formDataToSubmit.append('yearsOfExperience', formData.yearsOfExperience);
            formDataToSubmit.append('medicalSchool', formData.medicalSchool);
            formDataToSubmit.append('degreeType', formData.degreeType);
            formDataToSubmit.append('postGraduation', formData.postGraduation);
            formDataToSubmit.append('boardCertifications', formData.boardCertifications || '');
            
            // Practice Information
            formDataToSubmit.append('practiceType', formData.practiceType);
            formDataToSubmit.append('institutionName', formData.institutionName);
            formDataToSubmit.append('street', formData.address.street);
            formDataToSubmit.append('city', formData.address.city);
            formDataToSubmit.append('state', formData.address.state);
            formDataToSubmit.append('zipCode', formData.address.zipCode);
            formDataToSubmit.append('country', formData.address.country || '');
            formDataToSubmit.append('latitude', formData.address.latitude || '');
            formDataToSubmit.append('longitude', formData.address.longitude || '');
            formDataToSubmit.append('officeHours', formData.officeHours || '');
            formDataToSubmit.append('languages', formData.languages || '');
            formDataToSubmit.append('insuranceAccepted', formData.insuranceAccepted || '');
            
            // Account Security
            formDataToSubmit.append('password', formData.password);
            
            // Files
            if (formData.profilePhoto) {
                formDataToSubmit.append('profilePhoto', formData.profilePhoto);
            }
            if (formData.cv) {
                formDataToSubmit.append('cv', formData.cv);
            }
            
            const result = await register(formDataToSubmit);
            
            if (result.success) {
                setSuccessMessage(result.message);
                setShowMessage(true);
                setTimeout(() => {
                    navigate('/auth');
                }, 3000);
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    const InputField = ({
        name,
        type = 'text',
        placeholder,
        icon: Icon,
        showPasswordToggle = false,
        required = false
    }) => (
        <div className="relative">
            {Icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-blue-400" />
                </div>
            )}
            <input
                type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
                name={name}
                value={name.includes('.') ? formData[name.split('.')[0]][name.split('.')[1]] : formData[name]}
                onChange={handleInputChange}
                className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-${showPasswordToggle ? '12' : '4'} py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                placeholder={placeholder}
                required={required}
            />
            {showPasswordToggle && (
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                    )}
                </button>
            )}
            {errors[name] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors[name]}
                </p>
            )}
        </div>
    );

    const SelectField = ({ name, options, placeholder, required = false }) => (
        <div>
            <select
                name={name}
                value={formData[name]}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                required={required}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {errors[name] && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors[name]}
                </p>
            )}
        </div>
    );

    const FileUpload = ({ name, accept, label }) => (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors duration-200">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <label className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-700 font-medium">
                    Upload {label}
                </span>
                <input
                    type="file"
                    name={name}
                    accept={accept}
                    onChange={handleInputChange}
                    className="hidden"
                />
            </label>
            {formData[name] && (
                <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                    <Check className="w-4 h-4 mr-1" />
                    {formData[name].name}
                </p>
            )}
        </div>
    );

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SelectField
                                name="title"
                                placeholder="Title"
                                options={[
                                    { value: 'Dr.', label: 'Dr.' },
                                    { value: 'Prof.', label: 'Prof.' },
                                    { value: 'Mr.', label: 'Mr.' },
                                    { value: 'Ms.', label: 'Ms.' },
                                    { value: 'Mrs.', label: 'Mrs.' }
                                ]}
                                required
                            />
                            <InputField
                                name="firstName"
                                placeholder="First Name"
                                icon={User}
                                required
                            />
                            <InputField
                                name="lastName"
                                placeholder="Last Name"
                                icon={User}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                name="professionalEmail"
                                type="email"
                                placeholder="Professional Email"
                                icon={Mail}
                                required
                            />
                            <InputField
                                name="phone"
                                type="tel"
                                placeholder="Mobile Number (10 digits)"
                                icon={Phone}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                name="dateOfBirth"
                                type="date"
                                placeholder="Date of Birth"
                                icon={Calendar}
                                required
                            />
                            <SelectField
                                name="gender"
                                placeholder="Gender"
                                options={[
                                    { value: 'male', label: 'Male' },
                                    { value: 'female', label: 'Female' },
                                    { value: 'other', label: 'Other' },
                                    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                                ]}
                                required
                            />
                        </div>

                        <FileUpload
                            name="profilePhoto"
                            accept="image/*"
                            label="Profile Photo (Optional)"
                        />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                name="specialty"
                                placeholder="Medical Specialty"
                                options={[
                                    { value: 'general-practice', label: 'General Practice' },
                                    { value: 'internal-medicine', label: 'Internal Medicine' },
                                    { value: 'cardiology', label: 'Cardiology' },
                                    { value: 'dermatology', label: 'Dermatology' },
                                    { value: 'neurology', label: 'Neurology' },
                                    { value: 'orthopedics', label: 'Orthopedics' },
                                    { value: 'pediatrics', label: 'Pediatrics' },
                                    { value: 'gynecology', label: 'Gynecology & Obstetrics' },
                                    { value: 'ent', label: 'ENT' },
                                    { value: 'ophthalmology', label: 'Ophthalmology' },
                                    { value: 'psychiatry', label: 'Psychiatry' },
                                    { value: 'surgery', label: 'General Surgery' },
                                    { value: 'anesthesiology', label: 'Anesthesiology' },
                                    { value: 'radiology', label: 'Radiology' },
                                    { value: 'pathology', label: 'Pathology' },
                                    { value: 'ayurveda', label: 'Ayurveda (BAMS)' },
                                    { value: 'homeopathy', label: 'Homeopathy (BHMS)' },
                                    { value: 'unani', label: 'Unani Medicine' },
                                    { value: 'dentistry', label: 'Dentistry (BDS/MDS)' },
                                    { value: 'physiotherapy', label: 'Physiotherapy (BPT/MPT)' },
                                    { value: 'other', label: 'Other' }
                                ]}
                                required
                            />
                            <InputField
                                name="subSpecialty"
                                placeholder="Sub-specialty (Optional)"
                                icon={Award}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                name="licenseNumber"
                                placeholder="Medical Council Registration Number"
                                icon={Award}
                                required
                            />
                            <SelectField
                                name="licenseState"
                                placeholder="Registration State"
                                options={indianStates}
                                required
                            />
                        </div>

                        <SelectField
                            name="yearsOfExperience"
                            placeholder="Years of Experience"
                            options={[
                                { value: '0-2', label: '0-2 years' },
                                { value: '3-5', label: '3-5 years' },
                                { value: '6-10', label: '6-10 years' },
                                { value: '11-15', label: '11-15 years' },
                                { value: '16-20', label: '16-20 years' },
                                { value: '20+', label: '20+ years' }
                            ]}
                            required
                        />

                        <InputField
                            name="medicalSchool"
                            placeholder="Medical College/University"
                            icon={Award}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                name="degreeType"
                                placeholder="Primary Degree"
                                options={[
                                    { value: 'mbbs', label: 'MBBS' },
                                    { value: 'bds', label: 'BDS' },
                                    { value: 'bams', label: 'BAMS' },
                                    { value: 'bhms', label: 'BHMS' },
                                    { value: 'bpt', label: 'BPT' },
                                    { value: 'bvsc', label: 'BVSC' },
                                    { value: 'other', label: 'Other' }
                                ]}
                                required
                            />
                            <InputField
                                name="postGraduation"
                                placeholder="Post-graduation (MD/MS/MDS/MPT) - Optional"
                                icon={Award}
                            />
                        </div>

                        <FileUpload
                            name="cv"
                            accept=".pdf,.doc,.docx"
                            label="CV/Resume (Optional)"
                        />
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Practice Information</h2>

                        <SelectField
                            name="practiceType"
                            placeholder="Practice Type"
                            options={[
                                { value: 'private-practice', label: 'Private Practice/Clinic' },
                                { value: 'government-hospital', label: 'Government Hospital' },
                                { value: 'private-hospital', label: 'Private Hospital' },
                                { value: 'nursing-home', label: 'Nursing Home' },
                                { value: 'corporate-hospital', label: 'Corporate Hospital' },
                                { value: 'medical-college', label: 'Medical College/Teaching Hospital' },
                                { value: 'diagnostic-center', label: 'Diagnostic Center' },
                                { value: 'telemedicine', label: 'Telemedicine/Online Consultation' },
                                { value: 'home-visits', label: 'Home Visits' },
                                { value: 'other', label: 'Other' }
                            ]}
                            required
                        />

                        <InputField
                            name="institutionName"
                            placeholder="Hospital/Clinic/Institution Name"
                            icon={Building}
                            required
                        />

                        <InputField
                            name="address.street"
                            placeholder="Complete Address"
                            icon={MapPin}
                            required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField
                                name="address.city"
                                placeholder="City"
                                icon={MapPin}
                                required
                            />
                            <SelectField
                                name="address.state"
                                placeholder="State"
                                options={indianStates}
                                required
                            />
                            <InputField
                                name="address.zipCode"
                                placeholder="ZIP Code"
                                icon={MapPin}
                                required
                            />
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Security</h2>

                        <InputField
                            name="password"
                            placeholder="Create a strong password"
                            icon={Lock}
                            showPasswordToggle={true}
                            required
                        />

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-blue-400" />
                            </div>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                                    }`}
                                placeholder="Confirm your password"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" />
                                )}
                            </button>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {errors.confirmPassword}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="acceptTerms"
                                    checked={formData.acceptTerms}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                    required
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    I agree to the <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</a> and understand the platform's usage policies. I confirm that I am a registered medical practitioner in India.
                                </span>
                            </div>
                            {errors.acceptTerms && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {errors.acceptTerms}
                                </p>
                            )}

                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="acceptPrivacy"
                                    checked={formData.acceptPrivacy}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                    required
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    I acknowledge that I have read and understood the <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Privacy Policy</a> and consent to the processing of my personal data in accordance with Indian data protection laws.
                                </span>
                            </div>
                            {errors.acceptPrivacy && (
                                <p className="text-sm text-red-600 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {errors.acceptPrivacy}
                                </p>
                            )}

                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    name="marketingEmails"
                                    checked={formData.marketingEmails}
                                    onChange={handleInputChange}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                />
                                <span className="ml-2 text-sm text-gray-600">
                                    I would like to receive updates about new features, medical technology trends, and practice management tips via email. (Optional)
                                </span>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                        <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Doctor Registration
                    </h1>
                    <p className="text-gray-600">
                        Join thousands of Indian healthcare professionals building their online presence
                    </p>
                    <p className="text-sm text-orange-600 mt-1">
                        🇮🇳 Designed specifically for Indian Medical Professionals
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className={`flex items-center ${step.number < steps.length ? 'flex-1' : ''}`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${currentStep >= step.number
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}
                                >
                                    {currentStep > step.number ? (
                                        <Check className="w-5 h-5" />
                                    ) : (
                                        step.number
                                    )}
                                </div>
                                <div className="ml-2 hidden md:block">
                                    <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                        {step.title}
                                    </p>
                                </div>
                                {step.number < steps.length && (
                                    <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {renderStep()}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                            Previous
                        </button>

                        {currentStep < 4 ? (
                            <button
                                onClick={nextStep}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 font-medium"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creating Account...
                                    </div>
                                ) : (
                                    'Complete Registration'
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <p>Secure • MCI Compliant • Made for Indian Healthcare Professionals</p>
                    <p className="mt-2">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:support@doctorwebsitebuilder.in" className="text-blue-600 hover:text-blue-700">
                            support@doctorwebsitebuilder.in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DoctorRegistration;

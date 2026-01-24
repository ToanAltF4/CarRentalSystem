import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: '',
        address: '',
        licenseNumber: ''
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
        if (generalError) {
            setGeneralError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');

        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }

        setLoading(true);

        try {
            // Remove confirmPassword before sending to backend
            const { confirmPassword, ...registrationData } = formData;

            console.log('Sending registration data:', registrationData);

            await authService.register(registrationData);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);
            console.error('Error response:', err.response?.data);

            // Handle validation errors from backend
            if (err.response?.data?.errors) {
                const fieldErrors = {};
                err.response.data.errors.forEach(error => {
                    fieldErrors[error.field] = error.message;
                });
                setErrors(fieldErrors);
            } else {
                // Handle general errors (e.g., email already exists)
                setGeneralError(
                    err.response?.data?.message ||
                    'Registration failed. Please try again.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.successBox}>
                        <svg style={styles.successIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <h2 style={styles.successTitle}>Registration Successful!</h2>
                        <p style={styles.successText}>Redirecting to login page...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={{ ...styles.card, maxWidth: '600px' }}>
                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.subtitle}>Join EV Fleet Car Rental</p>

                {generalError && (
                    <div style={styles.errorBox}>
                        <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {generalError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Required fields section */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Required Information</h3>

                        <div style={styles.formGroup}>
                            <label htmlFor="email" style={styles.label}>
                                Email Address *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    ...styles.input,
                                    ...(errors.email ? styles.inputError : {})
                                }}
                                placeholder="you@example.com"
                            />
                            {errors.email && (
                                <p style={styles.fieldError}>{errors.email}</p>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="fullName" style={styles.label}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                style={{
                                    ...styles.input,
                                    ...(errors.fullName ? styles.inputError : {})
                                }}
                                placeholder="Nguyễn Văn A"
                            />
                            {errors.fullName && (
                                <p style={styles.fieldError}>{errors.fullName}</p>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="password" style={styles.label}>
                                Password * <span style={styles.hint}>(min 6 chars, letter + number)</span>
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                style={{
                                    ...styles.input,
                                    ...(errors.password ? styles.inputError : {})
                                }}
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p style={styles.fieldError}>{errors.password}</p>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="confirmPassword" style={styles.label}>
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                minLength={6}
                                style={{
                                    ...styles.input,
                                    ...(errors.confirmPassword ? styles.inputError : {})
                                }}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && (
                                <p style={styles.fieldError}>{errors.confirmPassword}</p>
                            )}
                        </div>
                    </div>

                    {/* Optional fields section */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>Additional Information (Optional)</h3>

                        <div style={styles.formGroup}>
                            <label htmlFor="phoneNumber" style={styles.label}>
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                style={{
                                    ...styles.input,
                                    ...(errors.phoneNumber ? styles.inputError : {})
                                }}
                                placeholder="+84 123 456 789"
                            />
                            {errors.phoneNumber && (
                                <p style={styles.fieldError}>{errors.phoneNumber}</p>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="address" style={styles.label}>
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                style={{
                                    ...styles.input,
                                    ...styles.textarea,
                                    ...(errors.address ? styles.inputError : {})
                                }}
                                placeholder="123 Main Street, City"
                            />
                            {errors.address && (
                                <p style={styles.fieldError}>{errors.address}</p>
                            )}
                        </div>

                        <div style={styles.formGroup}>
                            <label htmlFor="licenseNumber" style={styles.label}>
                                Driver's License Number <span style={styles.hint}>(Required for rentals)</span>
                            </label>
                            <input
                                type="text"
                                id="licenseNumber"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleChange}
                                style={{
                                    ...styles.input,
                                    ...(errors.licenseNumber ? styles.inputError : {})
                                }}
                                placeholder="DL-123456789 (uppercase)"
                            />
                            {errors.licenseNumber && (
                                <p style={styles.fieldError}>{errors.licenseNumber}</p>
                            )}
                            <p style={styles.helpText}>
                                Format: 5-50 uppercase letters, numbers, and hyphens (e.g., DL-123456)
                            </p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {})
                        }}
                    >
                        {loading ? (
                            <span style={styles.buttonContent}>
                                <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating account...
                            </span>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <a href="/login" style={styles.link}>
                        Login here
                    </a>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '500px'
    },
    title: {
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#1a202c',
        marginBottom: '8px',
        textAlign: 'center'
    },
    subtitle: {
        color: '#718096',
        marginBottom: '32px',
        textAlign: 'center'
    },
    section: {
        marginBottom: '28px'
    },
    sectionTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '16px',
        paddingBottom: '8px',
        borderBottom: '2px solid #e2e8f0'
    },
    errorBox: {
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        color: '#c53030',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px'
    },
    errorIcon: {
        width: '20px',
        height: '20px',
        flexShrink: 0
    },
    successBox: {
        textAlign: 'center',
        padding: '40px 20px'
    },
    successIcon: {
        width: '80px',
        height: '80px',
        color: '#48bb78',
        margin: '0 auto 20px'
    },
    successTitle: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#22543d',
        marginBottom: '8px'
    },
    successText: {
        color: '#718096',
        fontSize: '14px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#2d3748',
        marginBottom: '6px'
    },
    hint: {
        fontSize: '12px',
        color: '#a0aec0',
        fontWeight: 'normal'
    },
    input: {
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: '1px solid #cbd5e0',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box',
        fontFamily: 'inherit'
    },
    textarea: {
        resize: 'vertical',
        minHeight: '80px'
    },
    inputError: {
        borderColor: '#fc8181',
        backgroundColor: '#fff5f5'
    },
    fieldError: {
        color: '#c53030',
        fontSize: '12px',
        marginTop: '4px',
        marginBottom: 0
    },
    helpText: {
        color: '#718096',
        fontSize: '12px',
        marginTop: '4px',
        marginBottom: 0
    },
    button: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        marginTop: '8px'
    },
    buttonDisabled: {
        backgroundColor: '#a0aec0',
        cursor: 'not-allowed'
    },
    buttonContent: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    spinner: {
        animation: 'spin 1s linear infinite',
        width: '20px',
        height: '20px'
    },
    spinnerCircle: {
        opacity: 0.25
    },
    spinnerPath: {
        opacity: 0.75
    },
    footer: {
        marginTop: '24px',
        textAlign: 'center',
        color: '#718096',
        fontSize: '14px'
    },
    link: {
        color: '#667eea',
        textDecoration: 'none',
        fontWeight: '600'
    }
};

export default RegisterPage;

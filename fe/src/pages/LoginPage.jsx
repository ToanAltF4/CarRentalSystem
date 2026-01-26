import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get return URL from location state or default
    const from = location.state?.from || '/vehicles';

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
        setLoading(true);

        try {
            const userData = await login(formData.email, formData.password);

            // Redirect based on role or return to previous page
            const role = userData.role;
            if (role === 'ADMIN' || role === 'MANAGER' || role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER') {
                navigate('/admin');
            } else {
                navigate(from);
            }
        } catch (err) {
            console.error('Login error:', err);

            // Handle validation errors from backend
            if (err.response?.data?.errors) {
                const fieldErrors = {};
                err.response.data.errors.forEach(error => {
                    fieldErrors[error.field] = error.message;
                });
                setErrors(fieldErrors);
            } else {
                // Handle general errors
                setGeneralError(
                    err.response?.data?.message ||
                    'Login failed. Please check your credentials.'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>Login to your account</p>

                {generalError && (
                    <div style={styles.errorBox}>
                        <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {generalError}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>
                            Email Address
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
                        <label htmlFor="password" style={styles.label}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
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
                                Logging in...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?{' '}
                    <a href="/register" style={styles.link}>
                        Register here
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
        padding: '20px'
    },
    card: {
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px'
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
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#2d3748',
        marginBottom: '8px'
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '14px',
        border: '1px solid #cbd5e0',
        borderRadius: '8px',
        outline: 'none',
        transition: 'all 0.2s',
        boxSizing: 'border-box'
    },
    inputError: {
        borderColor: '#fc8181',
        backgroundColor: '#fff5f5'
    },
    fieldError: {
        color: '#c53030',
        fontSize: '13px',
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

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default LoginPage;

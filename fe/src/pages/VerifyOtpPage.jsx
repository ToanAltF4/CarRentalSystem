import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

function VerifyOtpPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [otpCode, setOtpCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Countdown timer for resend button
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!otpCode || otpCode.length !== 6) {
            setError('Vui lòng nhập mã OTP 6 số');
            return;
        }

        setLoading(true);

        try {
            await authService.verifyOtp(email, otpCode);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Xác thực email thành công! Vui lòng đăng nhập.' }
                });
            }, 2000);
        } catch (err) {
            console.error('OTP verification error:', err);
            setError(
                err.response?.data?.message ||
                'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setError('');
        setResendLoading(true);

        try {
            await authService.resendOtp(email);
            setCountdown(60); // 60 seconds countdown
            setError('');
            // Show success message briefly
            const successMsg = 'Mã OTP mới đã được gửi đến email của bạn!';
            setError(successMsg);
            setTimeout(() => setError(''), 3000);
        } catch (err) {
            console.error('Resend OTP error:', err);
            setError(
                err.response?.data?.message ||
                'Không thể gửi lại mã OTP. Vui lòng thử lại sau.'
            );
        } finally {
            setResendLoading(false);
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
                        <h2 style={styles.successTitle}>Xác thực thành công!</h2>
                        <p style={styles.successText}>Đang chuyển đến trang đăng nhập...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <svg style={styles.mailIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <h2 style={styles.title}>Xác thực Email</h2>
                <p style={styles.subtitle}>
                    Chúng tôi đã gửi mã OTP 6 số đến email <strong>{email}</strong>
                </p>

                {error && (
                    <div style={error.includes('thành công') ? styles.successMessage : styles.errorBox}>
                        <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="otpCode" style={styles.label}>
                            Mã OTP
                        </label>
                        <input
                            type="text"
                            id="otpCode"
                            value={otpCode}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setOtpCode(value);
                                setError('');
                            }}
                            maxLength={6}
                            placeholder="000000"
                            style={styles.otpInput}
                            autoFocus
                            required
                        />
                        <p style={styles.helpText}>
                            Nhập mã OTP 6 số từ email của bạn
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otpCode.length !== 6}
                        style={{
                            ...styles.button,
                            ...(loading || otpCode.length !== 6 ? styles.buttonDisabled : {})
                        }}
                    >
                        {loading ? (
                            <span style={styles.buttonContent}>
                                <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xác thực...
                            </span>
                        ) : (
                            'Xác thực'
                        )}
                    </button>
                </form>

                <div style={styles.resendSection}>
                    <p style={styles.resendText}>Không nhận được mã?</p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading || countdown > 0}
                        style={{
                            ...styles.resendButton,
                            ...(resendLoading || countdown > 0 ? styles.resendButtonDisabled : {})
                        }}
                    >
                        {resendLoading ? 'Đang gửi...' : countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại mã OTP'}
                    </button>
                </div>

                <p style={styles.footer}>
                    <a href="/login" style={styles.link}>
                        Quay lại đăng nhập
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
        maxWidth: '450px'
    },
    iconContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
    },
    mailIcon: {
        width: '64px',
        height: '64px',
        color: '#667eea'
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
        textAlign: 'center',
        fontSize: '14px',
        lineHeight: '1.5'
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
    successMessage: {
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        color: '#155724',
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
        marginBottom: '24px'
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#2d3748',
        marginBottom: '8px',
        textAlign: 'center'
    },
    otpInput: {
        width: '100%',
        padding: '16px',
        fontSize: '32px',
        fontWeight: 'bold',
        border: '2px solid #cbd5e0',
        borderRadius: '8px',
        outline: 'none',
        textAlign: 'center',
        letterSpacing: '8px',
        boxSizing: 'border-box',
        fontFamily: 'monospace'
    },
    helpText: {
        color: '#718096',
        fontSize: '12px',
        marginTop: '8px',
        textAlign: 'center'
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
        transition: 'background-color 0.2s'
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
    resendSection: {
        marginTop: '24px',
        textAlign: 'center'
    },
    resendText: {
        color: '#718096',
        fontSize: '14px',
        marginBottom: '8px'
    },
    resendButton: {
        background: 'none',
        border: 'none',
        color: '#667eea',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'underline',
        padding: '4px 8px'
    },
    resendButtonDisabled: {
        color: '#a0aec0',
        cursor: 'not-allowed',
        textDecoration: 'none'
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

export default VerifyOtpPage;

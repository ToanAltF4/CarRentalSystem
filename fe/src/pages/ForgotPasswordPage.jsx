import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.forgotPassword(email);
            setSuccess(true);
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(
                err.response?.data?.message ||
                'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.'
            );
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
                        <h2 style={styles.successTitle}>Email đã được gửi!</h2>
                        <p style={styles.successText}>
                            Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>
                        </p>
                        <p style={styles.successText}>
                            Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                        </p>
                        <p style={styles.helpText}>
                            Link có hiệu lực trong 1 giờ.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            style={styles.button}
                        >
                            Quay lại đăng nhập
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconContainer}>
                    <svg style={styles.lockIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h2 style={styles.title}>Quên mật khẩu?</h2>
                <p style={styles.subtitle}>
                    Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                </p>

                {error && (
                    <div style={styles.errorBox}>
                        <svg style={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label htmlFor="email" style={styles.label}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="you@example.com"
                            style={styles.input}
                            autoFocus
                            required
                        />
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
                                Đang gửi...
                            </span>
                        ) : (
                            'Gửi link đặt lại mật khẩu'
                        )}
                    </button>
                </form>

                <p style={styles.footer}>
                    Nhớ mật khẩu?{' '}
                    <a href="/login" style={styles.link}>
                        Đăng nhập
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
    lockIcon: {
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
        fontSize: '14px'
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
        padding: '20px'
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
        marginBottom: '12px'
    },
    successText: {
        color: '#2d3748',
        fontSize: '14px',
        marginBottom: '12px',
        lineHeight: '1.5'
    },
    helpText: {
        color: '#718096',
        fontSize: '12px',
        marginTop: '16px',
        marginBottom: '24px'
    },
    formGroup: {
        marginBottom: '24px'
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
        boxSizing: 'border-box'
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

export default ForgotPasswordPage;

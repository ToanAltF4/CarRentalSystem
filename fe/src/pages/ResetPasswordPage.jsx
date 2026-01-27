import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/authService';

function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Link đặt lại mật khẩu không hợp lệ');
        }
    }, [token]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        if (!token) {
            setError('Link đặt lại mật khẩu không hợp lệ');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, formData.newPassword);
            setSuccess(true);
            setTimeout(() => {
                navigate('/login', {
                    state: { message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.' }
                });
            }, 2000);
        } catch (err) {
            console.error('Reset password error:', err);
            setError(
                err.response?.data?.message ||
                'Không thể đặt lại mật khẩu. Link có thể đã hết hạn hoặc đã được sử dụng.'
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
                        <h2 style={styles.successTitle}>Đặt lại mật khẩu thành công!</h2>
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
                    <svg style={styles.keyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>

                <h2 style={styles.title}>Đặt lại mật khẩu</h2>
                <p style={styles.subtitle}>
                    Nhập mật khẩu mới cho tài khoản của bạn
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
                        <label htmlFor="newPassword" style={styles.label}>
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            style={styles.input}
                            minLength={6}
                            autoFocus
                            required
                        />
                        <p style={styles.helpText}>
                            Tối thiểu 6 ký tự, bao gồm chữ và số
                        </p>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="confirmPassword" style={styles.label}>
                            Xác nhận mật khẩu mới
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            style={styles.input}
                            minLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token}
                        style={{
                            ...styles.button,
                            ...(loading || !token ? styles.buttonDisabled : {})
                        }}
                    >
                        {loading ? (
                            <span style={styles.buttonContent}>
                                <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Đang xử lý...
                            </span>
                        ) : (
                            'Đặt lại mật khẩu'
                        )}
                    </button>
                </form>

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
    keyIcon: {
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
    helpText: {
        color: '#718096',
        fontSize: '12px',
        marginTop: '4px'
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

export default ResetPasswordPage;

package com.carrentalsystem.service.impl;

import com.carrentalsystem.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

/**
 * Implementation of EmailService for sending HTML emails.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${spring.mail.from-name}")
    private String fromName;

    @Value("${app.fe-base-url}")
    private String feBaseUrl;

    @Override
    public void sendOtpEmail(String to, String otp, String fullName) {
        log.info("Sending OTP email to: {}", to);

        String subject = "Xác thực tài khoản - EV Fleet Car Rental";
        String htmlContent = buildOtpEmailTemplate(otp, fullName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            log.info("OTP email sent successfully to: {}", to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send OTP email to: {}", to, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    @Override
    public void sendPasswordResetEmail(String to, String resetToken, String fullName) {
        log.info("Sending password reset email to: {}", to);

        String subject = "Đặt lại mật khẩu - EV Fleet Car Rental";
        String resetLink = feBaseUrl + "/reset-password?token=" + resetToken;
        String htmlContent = buildPasswordResetEmailTemplate(resetLink, fullName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Password reset email sent successfully to: {}", to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send password reset email to: {}", to, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    public void sendWelcomeEmail(String to, String fullName) {
        log.info("Sending welcome email to: {}", to);

        String subject = "Chào mừng bạn đến với EV Fleet Car Rental! \uD83C\uDF89";
        String htmlContent = buildWelcomeEmailTemplate(fullName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            log.info("Welcome email sent successfully to: {}", to);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send welcome email to: {}", to, e);
            // Don't throw exception here as this is non-critical
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent)
            throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    private String buildWelcomeEmailTemplate(String fullName) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08); }
                        .button:hover { background: #5568d3; transform: translateY(-1px); box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08); }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
                        .feature-box { background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #667eea; }
                        .emoji-header { font-size: 40px; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="emoji-header">\uD83C\uDF89</div>
                            <h1>Chào mừng đến với EV Fleet!</h1>
                            <p>Tài khoản của bạn đã được xác thực thành công</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            <p>Chúc mừng bạn đã hoàn tất quá trình đăng ký! Chúng tôi rất vui mừng được chào đón bạn gia nhập cộng đồng EV Fleet Car Rental.</p>

                            <p>Giờ đây, bạn có thể trải nghiệm dịch vụ thuê xe điện hiện đại của chúng tôi:</p>

                            <div class="feature-box">
                                <strong>\uD83D\uDE98 Thuê xe dễ dàng</strong><br>
                                Chọn xe, đặt lịch và thanh toán chỉ trong vài bước.
                            </div>

                            <div class="feature-box">
                                <strong>\u26A1 Xe điện thân thiện môi trường</strong><br>
                                Trải nghiệm lái xe êm ái, hiện đại và bảo vệ môi trường.
                            </div>

                            <div class="feature-box">
                                <strong>\uD83D\uDCB8 Giá cả minh bạch</strong><br>
                                Không phí ẩn, hỗ trợ thanh toán linh hoạt.
                            </div>

                            <div style="text-align: center;">
                                <a href="%s/login" class="button">Đăng nhập để đặt xe ngay</a>
                            </div>

                            <p>Nếu bạn cần hỗ trợ, đừng ngần ngại liên hệ với chúng tôi qua email này.</p>

                            <p>Chúc bạn có những chuyến đi tuyệt vời cùng EV Fleet!</p>

                            <p>Trân trọng,<br><strong>Đội ngũ EV Fleet Car Rental</strong></p>
                        </div>
                        <div class="footer">
                            <p>© 2026 EV Fleet Car Rental. All rights reserved.</p>
                            <p>Follow us on social media for updates and offers.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(fullName, feBaseUrl);
    }

    private String buildOtpEmailTemplate(String otp, String fullName) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🚗 EV Fleet Car Rental</h1>
                            <p>Xác thực tài khoản của bạn</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            <p>Cảm ơn bạn đã đăng ký tài khoản tại EV Fleet Car Rental. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới:</p>

                            <div class="otp-box">
                                <p style="margin: 0; font-size: 14px; color: #666;">Mã xác thực của bạn</p>
                                <div class="otp-code">%s</div>
                                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">Mã có hiệu lực trong 10 phút</p>
                            </div>

                            <div class="warning">
                                <strong>⚠️ Lưu ý:</strong> Không chia sẻ mã OTP này với bất kỳ ai. Nhân viên EV Fleet sẽ không bao giờ yêu cầu mã OTP của bạn.
                            </div>

                            <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>

                            <p>Trân trọng,<br><strong>Đội ngũ EV Fleet Car Rental</strong></p>
                        </div>
                        <div class="footer">
                            <p>© 2026 EV Fleet Car Rental. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(fullName, otp);
    }

    private String buildPasswordResetEmailTemplate(String resetLink, String fullName) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                        .button:hover { background: #5568d3; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
                        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
                        .link-box { background: white; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 15px 0; word-break: break-all; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔐 EV Fleet Car Rental</h1>
                            <p>Đặt lại mật khẩu</p>
                        </div>
                        <div class="content">
                            <p>Xin chào <strong>%s</strong>,</p>
                            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>

                            <div style="text-align: center;">
                                <a href="%s" class="button">Đặt lại mật khẩu</a>
                            </div>

                            <p>Hoặc sao chép và dán liên kết sau vào trình duyệt:</p>
                            <div class="link-box">%s</div>

                            <div class="warning">
                                <strong>⚠️ Lưu ý:</strong> Liên kết này chỉ có hiệu lực trong 1 giờ và chỉ sử dụng được một lần.
                            </div>

                            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. Mật khẩu của bạn sẽ không thay đổi.</p>

                            <p>Trân trọng,<br><strong>Đội ngũ EV Fleet Car Rental</strong></p>
                        </div>
                        <div class="footer">
                            <p>© 2026 EV Fleet Car Rental. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(fullName, resetLink, resetLink);
    }
}

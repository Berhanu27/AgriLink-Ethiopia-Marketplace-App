package com.agrilink.email.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${email.enabled:false}")
    private boolean emailEnabled;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    public boolean sendEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            logger.info("Email disabled. Would send to {}: Subject: {}, Body: {}", to, subject, body);
            return true;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            logger.info("Email sent successfully to {}", to);
            return true;
        } catch (Exception e) {
            logger.error("Failed to send email to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendHtmlEmail(String to, String subject, String htmlBody) {
        if (!emailEnabled) {
            logger.info("Email disabled. Would send HTML email to {}: Subject: {}", to, subject);
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            logger.info("HTML email sent successfully to {}", to);
            return true;
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean sendBulkEmail(String[] recipients, String subject, String body) {
        if (recipients == null || recipients.length == 0) {
            return false;
        }

        boolean allSuccess = true;
        for (String recipient : recipients) {
            if (!sendEmail(recipient, subject, body)) {
                allSuccess = false;
            }
        }
        return allSuccess;
    }
}

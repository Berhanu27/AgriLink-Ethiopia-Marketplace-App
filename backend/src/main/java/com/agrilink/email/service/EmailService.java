package com.agrilink.email.service;

public interface EmailService {
    /**
     * Send simple text email
     */
    boolean sendEmail(String to, String subject, String body);
    
    /**
     * Send HTML email
     */
    boolean sendHtmlEmail(String to, String subject, String htmlBody);
    
    /**
     * Send email to multiple recipients
     */
    boolean sendBulkEmail(String[] recipients, String subject, String body);
}

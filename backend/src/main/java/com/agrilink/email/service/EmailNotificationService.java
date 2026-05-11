package com.agrilink.email.service;

import com.agrilink.delivery.model.DeliveryRequest;
import com.agrilink.order.model.PurchaseOrder;
import com.agrilink.user.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);
    private final EmailService emailService;

    public EmailNotificationService(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * Notify user about verification status change
     */
    public void notifyVerificationStatusChange(User user, String newStatus) {
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            logger.warn("User {} has no email address", user.getId());
            return;
        }

        String subject;
        String htmlBody;

        if ("verified".equalsIgnoreCase(newStatus)) {
            subject = "AgriLink Account Verified ✓";
            htmlBody = buildVerifiedEmailHtml(user);
        } else if ("rejected".equalsIgnoreCase(newStatus)) {
            subject = "AgriLink Verification Update";
            htmlBody = buildRejectedEmailHtml(user);
        } else {
            return; // Don't send email for other statuses
        }

        emailService.sendHtmlEmail(user.getEmail(), subject, htmlBody);
        logger.info("Sent verification status email to user {}", user.getId());
    }

    /**
     * Notify farmer about new order
     */
    public void notifyNewOrder(PurchaseOrder order, User farmer) {
        if (farmer.getEmail() == null || farmer.getEmail().isEmpty()) {
            logger.warn("Farmer {} has no email address", farmer.getId());
            return;
        }

        String subject = "New Order Received - AgriLink";
        String htmlBody = buildNewOrderEmailHtml(order, farmer);

        emailService.sendHtmlEmail(farmer.getEmail(), subject, htmlBody);
        logger.info("Sent new order email to farmer {}", farmer.getId());
    }

    /**
     * Notify buyer about order status change
     */
    public void notifyOrderStatusChange(PurchaseOrder order, User buyer, String newStatus) {
        if (buyer.getEmail() == null || buyer.getEmail().isEmpty()) {
            logger.warn("Buyer {} has no email address", buyer.getId());
            return;
        }

        String subject;
        String htmlBody;

        switch (newStatus.toLowerCase()) {
            case "accepted":
                subject = "Order Accepted - AgriLink";
                htmlBody = buildOrderAcceptedEmailHtml(order, buyer);
                break;
            case "rejected":
                subject = "Order Update - AgriLink";
                htmlBody = buildOrderRejectedEmailHtml(order, buyer);
                break;
            case "completed":
                subject = "Order Completed - AgriLink";
                htmlBody = buildOrderCompletedEmailHtml(order, buyer);
                break;
            default:
                return; // Don't send email for other statuses
        }

        emailService.sendHtmlEmail(buyer.getEmail(), subject, htmlBody);
        logger.info("Sent order status email to buyer {}", buyer.getId());
    }

    /**
     * Notify transporter about new delivery request
     */
    public void notifyNewDeliveryRequest(DeliveryRequest request, User buyer, User transporter) {
        if (transporter.getEmail() == null || transporter.getEmail().isEmpty()) {
            logger.warn("Transporter {} has no email address", transporter.getId());
            return;
        }

        String subject = "New Delivery Request - AgriLink";
        String htmlBody = buildNewDeliveryEmailHtml(request, buyer, transporter);

        emailService.sendHtmlEmail(transporter.getEmail(), subject, htmlBody);
        logger.info("Sent new delivery request email to transporter {}", transporter.getId());
    }

    /**
     * Notify buyer about delivery status change
     */
    public void notifyDeliveryStatusChange(DeliveryRequest request, User buyer, User transporter, String newStatus) {
        if (buyer.getEmail() == null || buyer.getEmail().isEmpty()) {
            logger.warn("Buyer {} has no email address", buyer.getId());
            return;
        }

        String subject;
        String htmlBody;

        switch (newStatus.toLowerCase()) {
            case "accepted":
                subject = "Delivery Request Accepted - AgriLink";
                htmlBody = buildDeliveryAcceptedEmailHtml(request, buyer, transporter);
                break;
            case "in-transit":
            case "in_transit":
                subject = "Delivery In Transit - AgriLink";
                htmlBody = buildDeliveryInTransitEmailHtml(request, buyer);
                break;
            case "delivered":
                subject = "Delivery Completed - AgriLink";
                htmlBody = buildDeliveryCompletedEmailHtml(request, buyer);
                break;
            case "rejected":
                subject = "Delivery Request Update - AgriLink";
                htmlBody = buildDeliveryRejectedEmailHtml(request, buyer);
                break;
            default:
                return; // Don't send email for other statuses
        }

        emailService.sendHtmlEmail(buyer.getEmail(), subject, htmlBody);
        logger.info("Sent delivery status email to buyer {}", buyer.getId());
    }

    /**
     * Send custom email to user
     */
    public boolean sendCustomEmail(String email, String subject, String message) {
        return emailService.sendEmail(email, subject, message);
    }

    /**
     * Send custom HTML email to user
     */
    public boolean sendCustomHtmlEmail(String email, String subject, String htmlBody) {
        return emailService.sendHtmlEmail(email, subject, htmlBody);
    }

    /**
     * Send bulk email to multiple users
     */
    public boolean sendBulkEmail(String[] emails, String subject, String message) {
        return emailService.sendBulkEmail(emails, subject, message);
    }

    // HTML Email Templates

    private String buildVerifiedEmailHtml(User user) {
        return buildEmailTemplate(
            "Account Verified!",
            String.format("Hello %s,", user.getFullName()),
            "Great news! Your AgriLink account has been verified successfully.",
            "You now have full access to all platform features. Start connecting with farmers, buyers, and transporters today!",
            "Visit Dashboard",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildRejectedEmailHtml(User user) {
        return buildEmailTemplate(
            "Verification Update",
            String.format("Hello %s,", user.getFullName()),
            "We were unable to verify your AgriLink account at this time.",
            "Please contact our support team for more information and assistance with the verification process.",
            "Contact Support",
            "mailto:support@agrilink.com"
        );
    }

    private String buildNewOrderEmailHtml(PurchaseOrder order, User farmer) {
        String priceInfo = order.getOfferedPrice() != null 
            ? String.format("Price: %s ETB", order.getOfferedPrice())
            : "Price: To be negotiated";
            
        return buildEmailTemplate(
            "New Order Received",
            String.format("Hello %s,", farmer.getFullName()),
            String.format("You have received a new order from %s.", order.getBuyer().getFullName()),
            String.format("Product: %s<br>Quantity: %s %s<br>%s",
                order.getCropName(),
                order.getRequestedQuantity(),
                order.getUnit(),
                priceInfo),
            "View Order",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildOrderAcceptedEmailHtml(PurchaseOrder order, User buyer) {
        return buildEmailTemplate(
            "Order Accepted",
            String.format("Hello %s,", buyer.getFullName()),
            String.format("Your order for %s has been accepted by %s!", 
                order.getCropName(), 
                order.getSeller().getFullName()),
            "The farmer will prepare your order. Check your dashboard for updates.",
            "View Order",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildOrderRejectedEmailHtml(PurchaseOrder order, User buyer) {
        return buildEmailTemplate(
            "Order Update",
            String.format("Hello %s,", buyer.getFullName()),
            String.format("Your order for %s was declined by the farmer.", order.getCropName()),
            "Please check your dashboard for the farmer's response and consider placing a new order.",
            "View Dashboard",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildOrderCompletedEmailHtml(PurchaseOrder order, User buyer) {
        return buildEmailTemplate(
            "Order Completed",
            String.format("Hello %s,", buyer.getFullName()),
            String.format("Your order for %s has been completed successfully!", order.getCropName()),
            "Thank you for using AgriLink. We hope to serve you again soon!",
            "View Order",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildNewDeliveryEmailHtml(DeliveryRequest request, User buyer, User transporter) {
        String weightInfo = request.getWeightValue() != null 
            ? String.format("Weight: %s %s<br>", request.getWeightValue(), request.getWeightUnit())
            : "";
            
        return buildEmailTemplate(
            "New Delivery Request",
            String.format("Hello %s,", transporter.getFullName()),
            String.format("You have received a new delivery request from %s.", buyer.getFullName()),
            String.format("Pickup: %s<br>Destination: %s<br>%sCargo: %s",
                request.getPickupLocation(),
                request.getDestination(),
                weightInfo,
                request.getCargoType()),
            "View Request",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildDeliveryAcceptedEmailHtml(DeliveryRequest request, User buyer, User transporter) {
        return buildEmailTemplate(
            "Delivery Accepted",
            String.format("Hello %s,", buyer.getFullName()),
            String.format("Your delivery request has been accepted by %s!", transporter.getFullName()),
            "The transporter will pick up your order soon. Track your delivery on the dashboard.",
            "Track Delivery",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildDeliveryInTransitEmailHtml(DeliveryRequest request, User buyer) {
        return buildEmailTemplate(
            "Delivery In Transit",
            String.format("Hello %s,", buyer.getFullName()),
            "Your delivery is now in transit!",
            String.format("Your order is on its way from %s to %s. Track it in real-time on your dashboard.",
                request.getPickupLocation(),
                request.getDestination()),
            "Track Delivery",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildDeliveryCompletedEmailHtml(DeliveryRequest request, User buyer) {
        return buildEmailTemplate(
            "Delivery Completed",
            String.format("Hello %s,", buyer.getFullName()),
            "Your delivery has been completed successfully!",
            "Thank you for using AgriLink. We hope to serve you again soon!",
            "View Details",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildDeliveryRejectedEmailHtml(DeliveryRequest request, User buyer) {
        return buildEmailTemplate(
            "Delivery Request Update",
            String.format("Hello %s,", buyer.getFullName()),
            "Your delivery request was declined by the transporter.",
            "Please check your dashboard and consider requesting another transporter.",
            "View Dashboard",
            "http://localhost:3000/dashboard"
        );
    }

    private String buildEmailTemplate(String title, String greeting, String mainMessage, String details, String buttonText, String buttonUrl) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 30px 20px; }
                    .greeting { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
                    .message { font-size: 16px; margin-bottom: 15px; color: #4b5563; }
                    .details { background: #f9fafb; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
                    .button:hover { background: #059669; }
                    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌾 AgriLink</h1>
                        <p style="margin: 5px 0 0 0; font-size: 14px;">%s</p>
                    </div>
                    <div class="content">
                        <div class="greeting">%s</div>
                        <div class="message">%s</div>
                        <div class="details">%s</div>
                        <center>
                            <a href="%s" class="button">%s</a>
                        </center>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from AgriLink Platform</p>
                        <p>© 2024 AgriLink. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, title, greeting, mainMessage, details, buttonUrl, buttonText);
    }
}

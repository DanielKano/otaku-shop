package com.otakushop.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.mail.from:noreply@otakushop.com}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Recuperación de Contraseña - Otaku Shop");
            message.setText(
                "Hola,\n\n" +
                "Has solicitado restablecer tu contraseña en Otaku Shop.\n\n" +
                "Haz clic en el siguiente enlace para crear una nueva contraseña:\n" +
                resetUrl + "\n\n" +
                "Este enlace expirará en 24 horas.\n\n" +
                "Si no solicitaste este cambio, ignora este correo.\n\n" +
                "Saludos,\n" +
                "Equipo Otaku Shop"
            );
            
            mailSender.send(message);
            log.info("Email de recuperación enviado a: {}", to);
        } catch (Exception e) {
            log.error("Error enviando email a {}: {}", to, e.getMessage());
        }
    }
    
    @Async
    public void sendWelcomeEmail(String to, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("¡Bienvenido a Otaku Shop!");
            message.setText(
                "Hola " + userName + ",\n\n" +
                "¡Gracias por registrarte en Otaku Shop!\n\n" +
                "Estamos emocionados de tenerte con nosotros.\n\n" +
                "Explora nuestra colección de productos anime y encuentra tus favoritos.\n\n" +
                "Saludos,\n" +
                "Equipo Otaku Shop"
            );
            
            mailSender.send(message);
            log.info("Email de bienvenida enviado a: {}", to);
        } catch (Exception e) {
            log.error("Error enviando email de bienvenida a {}: {}", to, e.getMessage());
        }
    }
    
    @Async
    public void sendOrderConfirmationEmail(String to, String orderNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Confirmación de Pedido #" + orderNumber);
            message.setText(
                "Hola,\n\n" +
                "Tu pedido #" + orderNumber + " ha sido recibido exitosamente.\n\n" +
                "Podrás seguir el estado de tu pedido desde tu panel de usuario.\n\n" +
                "Gracias por tu compra.\n\n" +
                "Saludos,\n" +
                "Equipo Otaku Shop"
            );
            
            mailSender.send(message);
            log.info("Email de confirmación de pedido enviado a: {}", to);
        } catch (Exception e) {
            log.error("Error enviando email de confirmación a {}: {}", to, e.getMessage());
        }
    }
}

package com.otakushop.entity;

public enum OrderStatus {
    PENDING("Pendiente", "Orden creada, aguardando pago"),
    CONFIRMED("Confirmada", "Orden confirmada, procesándose"),
    PROCESSING("En procesamiento", "Orden siendo preparada para envío"),
    SHIPPED("Enviada", "Orden en tránsito"),
    DELIVERED("Entregada", "Orden entregada al cliente"),
    CANCELLED("Cancelada", "Orden cancelada"),
    FAILED("Fallida", "Pago rechazado o error en procesamiento");
    
    private final String label;
    private final String description;
    
    OrderStatus(String label, String description) {
        this.label = label;
        this.description = description;
    }
    
    public String getLabel() {
        return label;
    }
    
    public String getDescription() {
        return description;
    }
}

package com.otakushop.entity;

public enum ProductStatus {
    PENDING("Pendiente de aprobación"),
    APPROVED("Aprobado"),
    REJECTED("Rechazado");

    private final String description;

    ProductStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

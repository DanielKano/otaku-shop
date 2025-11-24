package com.otakushop.entity;

public enum Role {
    CLIENTE("cliente"),
    VENDEDOR("vendedor"),
    ADMIN("admin"),
    SUPERADMIN("superadmin");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromValue(String value) {
        if (value == null) return null;
        for (Role role : Role.values()) {
            // Comparar tanto por valor como por nombre (case-insensitive)
            if (role.value.equalsIgnoreCase(value) || role.name().equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}

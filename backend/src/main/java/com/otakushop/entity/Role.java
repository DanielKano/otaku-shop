package com.otakushop.entity;

public enum Role {
    CLIENTE("CLIENTE"),
    VENDEDOR("VENDEDOR"),
    ADMIN("ADMIN"),
    SUPERADMIN("SUPERADMIN");

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Role fromValue(String value) {
        for (Role role : Role.values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}

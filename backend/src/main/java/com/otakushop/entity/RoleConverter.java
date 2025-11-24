package com.otakushop.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Conversor de Hibernate para mapear el enum Role con los valores en la base de datos
 * La BD almacena: CLIENTE, VENDEDOR, ADMIN, SUPERADMIN (mayúsculas)
 * El enum usa: CLIENTE, VENDEDOR, ADMIN, SUPERADMIN (nombres)
 */
@Converter(autoApply = true)
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        if (role == null) {
            return null;
        }
        // Guardar el nombre del enum en mayúsculas (coincide con BD)
        return role.name();
    }

    @Override
    public Role convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Leer desde BD y convertir a enum por nombre
        return Role.valueOf(dbData.toUpperCase());
    }
}

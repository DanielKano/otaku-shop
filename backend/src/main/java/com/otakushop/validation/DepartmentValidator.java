package com.otakushop.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Validador para departamentos colombianos
 */
public class DepartmentValidator implements ConstraintValidator<ValidDepartment, String> {

    private static final Set<String> VALID_DEPARTMENTS = new HashSet<>(Arrays.asList(
        "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bogotá D.C.", "Bolívar",
        "Boyacá", "Caldas", "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó",
        "Córdoba", "Cundinamarca", "Guainía", "Guaviare", "Huila", "La Guajira",
        "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo", "Quindío",
        "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
        "Valle del Cauca", "Vaupés", "Vichada"
    ));

    @Override
    public void initialize(ValidDepartment constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(String department, ConstraintValidatorContext context) {
        if (department == null || department.trim().isEmpty()) {
            return false;
        }
        return VALID_DEPARTMENTS.contains(department.trim());
    }
}

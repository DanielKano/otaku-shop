package com.otakushop.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validación personalizada para departamento colombiano
 */
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = DepartmentValidator.class)
@Documented
public @interface ValidDepartment {
    String message() default "Departamento no válido";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

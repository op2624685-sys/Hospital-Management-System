package com.hms.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger/OpenAPI Configuration for HMS Application.
 * This configuration provides a professional API documentation interface
 * including JWT authentication support and detailed API metadata.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Hospital Management System (HMS) APIs")
                        .version("1.0.0")
                        .description("<h2>Hospital Management System API</h2>" +
                                        "<p>This is a professional-grade API for managing hospital operations including patients, appointments, and billing.</p>" +
                                        "<p><b>Authentication:</b> This API uses JWT (JSON Web Tokens). Please provide the token in the <code>Authorization</code> header as <code>Bearer {token}</code>.</p>" +
                                        "<p><b>Rate Limiting:</b> All endpoints are protected by Resilience4j rate limiting to ensure system stability.</p>")
                        .contact(new Contact()
                                .name("HMS Development Team")
                                .email("dev-support@hms.com")
                                .url("https://hms.com/docs"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("Local Development Server"))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Enter your JWT token to access protected endpoints")));
    }

}

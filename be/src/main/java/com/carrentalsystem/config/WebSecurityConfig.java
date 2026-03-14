package com.carrentalsystem.config;

import com.carrentalsystem.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * B2C Security Configuration
 * 
 * Roles:
 * - ADMIN: Company staff - Full access to vehicles, bookings, dashboard
 * - CUSTOMER: Renter - Book cars, cancel own bookings, view own bookings
 * 
 * No CAR_OWNER role (Company owns all vehicles)
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public WebSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // 1. Disable CSRF (using JWT)
                .csrf(csrf -> csrf.disable())

                // 2. Enable CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Return 401 for unauthenticated requests (instead of default 403)
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                    response.sendError(401, "Unauthorized");
                }))

                // 3. Stateless session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // CORS preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ========== PUBLIC ENDPOINTS ==========
                        // Auth endpoints
                        .requestMatchers("/api/auth/**").permitAll()

                        // Swagger/API docs
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/v3/api-docs").permitAll()
                        .requestMatchers("/swagger-resources/**", "/webjars/**").permitAll()

                        // Actuator endpoints
                        .requestMatchers("/actuator/**").permitAll()

                        // VNPAY callbacks and payment create
                        .requestMatchers(HttpMethod.GET, "/api/payments/vnpay/return").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/payments/vnpay/create").authenticated()

                        // Vehicles - View fleet is public
                        .requestMatchers(HttpMethod.GET, "/api/v1/vehicles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/vehicles").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/vehicle-categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/vehicle-categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()

                        // Booking options - Public for browsing rental types/pickup methods
                        .requestMatchers(HttpMethod.GET, "/api/v1/booking-options/rental-types").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/booking-options/pickup-methods").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/booking-options/pricing-info").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/assistant/chat").permitAll()
                        // Booking options - Fee calculations require authentication
                        .requestMatchers(HttpMethod.GET, "/api/v1/booking-options/driver-fee").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/v1/booking-options/calculate-delivery-fee")
                        .authenticated()

                        // ========== CUSTOMER ENDPOINTS ==========
                        // Create booking
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings").authenticated()

                        // View own bookings by email
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/customer").authenticated()

                        // Cancel own booking
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings/*/cancel").authenticated()

                        // Get booking by code (for tracking)
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/code/**").authenticated()

                        // Operator endpoints
                        .requestMatchers("/api/v1/operator/**").hasAnyRole("OPERATOR", "ADMIN", "MANAGER", "STAFF")

                        // Staff endpoints
                        .requestMatchers("/api/v1/staff/**").hasAnyRole("STAFF", "OPERATOR", "ADMIN", "MANAGER")

                        // ========== ADMIN ENDPOINTS (Company Staff) ==========
                        // Admin Dashboard - stats & revenue
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "MANAGER", "OPERATOR")

                        // Vehicle management - Company owns all vehicles
                        .requestMatchers(HttpMethod.POST, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/vehicles/**").hasRole("ADMIN")

                        // Category management
                        .requestMatchers(HttpMethod.POST, "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasRole("ADMIN")

                        // File upload - used by admin and staff workflows (vehicle images, inspections)
                        .requestMatchers(HttpMethod.POST, "/api/v1/upload/**")
                        .hasAnyRole("ADMIN", "MANAGER", "OPERATOR", "STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/upload/**").hasRole("ADMIN")

                        // Booking management - Shared by ADMIN, MANAGER, OPERATOR
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings").hasAnyRole("ADMIN", "MANAGER", "OPERATOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/{id}")
                        .hasAnyRole("ADMIN", "MANAGER", "OPERATOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/status/**")
                        .hasAnyRole("ADMIN", "MANAGER", "OPERATOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/vehicle/**")
                        .hasAnyRole("ADMIN", "MANAGER", "OPERATOR")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/upcoming")
                        .hasAnyRole("ADMIN", "MANAGER", "OPERATOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/status")
                        .hasAnyRole("ADMIN", "MANAGER", "OPERATOR")

                        // Return vehicle - admin checks and processes
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings/*/return").hasRole("ADMIN")
                        // Customers can view their own return details; controller enforces ownership
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/*/return").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated())

                // 5. Add JWT filter
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ====== CORS CONFIG ======
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOriginPatterns(List.of(
                "http://localhost:*", "http://127.0.0.1:*",
                "https://fpt.tokyo", "https://www.fpt.tokyo",
                "https://*.fpt.tokyo"
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

    // ====== AUTH MANAGER ======
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // ====== PASSWORD ENCODER ======
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

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
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

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
                .cors(cors -> {
                })

                // 3. Stateless session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Authorization rules
                .authorizeHttpRequests(auth -> auth
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
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()

                        // ========== CUSTOMER ENDPOINTS ==========
                        // Create booking
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings").authenticated()

                        // View own bookings by email
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/customer").authenticated()

                        // Cancel own booking
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings/*/cancel").authenticated()

                        // Get booking by code (for tracking)
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/code/**").authenticated()

                        // ========== ADMIN ENDPOINTS (Company Staff) ==========
                        // Admin Dashboard - stats & revenue
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // Vehicle management - Company owns all vehicles
                        .requestMatchers(HttpMethod.POST, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/vehicles/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/vehicles/**").hasRole("ADMIN")

                        // Category management
                        .requestMatchers(HttpMethod.POST, "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasRole("ADMIN")

                        // File upload - ADMIN only (for vehicle images)
                        .requestMatchers(HttpMethod.POST, "/api/v1/upload/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/upload/**").hasRole("ADMIN")

                        // Booking management - approve/reject/return
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/status/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/vehicle/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/upcoming").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/bookings/*/status").hasRole("ADMIN")

                        // Return vehicle - admin checks and processes
                        .requestMatchers(HttpMethod.POST, "/api/v1/bookings/*/return").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/v1/bookings/*/return").hasRole("ADMIN")

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
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
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

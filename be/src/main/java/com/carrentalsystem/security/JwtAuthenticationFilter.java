package com.carrentalsystem.security;

import com.carrentalsystem.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        // 1. Lấy Authorization header
        String authHeader = request.getHeader("Authorization");

        // 2. Nếu không có hoặc không đúng Bearer -> cho đi tiếp
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Cắt JWT ra
        String token = authHeader.substring(7);

        try {
            // 4. Validate access token
            if (!jwtService.validateToken(token)) {
                filterChain.doFilter(request, response);
                return;
            }

            // 5. Extract claims
            Long userId = jwtService.getUserId(token);
            String username = jwtService.getUsername(token);
            String role = jwtService.getRole(token);

            // 6. Tạo Authentication
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    username,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request));

            // 7. Set vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception ex) {
            // ❗ Không throw exception
            // ❗ Không response error ở đây
            // → để SecurityConfig xử lý
            SecurityContextHolder.clearContext();
        }

        // 8. Cho request đi tiếp
        filterChain.doFilter(request, response);
    }
}

package com.trustlink.security;

import com.trustlink.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

/**
 * Adapts our User entity to Spring Security without leaking the entity (or its
 * password hash) further than this layer.
 */
public class AppUserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final String passwordHash;
    private final List<GrantedAuthority> authorities;

    public AppUserPrincipal(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        // OAuth-only accounts have no local password. BCryptPasswordEncoder.matches()
        // safely returns false (it catches its own parse error) against a malformed
        // hash, so a placeholder string here is enough to make password login always
        // fail for these accounts - it never needs to match anything real.
        this.passwordHash = user.getPasswordHash() != null ? user.getPasswordHash() : "oauth-account-has-no-local-password";
        this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }

    public Long getId() {
        return id;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

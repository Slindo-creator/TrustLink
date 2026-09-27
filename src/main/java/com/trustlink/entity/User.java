package com.trustlink.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 190)
    private String email;

    // Never exposed via any DTO - see dto package, none of the response records include it.
    // Nullable because OAuth-only accounts never set a local password.
    @Column(name = "password_hash")
    private String passwordHash;

    // The provider's stable subject/user id (Google "sub", Facebook "id"). Null for LOCAL.
    // We key OAuth lookups on (authProvider, providerId), never on email alone, so a
    // provider account can't silently take over an unrelated local account with a
    // coincidentally matching address.

    @Column(length = 30)
    private String phone;

    @Column(name = "preferred_language", nullable = false, length = 10)
    @Builder.Default
    private String preferredLanguage = "en";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}

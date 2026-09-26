package com.trustlink.security;

import com.trustlink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
            .map(AppUserPrincipal::new)
            // Intentionally the same generic message an unknown-password failure would give -
            // don't let this endpoint be used to enumerate registered emails.
            .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));
    }
}

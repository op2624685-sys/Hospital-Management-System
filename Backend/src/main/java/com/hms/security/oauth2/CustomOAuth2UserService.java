package com.hms.security.oauth2;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hms.entity.OAuthAccount;
import com.hms.entity.User;
import com.hms.entity.type.RoleType;
import com.hms.repository.OAuthAccountRepository;
import com.hms.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final OAuthAccountRepository oAuthAccountRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();
        
        return processOAuth2User(provider, oAuth2User);
    }

    private OAuth2User processOAuth2User(String provider, OAuth2User oAuth2User) {
        // Extract providerId based on provider
        String providerId = null;
        if ("google".equalsIgnoreCase(provider)) {
            providerId = oAuth2User.getAttribute("sub");
        } else if ("github".equalsIgnoreCase(provider)) {
            providerId = oAuth2User.getAttribute("id") != null ? oAuth2User.getAttribute("id").toString() : null;
        }

        if (providerId == null) {
            log.error("ProviderId not found in oauth response from {}", provider);
            throw new OAuth2AuthenticationException("ProviderId not found");
        }

        String email = oAuth2User.getAttribute("email");
        if (email == null) {
            log.warn("Email not found in oauth response from {}", provider);
            // Some providers/configurations might not return email.
            // In a real app you might want to handle this differently.
        }

        Optional<OAuthAccount> oAuthAccountOpt = oAuthAccountRepository.findByProviderAndProviderId(provider, providerId);

        User user;
        if (oAuthAccountOpt.isPresent()) {
            user = oAuthAccountOpt.get().getUser();
            log.info("Found existing OAuth account for user {}", user.getUsername());
        } else {
            // Check if user with this email already exists
            Optional<User> userOpt = Optional.empty();
            if (email != null) {
                userOpt = userRepository.findByEmail(email);
            }

            if (userOpt.isPresent()) {
                user = userOpt.get();
                log.info("Linking existing user {} to OAuth provider {}", user.getUsername(), provider);
            } else {
                // Register new user
                log.info("Creating new user for OAuth provider {}", provider);
                String username = (email != null) ? email : provider + "_" + providerId;
                user = User.builder()
                        .username(username)
                        .email(email)
                        .roles(new HashSet<>(Set.of(RoleType.PATIENT)))
                        .build();
                user = userRepository.save(user);
            }

            // Create OAuth account link
            OAuthAccount oAuthAccount = OAuthAccount.builder()
                    .user(user)
                    .provider(provider)
                    .providerId(providerId)
                    .build();
            oAuthAccountRepository.save(oAuthAccount);
        }

        // Set attributes on user so they are available downstream if needed
        user.setAttributes(oAuth2User.getAttributes());
        return user;
    }
}

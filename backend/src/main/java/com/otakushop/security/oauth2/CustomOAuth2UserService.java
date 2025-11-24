package com.otakushop.security.oauth2;

import com.otakushop.entity.AuthProvider;
import com.otakushop.entity.Role;
import com.otakushop.entity.User;
import com.otakushop.exception.BadRequestException;
import com.otakushop.repository.UserRepository;
import com.otakushop.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error procesando usuario OAuth2: ", ex);
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        log.info("Procesando usuario OAuth2 desde: {}", registrationId);
        
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(
            registrationId, 
            oAuth2User.getAttributes()
        );

        log.info("Email del usuario: {}", oAuth2UserInfo.getEmail());

        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new BadRequestException("Email no encontrado en el proveedor OAuth2");
        }

        Optional<User> userOptional = userRepository.findByEmail(oAuth2UserInfo.getEmail());
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            
            // Verificar que el usuario no esté intentando usar un proveedor diferente
            if (!user.getProvider().equals(AuthProvider.valueOf(registrationId.toUpperCase()))) {
                throw new BadRequestException("Este email ya está registrado con " + 
                    user.getProvider() + ". Por favor usa " + user.getProvider() + " para iniciar sesión.");
            }
            
            user = updateExistingUser(user, oAuth2UserInfo);
        } else {
            user = registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
        }

        return UserPrincipal.create(user);
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        User user = new User();
        user.setProvider(AuthProvider.valueOf(oAuth2UserRequest.getClientRegistration().getRegistrationId().toUpperCase()));
        user.setProviderId(oAuth2UserInfo.getId());
        user.setName(oAuth2UserInfo.getName());
        user.setEmail(oAuth2UserInfo.getEmail());
        user.setRole(Role.CLIENTE);
        user.setEnabled(true);
        // No necesita password para OAuth2
        user.setPassword("");
        
        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2UserInfo oAuth2UserInfo) {
        existingUser.setName(oAuth2UserInfo.getName());
        return userRepository.save(existingUser);
    }
}

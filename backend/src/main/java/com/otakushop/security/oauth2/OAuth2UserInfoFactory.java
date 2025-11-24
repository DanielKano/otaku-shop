package com.otakushop.security.oauth2;

import com.otakushop.entity.AuthProvider;
import com.otakushop.exception.BadRequestException;

import java.util.Map;

public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if (registrationId.equalsIgnoreCase(AuthProvider.GOOGLE.toString())) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase(AuthProvider.FACEBOOK.toString())) {
            return new FacebookOAuth2UserInfo(attributes);
        } else {
            throw new BadRequestException("Login con " + registrationId + " no está soportado");
        }
    }
}

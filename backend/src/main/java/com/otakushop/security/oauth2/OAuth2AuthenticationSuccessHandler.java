package com.otakushop.security.oauth2;

import com.otakushop.security.JwtTokenProvider;
import com.otakushop.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider tokenProvider;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Value("${app.oauth2.redirectUri:http://localhost:5174/oauth2/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        String targetUrl = determineTargetUrl(request, response, authentication);

        if (response.isCommitted()) {
            logger.debug("La respuesta ya fue enviada. No se puede redirigir a " + targetUrl);
            return;
        }

        clearAuthenticationAttributes(request);
        httpCookieOAuth2AuthorizationRequestRepository.removeAuthorizationRequestCookies(request, response);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

    protected String determineTargetUrl(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        String token = tokenProvider.generateToken(
            userPrincipal.getId(),
            userPrincipal.getEmail(),
            userPrincipal.getAuthorities().iterator().next().getAuthority()
        );

        return UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .queryParam("email", userPrincipal.getEmail())
                .queryParam("name", userPrincipal.getUsername())
                .build().toUriString();
    }
}

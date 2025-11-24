package com.otakushop.security;

import com.otakushop.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Getter
public class UserPrincipal implements UserDetails, OAuth2User {
    
    private final Long id;
    private final String username;
    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;
    private Map<String, Object> attributes;
    
    public UserPrincipal(Long id, String username, String email, String password, 
                        Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }
    
    public static UserPrincipal create(User user) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
        
        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getEmail(),
            user.getPassword(),
            authorities
        );
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public String getUsername() {
        return username;
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
    
    // Métodos de OAuth2User
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    
    public void setAttributes(Map<String, Object> attributes) {
        this.attributes = attributes;
    }
    
    @Override
    public String getName() {
        return String.valueOf(id);
    }
}

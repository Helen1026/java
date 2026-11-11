package com.fenglin.springboottest.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置：跨域 + JWT 鉴权拦截器
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Autowired
    private AuthInterceptor authInterceptor;

    /** 跨域：允许 Vite 开发服务器访问后端接口（localhost 与本地 IP 均放行） */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                // 用通配端口 + 通配网段，避免局域网 IP 变化后跨域失效
                .allowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*",
                        "http://192.168.*.*:*", "http://10.*.*.*:*", "http://172.*.*.*:*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    /** JWT 拦截：登录/注册公开，首页展示/搜索公开，其余 /api/** 需要 token */
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/api/auth/login",
                        "/api/auth/register",
                        "/api/home/search",
                        "/api/home/recommend",
                        "/api/home/categories");
    }
}

package com.fenglin.springboottest.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 后台管理员白名单（单一事实来源）。
 *
 * 登录时据此给用户标 role，后台接口据此做最终鉴权，
 * 保证「登录说是管理员」和「接口放行」用的是同一份名单，不会出现
 * 登录提示是管理员、调接口却 403 的矛盾。
 */
@Component
public class AdminProperties {

    private final Set<String> usernames;

    public AdminProperties(@Value("${bikini.admin-usernames:spongebob,admin}") String raw) {
        this.usernames = Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toUnmodifiableSet());
    }

    /** 该账号是否具备后台管理权限 */
    public boolean isAdmin(String username) {
        return username != null && usernames.contains(username);
    }
}

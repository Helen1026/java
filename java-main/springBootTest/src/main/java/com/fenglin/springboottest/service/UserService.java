package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fenglin.springboottest.dto.LoginRequest;
import com.fenglin.springboottest.dto.RegisterRequest;
import com.fenglin.springboottest.entity.User;

import java.util.Map;

public interface UserService extends IService<User> {

    /**
     * 注册
     * @return 新用户信息（不含密码）
     */
    Map<String, Object> register(RegisterRequest req);

    /**
     * 登录
     * @return { token, username, nickname }
     */
    Map<String, Object> login(LoginRequest req);

    /** 按用户名查询用户 */
    User findByUsername(String username);
}

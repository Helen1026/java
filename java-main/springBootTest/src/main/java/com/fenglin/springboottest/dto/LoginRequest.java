package com.fenglin.springboottest.dto;

import lombok.Data;

/** 登录入参，对应前端 loginApi({ username, password }) */
@Data
public class LoginRequest {
    private String username;
    private String password;
}

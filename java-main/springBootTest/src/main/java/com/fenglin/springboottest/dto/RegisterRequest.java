package com.fenglin.springboottest.dto;

import lombok.Data;

/** 注册入参，对应前端 registerApi({ username, password, captcha, captchaId }) */
@Data
public class RegisterRequest {
    private String username;
    private String password;

    /** 验证码（当前由前端本地画布校验，后端预留字段，切换后端验证码方案后启用） */
    private String captcha;
    private String captchaId;
}

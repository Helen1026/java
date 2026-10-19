package com.fenglin.springboottest.common;

import lombok.Data;

/**
 * 统一响应体，与前端 src/api/request.js 的约定一致：
 * 成功：HTTP 200 + { code: 0, message, data }
 * 失败：HTTP 4xx/5xx + { code, message }（前端拦截器读取 message）
 */
@Data
public class Result<T> {

    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> ok(T data) {
        Result<T> r = new Result<>();
        r.setCode(0);
        r.setMessage("ok");
        r.setData(data);
        return r;
    }

    public static <T> Result<T> error(Integer code, String message) {
        Result<T> r = new Result<>();
        r.setCode(code);
        r.setMessage(message);
        return r;
    }
}

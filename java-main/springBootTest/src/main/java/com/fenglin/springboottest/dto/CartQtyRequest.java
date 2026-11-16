package com.fenglin.springboottest.dto;

import lombok.Data;

/**
 * 修改购物车数量请求体，对应 PUT /api/cart/{id}
 * qty <= 0 时后端直接删除该行。
 */
@Data
public class CartQtyRequest {

    private Integer qty;
}

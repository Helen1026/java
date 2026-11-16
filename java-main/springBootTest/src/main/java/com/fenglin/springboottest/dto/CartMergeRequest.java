package com.fenglin.springboottest.dto;

import lombok.Data;

import java.util.List;

/**
 * 批量合并购物车请求体，对应 POST /api/cart/merge
 *
 * 场景：用户在未登录 / 换设备前把商品加进了浏览器本地购物车，
 * 登录后一次性把本地车合并到服务端，避免「登录一下车就空了」。
 */
@Data
public class CartMergeRequest {

    private List<CartAddRequest> items;
}

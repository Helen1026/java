package com.fenglin.springboottest.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 加入购物车请求体，对应 POST /api/cart
 *
 * 前端只需要描述「哪个商品、加几件」，其余快照信息一并带上来，
 * goodsKey 由后端按 source + goodsId 生成，避免前端拼错。
 */
@Data
public class CartAddRequest {

    /** 来源：home（首页商品）/ krusty（蟹堡王菜单），默认 home */
    private String source;

    /** 来源商品ID：bb_item.id 或蟹堡王菜单ID */
    private Long goodsId;

    /** 商品名称 */
    private String title;

    /** 图标 emoji */
    private String icon;

    /** 标签 */
    private String tag;

    /** 单价（没价格的商品传 0） */
    private BigDecimal price;

    /** 数量，默认 1，上限 99 */
    private Integer qty;
}

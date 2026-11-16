package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 购物车行视图对象，与前端 src/cart.js 的字段约定一致：
 *   { id, goodsKey, source, goodsId, title, icon, tag, price, qty }
 *
 * 注意 id 是购物车行 ID（改数量 / 删除用），goodsKey 是商品身份（前端做 key 用）。
 */
@Data
public class CartItemVO implements Serializable {

    /** 购物车行ID */
    private Long id;

    /** 商品唯一键：source:goodsId */
    private String goodsKey;

    /** 来源：home / krusty */
    private String source;

    /** 来源商品ID */
    private Long goodsId;

    private String title;

    private String icon;

    private String tag;

    /** 单价（快照） */
    private BigDecimal price;

    private Integer qty;
}

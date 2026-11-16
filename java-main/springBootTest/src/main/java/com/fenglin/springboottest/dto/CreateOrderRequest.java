package com.fenglin.springboottest.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 创建订单入参，对应前端结账时提交的购物车明细：
 * { items: [{ itemId, icon, name, price, quantity }], subtotal, taxAmount, totalAmount, remark }
 */
@Data
public class CreateOrderRequest {

    /** 订单明细（商品快照） */
    private List<ItemSnapshot> items;

    /** 商品小计 */
    private BigDecimal subtotal;

    /** 税费 */
    private BigDecimal taxAmount;

    /** 合计金额 */
    private BigDecimal totalAmount;

    /** 备注 */
    private String remark;

    @Data
    public static class ItemSnapshot {
        private Long itemId;
        private String icon;
        private String name;
        private BigDecimal price;
        private Integer quantity;
    }
}

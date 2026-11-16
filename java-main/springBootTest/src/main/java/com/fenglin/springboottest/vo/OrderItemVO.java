package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

/**
 * 订单明细视图对象（商品快照）
 */
@Data
public class OrderItemVO implements Serializable {

    private Long id;

    private Long itemId;

    /** 图标快照 */
    private String icon;

    /** 名称快照 */
    private String name;

    /** 成交单价快照 */
    private BigDecimal price;

    /** 数量 */
    private Integer quantity;

    /** 该行小计 = 单价 × 数量 */
    private BigDecimal lineTotal;
}

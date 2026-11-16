package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单明细实体，对应表 bb_order_item
 * 下单时写入商品快照（名称/图标/单价），后续商品改价不影响历史订单
 */
@Data
@TableName("bb_order_item")
public class OrderItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 所属订单ID（关联 bb_order.id） */
    private Long orderId;

    /** 关联商品ID（关联 bb_item.id，可空） */
    private Long itemId;

    /** 商品图标快照（emoji） */
    private String icon;

    /** 商品名称快照 */
    private String name;

    /** 成交单价快照 */
    private BigDecimal price;

    /** 购买数量 */
    private Integer quantity;

    private LocalDateTime createTime;
}

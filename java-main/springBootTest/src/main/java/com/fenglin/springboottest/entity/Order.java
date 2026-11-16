package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单实体，对应表 bb_order
 * 状态 status：0 待付款 / 1 已完成 / 2 已取消
 */
@Data
@TableName("bb_order")
public class Order {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 订单号（唯一） */
    private String orderNo;

    /** 下单用户ID（关联 sys_user.id） */
    private Long userId;

    /** 商品小计 */
    private BigDecimal subtotal;

    /** 海洋保护税（5%） */
    private BigDecimal taxAmount;

    /** 订单合计金额 */
    private BigDecimal totalAmount;

    /** 状态：0 待付款 1 已完成 2 已取消 */
    private Integer status;

    /** 订单备注 */
    private String remark;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}

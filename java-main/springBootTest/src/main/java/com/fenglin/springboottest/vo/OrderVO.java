package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 订单视图对象，与前端 src/api/order.js 的约定一致：
 * 含订单主信息 + 明细列表 + 状态文案。
 */
@Data
public class OrderVO implements Serializable {

    private Long id;

    /** 订单号 */
    private String orderNo;

    /** 商品小计 */
    private BigDecimal subtotal;

    /** 税费 */
    private BigDecimal taxAmount;

    /** 合计金额 */
    private BigDecimal totalAmount;

    /** 状态：0 待付款 1 已完成 2 已取消 */
    private Integer status;

    /** 状态文案：待付款 / 已完成 / 已取消 */
    private String statusText;

    /** 备注 */
    private String remark;

    /** 下单时间 */
    private LocalDateTime createTime;

    /** 订单明细 */
    private List<OrderItemVO> items;
}

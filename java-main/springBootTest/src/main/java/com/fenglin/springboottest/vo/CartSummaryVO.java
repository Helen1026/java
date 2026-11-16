package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * 购物车汇总视图：每次增删改都返回整车快照，
 * 前端直接整体替换本地 state，省掉「本地与服务端各算一遍」的偏差。
 */
@Data
public class CartSummaryVO implements Serializable {

    /** 购物车行（按加入时间升序） */
    private List<CartItemVO> items = new ArrayList<>();

    /** 商品总件数（qty 之和） */
    private Integer count = 0;

    /** 小计 = Σ 单价 × 数量（未含蟹堡王的海洋保护税） */
    private BigDecimal subtotal = BigDecimal.ZERO;

    /** 结算 / 清空时返回被清掉的件数，便于前端提示 */
    private Integer checkoutCount;

    /** 结算时返回被清掉部分的小计（未含税），便于前端展示成交金额 */
    private BigDecimal checkoutSubtotal;
}

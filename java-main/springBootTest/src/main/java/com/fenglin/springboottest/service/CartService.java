package com.fenglin.springboottest.service;

import com.fenglin.springboottest.dto.CartAddRequest;
import com.fenglin.springboottest.vo.CartSummaryVO;

import java.util.List;

/**
 * 购物车服务：所有方法都以 userId 为边界，保证一个用户看不到别人的车。
 * 每个写操作都返回整车汇总，前端整体替换即可。
 */
public interface CartService {

    /** 查询我的购物车 */
    CartSummaryVO list(Long userId);

    /** 加入购物车：同商品累加数量，上限 99 */
    CartSummaryVO add(Long userId, CartAddRequest req);

    /** 修改数量：qty <= 0 视为删除 */
    CartSummaryVO updateQty(Long userId, Long id, Integer qty);

    /** 删除一行 */
    CartSummaryVO remove(Long userId, Long id);

    /** 清空：source 为空清整车，否则只清该来源（如只清蟹堡王订单） */
    CartSummaryVO clear(Long userId, String source);

    /** 合并本地购物车（登录后把浏览器里攒的旧车并进来） */
    CartSummaryVO merge(Long userId, List<CartAddRequest> items);

    /** 结算：返回结算内容并清空对应来源 */
    CartSummaryVO checkout(Long userId, String source);
}

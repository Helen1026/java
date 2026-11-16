package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fenglin.springboottest.dto.CartAddRequest;
import com.fenglin.springboottest.entity.CartItem;
import com.fenglin.springboottest.mapper.CartItemMapper;
import com.fenglin.springboottest.service.CartService;
import com.fenglin.springboottest.vo.CartItemVO;
import com.fenglin.springboottest.vo.CartSummaryVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * 购物车实现：一条 SQL 都不用写，条件用 LambdaQueryWrapper 拼。
 *
 * 关键约定：
 *  - goodsKey = source + ':' + goodsId，配合表上的 uk_user_goods 唯一键，重复加购只会累加 qty；
 *  - 所有查询/更新都带 user_id 条件，越权访问直接按「不存在」处理；
 *  - 写操作后统一返回整车汇总（list），前端整体替换，避免前后端数量不一致。
 */
@Service
public class CartServiceImpl implements CartService {

    /** 单行最大数量，和前端 cart.js 的 MAX_QTY 保持一致 */
    private static final int MAX_QTY = 99;

    /** 允许的商品来源：首页商品 / 蟹堡王菜单 */
    private static final Set<String> SOURCES = Set.of("home", "krusty");

    @Autowired
    private CartItemMapper cartItemMapper;

    @Override
    public CartSummaryVO list(Long userId) {
        List<CartItem> rows = cartItemMapper.selectList(new LambdaQueryWrapper<CartItem>()
                .eq(CartItem::getUserId, userId)
                .orderByAsc(CartItem::getId));
        return summarize(rows);
    }

    @Override
    @Transactional
    public CartSummaryVO add(Long userId, CartAddRequest req) {
        doAdd(userId, req);
        return list(userId);
    }

    @Override
    @Transactional
    public CartSummaryVO updateQty(Long userId, Long id, Integer qty) {
        CartItem row = findOwned(userId, id);
        int next = qty == null ? 0 : qty;
        if (next <= 0) {
            cartItemMapper.deleteById(row.getId());
        } else {
            row.setQty(Math.min(next, MAX_QTY));
            row.setUpdateTime(LocalDateTime.now());
            cartItemMapper.updateById(row);
        }
        return list(userId);
    }

    @Override
    @Transactional
    public CartSummaryVO remove(Long userId, Long id) {
        CartItem row = findOwned(userId, id);
        cartItemMapper.deleteById(row.getId());
        return list(userId);
    }

    @Override
    @Transactional
    public CartSummaryVO clear(Long userId, String source) {
        cartItemMapper.delete(byUserAndSource(userId, source));
        return list(userId);
    }

    @Override
    @Transactional
    public CartSummaryVO merge(Long userId, List<CartAddRequest> items) {
        if (items != null) {
            for (CartAddRequest req : items) {
                // 本地车里的脏数据（缺 id / 缺标题）直接跳过，不影响其他行合并
                if (req == null || req.getGoodsId() == null || !StringUtils.hasText(req.getTitle())) {
                    continue;
                }
                doAdd(userId, req);
            }
        }
        return list(userId);
    }

    @Override
    @Transactional
    public CartSummaryVO checkout(Long userId, String source) {
        List<CartItem> rows = cartItemMapper.selectList(byUserAndSource(userId, source)
                .orderByAsc(CartItem::getId));
        CartSummaryVO paid = summarize(rows);
        cartItemMapper.delete(byUserAndSource(userId, source));

        // 返回「结算后剩下的车」+ 「本次结算的件数与金额」：
        // 只结算蟹堡王时，首页商品还得留在车里，所以不能直接把 items 清空
        CartSummaryVO rest = list(userId);
        rest.setCheckoutCount(paid.getCount());
        rest.setCheckoutSubtotal(paid.getSubtotal());
        return rest;
    }

    // ==================== 内部方法 ====================

    /** 加购核心：存在则累加并刷新快照，不存在则插入 */
    private void doAdd(Long userId, CartAddRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("购物车参数不能为空");
        }
        String source = normalizeSource(req.getSource());
        if (req.getGoodsId() == null) {
            throw new IllegalArgumentException("商品ID不能为空");
        }
        if (!StringUtils.hasText(req.getTitle())) {
            throw new IllegalArgumentException("商品名称不能为空");
        }

        String goodsKey = source + ":" + req.getGoodsId();
        int addQty = req.getQty() == null ? 1 : Math.max(req.getQty(), 1);
        BigDecimal price = req.getPrice() == null ? BigDecimal.ZERO : req.getPrice();

        CartItem exist = cartItemMapper.selectOne(new LambdaQueryWrapper<CartItem>()
                .eq(CartItem::getUserId, userId)
                .eq(CartItem::getGoodsKey, goodsKey));

        if (exist == null) {
            CartItem row = new CartItem();
            row.setUserId(userId);
            row.setGoodsKey(goodsKey);
            row.setSource(source);
            row.setGoodsId(req.getGoodsId());
            row.setTitle(req.getTitle());
            row.setIcon(req.getIcon());
            row.setTag(req.getTag());
            row.setPrice(price);
            row.setQty(Math.min(addQty, MAX_QTY));
            cartItemMapper.insert(row);
            return;
        }

        exist.setQty(Math.min(exist.getQty() + addQty, MAX_QTY));
        // 快照以最新一次加购为准（价格/标题改过就跟着更新）
        exist.setTitle(req.getTitle());
        exist.setIcon(req.getIcon());
        exist.setTag(req.getTag());
        exist.setPrice(price);
        exist.setUpdateTime(LocalDateTime.now());
        cartItemMapper.updateById(exist);
    }

    /** 只取当前用户的行，取不到按「不存在」处理，避免越权改别人的车 */
    private CartItem findOwned(Long userId, Long id) {
        CartItem row = cartItemMapper.selectOne(new LambdaQueryWrapper<CartItem>()
                .eq(CartItem::getId, id)
                .eq(CartItem::getUserId, userId));
        if (row == null) {
            throw new IllegalArgumentException("购物车条目不存在");
        }
        return row;
    }

    private LambdaQueryWrapper<CartItem> byUserAndSource(Long userId, String source) {
        LambdaQueryWrapper<CartItem> wrapper = new LambdaQueryWrapper<CartItem>()
                .eq(CartItem::getUserId, userId);
        if (StringUtils.hasText(source)) {
            wrapper.eq(CartItem::getSource, normalizeSource(source));
        }
        return wrapper;
    }

    private String normalizeSource(String source) {
        String value = StringUtils.hasText(source) ? source.trim() : "home";
        if (!SOURCES.contains(value)) {
            throw new IllegalArgumentException("未知的商品来源：" + value);
        }
        return value;
    }

    /** 把实体列表折算成前端要的 VO + 件数 + 小计 */
    private CartSummaryVO summarize(List<CartItem> rows) {
        CartSummaryVO summary = new CartSummaryVO();
        int count = 0;
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem row : rows) {
            CartItemVO vo = new CartItemVO();
            vo.setId(row.getId());
            vo.setGoodsKey(row.getGoodsKey());
            vo.setSource(row.getSource());
            vo.setGoodsId(row.getGoodsId());
            vo.setTitle(row.getTitle());
            vo.setIcon(row.getIcon());
            vo.setTag(row.getTag());
            vo.setPrice(row.getPrice() == null ? BigDecimal.ZERO : row.getPrice());
            vo.setQty(row.getQty());
            summary.getItems().add(vo);

            count += row.getQty() == null ? 0 : row.getQty();
            subtotal = subtotal.add(vo.getPrice().multiply(BigDecimal.valueOf(vo.getQty() == null ? 0 : vo.getQty())));
        }

        summary.setCount(count);
        summary.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        return summary;
    }
}

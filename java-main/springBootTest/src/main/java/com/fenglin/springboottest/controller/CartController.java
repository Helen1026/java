package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.CartAddRequest;
import com.fenglin.springboottest.dto.CartMergeRequest;
import com.fenglin.springboottest.dto.CartQtyRequest;
import com.fenglin.springboottest.service.CartService;
import com.fenglin.springboottest.vo.CartSummaryVO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 购物车接口，与前端 src/api/cart.js 一一对应：
 *
 *   GET    /api/cart                 我的购物车（整车快照）
 *   POST   /api/cart                 加入购物车（同商品累加）
 *   PUT    /api/cart/{id}            改数量（qty<=0 等于删除）
 *   DELETE /api/cart/{id}            删除一行
 *   DELETE /api/cart?source=krusty   清空（不传 source 清整车）
 *   POST   /api/cart/merge           合并本地购物车（登录后调用）
 *   POST   /api/cart/checkout?source 结算并清空指定来源
 *
 * 这些接口全部需要登录：JWT 拦截器（CorsConfig）没有把它们放进白名单，
 * 用户身份从 request 的 uid 属性取，天然做到「一人一车」。
 */
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public Result<CartSummaryVO> list(HttpServletRequest request) {
        return Result.ok(cartService.list(uid(request)));
    }

    @PostMapping
    public Result<CartSummaryVO> add(@RequestBody CartAddRequest body, HttpServletRequest request) {
        return Result.ok(cartService.add(uid(request), body));
    }

    @PutMapping("/{id}")
    public Result<CartSummaryVO> updateQty(@PathVariable Long id,
                                           @RequestBody CartQtyRequest body,
                                           HttpServletRequest request) {
        return Result.ok(cartService.updateQty(uid(request), id, body == null ? null : body.getQty()));
    }

    @DeleteMapping("/{id}")
    public Result<CartSummaryVO> remove(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(cartService.remove(uid(request), id));
    }

    @DeleteMapping
    public Result<CartSummaryVO> clear(@RequestParam(required = false) String source,
                                       HttpServletRequest request) {
        return Result.ok(cartService.clear(uid(request), source));
    }

    @PostMapping("/merge")
    public Result<CartSummaryVO> merge(@RequestBody CartMergeRequest body, HttpServletRequest request) {
        return Result.ok(cartService.merge(uid(request), body == null ? null : body.getItems()));
    }

    @PostMapping("/checkout")
    public Result<CartSummaryVO> checkout(@RequestParam(required = false) String source,
                                          HttpServletRequest request) {
        return Result.ok(cartService.checkout(uid(request), source));
    }

    /** 用户身份：JWT 拦截器已校验并写入 uid */
    private Long uid(HttpServletRequest request) {
        Object uid = request.getAttribute("uid");
        if (!(uid instanceof Long)) {
            throw new IllegalArgumentException("未登录或登录已过期");
        }
        return (Long) uid;
    }

    /** 参数错误统一 400 + { code, message }，前端拦截器取 message 弹提示 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<Void>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Result.error(400, e.getMessage()));
    }
}

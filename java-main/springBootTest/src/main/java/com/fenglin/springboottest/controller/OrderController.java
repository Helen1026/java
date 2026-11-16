package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.dto.CreateOrderRequest;
import com.fenglin.springboottest.entity.User;
import com.fenglin.springboottest.service.OrderService;
import com.fenglin.springboottest.service.UserService;
import com.fenglin.springboottest.vo.OrderVO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 订单接口，与前端 src/api/order.js 对应。
 * 此路径在 JWT 拦截器保护范围内，需携带 Authorization: Bearer <token>。
 *
 * 接口一览：
 *   POST /api/order            创建订单（待付款）
 *   GET  /api/order/list       当前用户订单历史（可按 status 筛选）
 *   GET  /api/order/{id}       订单详情（含明细）
 *   PUT  /api/order/{id}/pay   付款：待付款 → 已完成
 *   PUT  /api/order/{id}/cancel 取消：待付款 → 已取消
 */
@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    /** 创建订单 */
    @PostMapping
    public Result<OrderVO> create(@RequestBody CreateOrderRequest req, HttpServletRequest request) {
        return Result.ok(orderService.createOrder(currentUserId(request), req));
    }

    /** 订单历史（可按状态筛选：0 待付款 1 已完成 2 已取消；不传则全部） */
    @GetMapping("/list")
    public Result<List<OrderVO>> list(@RequestParam(required = false) Integer status,
                                      HttpServletRequest request) {
        return Result.ok(orderService.listOrders(currentUserId(request), status));
    }

    /** 订单详情 */
    @GetMapping("/{id}")
    public Result<OrderVO> detail(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(orderService.getOrderDetail(currentUserId(request), id));
    }

    /** 付款 */
    @PutMapping("/{id}/pay")
    public Result<OrderVO> pay(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(orderService.payOrder(currentUserId(request), id));
    }

    /** 取消订单 */
    @PutMapping("/{id}/cancel")
    public Result<OrderVO> cancel(@PathVariable Long id, HttpServletRequest request) {
        return Result.ok(orderService.cancelOrder(currentUserId(request), id));
    }

    /** 从 JWT 拦截器写入的 request 属性取当前用户 ID；无 uid 时按用户名回查 */
    private Long currentUserId(HttpServletRequest request) {
        Object uid = request.getAttribute("uid");
        if (uid instanceof Long id) {
            return id;
        }
        Object username = request.getAttribute("username");
        if (username != null) {
            User user = userService.findByUsername(username.toString());
            if (user != null) {
                return user.getId();
            }
        }
        throw new IllegalArgumentException("未登录或登录已过期");
    }

    /** 业务参数错误统一返回 400 + { code, message } */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<Void>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Result.error(400, e.getMessage()));
    }
}

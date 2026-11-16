package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fenglin.springboottest.dto.CreateOrderRequest;
import com.fenglin.springboottest.entity.Order;
import com.fenglin.springboottest.vo.OrderVO;

import java.util.List;

/**
 * 订单业务：下单、历史记录、详情、付款、取消订单。
 */
public interface OrderService extends IService<Order> {

    /** 创建订单（状态：待付款） */
    OrderVO createOrder(Long userId, CreateOrderRequest req);

    /** 当前用户的订单历史，可按状态筛选；status 为 null 表示全部 */
    List<OrderVO> listOrders(Long userId, Integer status);

    /** 订单详情（含明细），校验订单归属当前用户 */
    OrderVO getOrderDetail(Long userId, Long orderId);

    /** 付款：待付款 → 已完成 */
    OrderVO payOrder(Long userId, Long orderId);

    /** 取消：待付款 → 已取消 */
    OrderVO cancelOrder(Long userId, Long orderId);
}

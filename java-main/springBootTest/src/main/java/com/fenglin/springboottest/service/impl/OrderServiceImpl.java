package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fenglin.springboottest.dto.CreateOrderRequest;
import com.fenglin.springboottest.entity.Order;
import com.fenglin.springboottest.entity.OrderItem;
import com.fenglin.springboottest.mapper.OrderItemMapper;
import com.fenglin.springboottest.mapper.OrderMapper;
import com.fenglin.springboottest.service.OrderService;
import com.fenglin.springboottest.vo.OrderItemVO;
import com.fenglin.springboottest.vo.OrderVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/**
 * 订单业务实现。
 * 状态流转：待付款(0) ──付款──▶ 已完成(1)
 *                └──取消──▶ 已取消(2)
 * 已完成 / 已取消 的订单不可再操作。
 */
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    public static final int STATUS_PENDING = 0;
    public static final int STATUS_DONE = 1;
    public static final int STATUS_CANCELLED = 2;

    /** 海洋保护税税率 5% */
    private static final BigDecimal TAX_RATE = new BigDecimal("0.05");

    @Autowired
    private OrderItemMapper orderItemMapper;

    @Override
    @Transactional
    public OrderVO createOrder(Long userId, CreateOrderRequest req) {
        if (userId == null) {
            throw new IllegalArgumentException("未登录，无法下单");
        }
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("订单明细不能为空");
        }

        // 以后端明细为准重新计算金额，避免前端传参被篡改
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> items = new ArrayList<>();
        for (CreateOrderRequest.ItemSnapshot s : req.getItems()) {
            if (s.getQuantity() == null || s.getQuantity() <= 0) {
                throw new IllegalArgumentException("商品数量必须大于 0");
            }
            BigDecimal price = s.getPrice() == null ? BigDecimal.ZERO : s.getPrice();
            BigDecimal line = price.multiply(BigDecimal.valueOf(s.getQuantity()));
            subtotal = subtotal.add(line);

            OrderItem item = new OrderItem();
            item.setItemId(s.getItemId());
            item.setIcon(s.getIcon());
            item.setName(s.getName());
            item.setPrice(price);
            item.setQuantity(s.getQuantity());
            items.add(item);
        }
        BigDecimal tax = subtotal.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(tax).setScale(2, RoundingMode.HALF_UP);

        Order order = new Order();
        order.setOrderNo(generateOrderNo());
        order.setUserId(userId);
        order.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        order.setTaxAmount(tax);
        order.setTotalAmount(total);
        order.setStatus(STATUS_PENDING);
        order.setRemark(StringUtils.hasText(req.getRemark()) ? req.getRemark().trim() : null);
        save(order);

        for (OrderItem item : items) {
            item.setOrderId(order.getId());
            orderItemMapper.insert(item);
        }
        return toVO(order, items);
    }

    @Override
    public List<OrderVO> listOrders(Long userId, Integer status) {
        LambdaQueryWrapper<Order> q = new LambdaQueryWrapper<>();
        q.eq(Order::getUserId, userId);
        if (status != null) {
            q.eq(Order::getStatus, status);
        }
        q.orderByDesc(Order::getCreateTime);
        List<Order> orders = list(q);

        List<OrderVO> result = new ArrayList<>(orders.size());
        for (Order order : orders) {
            List<OrderItem> items = orderItemMapper.selectList(
                    new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, order.getId()));
            result.add(toVO(order, items));
        }
        return result;
    }

    @Override
    public OrderVO getOrderDetail(Long userId, Long orderId) {
        Order order = requireOwnedOrder(userId, orderId);
        List<OrderItem> items = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, orderId));
        return toVO(order, items);
    }

    @Override
    @Transactional
    public OrderVO payOrder(Long userId, Long orderId) {
        Order order = requireOwnedOrder(userId, orderId);
        if (order.getStatus() != STATUS_PENDING) {
            throw new IllegalArgumentException("只有待付款的订单可以付款");
        }
        order.setStatus(STATUS_DONE);
        updateById(order);
        List<OrderItem> items = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, orderId));
        return toVO(order, items);
    }

    @Override
    @Transactional
    public OrderVO cancelOrder(Long userId, Long orderId) {
        Order order = requireOwnedOrder(userId, orderId);
        if (order.getStatus() != STATUS_PENDING) {
            throw new IllegalArgumentException("只有待付款的订单可以取消");
        }
        order.setStatus(STATUS_CANCELLED);
        updateById(order);
        List<OrderItem> items = orderItemMapper.selectList(
                new LambdaQueryWrapper<OrderItem>().eq(OrderItem::getOrderId, orderId));
        return toVO(order, items);
    }

    /** 校验订单存在且属于当前用户 */
    private Order requireOwnedOrder(Long userId, Long orderId) {
        Order order = getById(orderId);
        if (order == null) {
            throw new IllegalArgumentException("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("无权查看该订单");
        }
        return order;
    }

    /** 生成订单号：BB + 时间戳 + 3 位随机数 */
    private String generateOrderNo() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int rand = ThreadLocalRandom.current().nextInt(100, 1000);
        return "BB" + ts + rand;
    }

    private OrderVO toVO(Order order, List<OrderItem> items) {
        OrderVO vo = new OrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setSubtotal(order.getSubtotal());
        vo.setTaxAmount(order.getTaxAmount());
        vo.setTotalAmount(order.getTotalAmount());
        vo.setStatus(order.getStatus());
        vo.setStatusText(statusText(order.getStatus()));
        vo.setRemark(order.getRemark());
        vo.setCreateTime(order.getCreateTime());

        List<OrderItemVO> itemVOs = items == null ? new ArrayList<>() : items.stream().map(it -> {
            OrderItemVO iv = new OrderItemVO();
            iv.setId(it.getId());
            iv.setItemId(it.getItemId());
            iv.setIcon(it.getIcon());
            iv.setName(it.getName());
            iv.setPrice(it.getPrice());
            iv.setQuantity(it.getQuantity());
            iv.setLineTotal(it.getPrice() == null ? null
                    : it.getPrice().multiply(BigDecimal.valueOf(it.getQuantity() != null ? it.getQuantity() : 1))
                            .setScale(2, RoundingMode.HALF_UP));
            return iv;
        }).collect(Collectors.toList());
        vo.setItems(itemVOs);
        return vo;
    }

    private String statusText(Integer status) {
        if (status == null) return "未知";
        return switch (status) {
            case STATUS_PENDING -> "待付款";
            case STATUS_DONE -> "已完成";
            case STATUS_CANCELLED -> "已取消";
            default -> "未知";
        };
    }
}

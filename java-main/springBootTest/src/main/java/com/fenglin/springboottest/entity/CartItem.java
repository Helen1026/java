package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 购物车行实体，对应表 bb_cart（按用户持久化）
 *
 * 存的是「商品快照」：加购当时把标题 / 图标 / 标签 / 单价一起记下来，
 * 商品改价或下架都不会影响已经在车里的行。
 */
@Data
@TableName("bb_cart")
public class CartItem {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 所属用户ID（sys_user.id） */
    private Long userId;

    /** 商品唯一键：source + ':' + goodsId，如 item:12 / krusty:3 */
    private String goodsKey;

    /** 来源：home 首页商品 / krusty 蟹堡王菜单 */
    private String source;

    /** 来源商品ID（bb_item.id 或蟹堡王菜单ID） */
    private Long goodsId;

    /** 商品名称（快照） */
    private String title;

    /** 图标 emoji（快照） */
    private String icon;

    /** 标签（快照） */
    private String tag;

    /** 单价（快照） */
    private BigDecimal price;

    /** 数量 1~99 */
    private Integer qty;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}

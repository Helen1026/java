-- =============================================================
-- 比奇堡 · 购物车表（bb_cart）
-- 数据库：bikini_bottom
-- 说明：
--   1) 购物车按用户隔离（user_id = sys_user.id），登录后跨设备/跨刷新都在；
--   2) 采用「商品快照」存法：加购时把标题、图标、标签、单价一起存下来，
--      商品下架或改价不会影响已经加进车里的行（电商购物车的常规做法）；
--   3) goods_key 由后端生成 = source:goodsId，例如 item:12 / krusty:3，
--      与 user_id 组成唯一键，重复加购只累加 qty，不会产生重复行；
--   4) 幂等脚本：CREATE TABLE IF NOT EXISTS，重复执行不会清掉用户购物车。
-- 使用方式：
--   mysql -u root -p123456 bikini_bottom < cart.sql
-- =============================================================

USE bikini_bottom;

CREATE TABLE IF NOT EXISTS bb_cart (
    id          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键（购物车行ID）',
    user_id     BIGINT        NOT NULL                COMMENT '所属用户ID（sys_user.id）',
    goods_key   VARCHAR(64)   NOT NULL                COMMENT '商品唯一键：source:goodsId',
    source      VARCHAR(20)   NOT NULL DEFAULT 'home' COMMENT '来源：home 首页商品 / krusty 蟹堡王菜单',
    goods_id    BIGINT        DEFAULT NULL            COMMENT '来源商品ID（bb_item.id 或蟹堡王菜单ID）',
    title       VARCHAR(100)  NOT NULL                COMMENT '商品名称（快照）',
    icon        VARCHAR(50)   DEFAULT NULL            COMMENT '图标 emoji（快照）',
    tag         VARCHAR(50)   DEFAULT NULL            COMMENT '标签（快照）',
    price       DECIMAL(10,2) NOT NULL DEFAULT 0.00   COMMENT '单价（快照，比奇堡币）',
    qty         INT           NOT NULL DEFAULT 1      COMMENT '数量 1~99',
    create_time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
    update_time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_goods (user_id, goods_key),
    KEY idx_user (user_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT ='比奇堡购物车（按用户持久化）';

-- =============================================================
-- 比奇堡订单 · 订单表与订单明细表
-- 数据库：bikini_bottom
-- 说明：
--   bb_order       订单主表（一个用户可有多张订单，一张订单含多条明细）
--   bb_order_item  订单明细表（订单与商品一对多，下单时写入商品快照）
--   订单状态 status：0 待付款 / 1 已完成 / 2 已取消
-- 使用方式（在已执行 init.sql、home.sql 的基础上）：
--   mysql -u root -p123456 bikini_bottom < order.sql
-- 幂等：重复执行会先 DROP 再 CREATE
-- =============================================================

USE bikini_bottom;

-- -----------------------------
-- 订单主表
-- -----------------------------
DROP TABLE IF EXISTS bb_order_item;
DROP TABLE IF EXISTS bb_order;

CREATE TABLE bb_order (
    id           BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
    order_no     VARCHAR(32)   NOT NULL                COMMENT '订单号（唯一）',
    user_id      BIGINT        NOT NULL                COMMENT '下单用户ID（关联 sys_user.id）',
    subtotal     DECIMAL(10,2) NOT NULL DEFAULT 0.00   COMMENT '商品小计',
    tax_amount   DECIMAL(10,2) NOT NULL DEFAULT 0.00   COMMENT '海洋保护税（5%）',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00   COMMENT '订单合计金额',
    status       TINYINT       NOT NULL DEFAULT 0      COMMENT '状态：0 待付款 1 已完成 2 已取消',
    remark       VARCHAR(255)  DEFAULT NULL            COMMENT '订单备注',
    create_time  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
    update_time  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_user (user_id),
    KEY idx_status (status)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT ='订单主表';

-- -----------------------------
-- 订单明细表（商品快照：下单时复制名称/图标/单价，避免后续商品改价影响历史订单）
-- -----------------------------
CREATE TABLE bb_order_item (
    id          BIGINT        NOT NULL AUTO_INCREMENT COMMENT '主键',
    order_id    BIGINT        NOT NULL                COMMENT '所属订单ID（关联 bb_order.id）',
    item_id     BIGINT        DEFAULT NULL             COMMENT '关联商品ID（关联 bb_item.id，可空）',
    icon        VARCHAR(50)   DEFAULT NULL             COMMENT '商品图标快照（emoji）',
    name        VARCHAR(100)  NOT NULL                COMMENT '商品名称快照',
    price       DECIMAL(10,2) NOT NULL DEFAULT 0.00   COMMENT '成交单价快照',
    quantity    INT           NOT NULL DEFAULT 1      COMMENT '购买数量',
    create_time DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (id),
    KEY idx_order (order_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT ='订单明细表';

-- -----------------------------
-- 种子数据：三张演示订单（对应演示账号 spongebob，sys_user.id=1）
--   1 张已完成、1 张待付款、1 张已取消，便于演示订单历史与状态流转
-- -----------------------------
INSERT INTO bb_order (order_no, user_id, subtotal, tax_amount, total_amount, status, remark) VALUES
('BB20261116001', 1, 20.00, 1.00, 21.00, 1, '老顾客，多加一份海藻酱'),
('BB20261116002', 1, 15.00, 0.75, 15.75, 0, '待付款：蟹黄堡套餐'),
('BB20261116003', 1, 9.00, 0.45, 9.45,  2, '用户取消：暂时不饿了');

INSERT INTO bb_order_item (order_id, item_id, icon, name, price, quantity) VALUES
-- 订单 1（已完成）
(1, 1, '🍔', '招牌蟹黄堡',   12.00, 1),
(1, 2, '🍟', '海霸王薯条',    8.00, 1),
-- 订单 2（待付款）
(2, 1, '🍔', '蟹黄堡套餐',   12.00, 1),
(2, 8, '🧋', '泡泡奶茶',      3.00, 1),
-- 订单 3（已取消）
(3, 7, '🍦', '海藻冰淇淋',    9.00, 1);

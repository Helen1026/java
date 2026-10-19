-- =============================================================
-- 比奇堡首页 · 分类与条目表
-- 数据库：bikini_bottom
-- 说明：
--   bb_category 支持多级（分级分类）：parent_id=0 表示一级分类
--   bb_item    首页展示/搜索的条目（蟹黄堡、水母网……）
-- 使用方式（在已执行 init.sql 的基础上）：
--   mysql -u root -p123456 bikini_bottom < home.sql
-- 幂等：重复执行会先 DROP 再 CREATE
-- =============================================================

USE bikini_bottom;

-- -----------------------------
-- 分类表（支持多级 / 分级分类）
-- -----------------------------
DROP TABLE IF EXISTS bb_category;
CREATE TABLE bb_category (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    name        VARCHAR(50)  NOT NULL                COMMENT '分类名称',
    parent_id   BIGINT       NOT NULL DEFAULT 0      COMMENT '父级ID，0 表示一级分类',
    level       INT          NOT NULL DEFAULT 1      COMMENT '层级（1=一级，2=二级……）',
    sort        INT          NOT NULL DEFAULT 0      COMMENT '排序，越小越靠前',
    status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态：1 正常 0 禁用',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_parent (parent_id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT ='比奇堡分类（支持多级）';

-- -----------------------------
-- 条目表（首页展示 / 搜索）
-- -----------------------------
DROP TABLE IF EXISTS bb_item;
CREATE TABLE bb_item (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    title       VARCHAR(100) NOT NULL                COMMENT '名称',
    icon        VARCHAR(50)  DEFAULT NULL            COMMENT '图标（emoji）',
    description VARCHAR(255) DEFAULT NULL            COMMENT '描述',
    tag         VARCHAR(50)  DEFAULT NULL            COMMENT '标签（用于搜索与展示）',
    hot         INT          NOT NULL DEFAULT 0      COMMENT '热度，用于热门推荐排序',
    category_id BIGINT       NOT NULL DEFAULT 0      COMMENT '所属分类ID（关联 bb_category）',
    status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态：1 正常 0 禁用',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    KEY idx_category (category_id),
    KEY idx_hot (hot)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT ='比奇堡条目（蟹黄堡、水母网等）';

-- -----------------------------
-- 种子数据：分类（分级）
-- -----------------------------
INSERT INTO bb_category (id, name, parent_id, level, sort) VALUES
-- 一级分类
( 1, '美食',       0, 1, 1),
( 2, '工具',       0, 1, 2),
( 3, '玩具',       0, 1, 3),
( 4, '神奇',       0, 1, 4),
( 5, '乐器',       0, 1, 5),
( 6, '宠物',       0, 1, 6),
( 7, '日用',       0, 1, 7),
( 8, '搞笑',       0, 1, 8),
-- 二级分类（分级）
(11, '蟹堡王美食', 1, 2, 1),
(12, '甜品冷饮',   1, 2, 2),
(21, '捕捉工具',   2, 2, 1),
(31, '泡泡玩具',   3, 2, 1);

-- -----------------------------
-- 种子数据：条目（与前端演示数据保持一致，并补充以演示分级分类搜索）
-- -----------------------------
INSERT INTO bb_item (title, icon, description, tag, hot, category_id) VALUES
('蟹黄堡',         '🍔', '蟹堡王招牌，海之霸永远无法复制的秘方',           '美食', 9999, 11),
('水母网',         '🪼', '抓水母必备神器，派大星强烈推荐',                 '工具', 8888, 21),
('泡泡水',         '🫧', '吹出会说话的大泡泡，还能装下菠萝屋',             '玩具', 7777, 31),
('海藻冰淇淋',     '🍦', '珊迪发明的海藻味冰淇淋，清爽一整夏',             '美食', 6666, 12),
('会唱歌的海螺',   '🐚', '按一下就能听到比奇堡的海浪声',                   '神奇', 5555, 4),
('章鱼哥的竖笛',   '🎺', '吹出来的每一个音符都写满忧伤',                   '乐器', 4444, 5),
('海霸王薯条',     '🍟', '趁热吃，凉了它可能会跟你聊天',                   '美食', 3333, 11),
('小蜗的壳',       '🐌', '一只会喵喵叫的宠物蜗牛，比奇堡最黏人',           '宠物', 2222, 6),
('派大星的石头',   '🪨', '房子是石头，沙发也是石头，但很温馨',             '搞笑', 1111, 8),
('海绵擦',         '🧽', '比奇堡最勤快的清洁工，擦什么都亮',               '日用',  999, 7),
-- 以下用于演示「分级分类搜索」：同属「蟹堡王美食(11)」会一起被搜出来
('蟹黄堡套餐',     '🍔', '蟹黄堡+薯条+饮料，派大星的最爱',                 '美食',  888, 11),
('水母罐头',       '🥫', '封存一整只发光水母，装饰与食用两不误',           '工具',  777, 21),
('泡泡枪',         '🔫', '一次喷出十个会跳舞的泡泡',                       '玩具',  666, 31);

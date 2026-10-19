/*
 Navicat Premium Dump SQL

 Source Server         : test
 Source Server Type    : MySQL
 Source Server Version : 80039 (8.0.39)
 Source Host           : localhost:3306
 Source Schema         : bikini_bottom

 Target Server Type    : MySQL
 Target Server Version : 80039 (8.0.39)
 File Encoding         : 65001

 Date: 14/10/2026 09:45:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for bb_category
-- ----------------------------
DROP TABLE IF EXISTS `bb_category`;
CREATE TABLE `bb_category`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '分类名称',
  `parent_id` bigint NOT NULL DEFAULT 0 COMMENT '父级ID，0 表示一级分类',
  `level` int NOT NULL DEFAULT 1 COMMENT '层级（1=一级，2=二级……）',
  `sort` int NOT NULL DEFAULT 0 COMMENT '排序，越小越靠前',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1 正常 0 禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_parent`(`parent_id` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 32 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比奇堡分类（支持多级）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bb_category
-- ----------------------------
INSERT INTO `bb_category` VALUES (1, '美食', 0, 1, 1, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (2, '工具', 0, 1, 2, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (3, '玩具', 0, 1, 3, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (4, '神奇', 0, 1, 4, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (5, '乐器', 0, 1, 5, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (6, '宠物', 0, 1, 6, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (7, '日用', 0, 1, 7, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (8, '搞笑', 0, 1, 8, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (11, '蟹堡王美食', 1, 2, 1, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (12, '甜品冷饮', 1, 2, 2, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (21, '捕捉工具', 2, 2, 1, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_category` VALUES (31, '泡泡玩具', 3, 2, 1, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');

-- ----------------------------
-- Table structure for bb_item
-- ----------------------------
DROP TABLE IF EXISTS `bb_item`;
CREATE TABLE `bb_item`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '名称',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '图标（emoji）',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '描述',
  `tag` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '标签（用于搜索与展示）',
  `hot` int NOT NULL DEFAULT 0 COMMENT '热度，用于热门推荐排序',
  `category_id` bigint NOT NULL DEFAULT 0 COMMENT '所属分类ID（关联 bb_category）',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1 正常 0 禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `idx_category`(`category_id` ASC) USING BTREE,
  INDEX `idx_hot`(`hot` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比奇堡条目（蟹黄堡、水母网等）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bb_item
-- ----------------------------
INSERT INTO `bb_item` VALUES (1, '蟹黄堡', '🍔', '蟹堡王招牌，海之霸永远无法复制的秘方', '美食', 9999, 11, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (2, '水母网', '🪼', '抓水母必备神器，派大星强烈推荐', '工具', 8888, 21, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (3, '泡泡水', '🫧', '吹出会说话的大泡泡，还能装下菠萝屋', '玩具', 7777, 31, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (4, '海藻冰淇淋', '🍦', '珊迪发明的海藻味冰淇淋，清爽一整夏', '美食', 6666, 12, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (5, '会唱歌的海螺', '🐚', '按一下就能听到比奇堡的海浪声', '神奇', 5555, 4, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (6, '章鱼哥的竖笛', '🎺', '吹出来的每一个音符都写满忧伤', '乐器', 4444, 5, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (7, '海霸王薯条', '🍟', '趁热吃，凉了它可能会跟你聊天', '美食', 3333, 11, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (8, '小蜗的壳', '🐌', '一只会喵喵叫的宠物蜗牛，比奇堡最黏人', '宠物', 2222, 6, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (9, '派大星的石头', '🪨', '房子是石头，沙发也是石头，但很温馨', '搞笑', 1111, 8, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (10, '海绵擦', '🧽', '比奇堡最勤快的清洁工，擦什么都亮', '日用', 999, 7, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (11, '蟹黄堡套餐', '🍔', '蟹黄堡+薯条+饮料，派大星的最爱', '美食', 888, 11, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (12, '水母罐头', '🥫', '封存一整只发光水母，装饰与食用两不误', '工具', 777, 21, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');
INSERT INTO `bb_item` VALUES (13, '泡泡枪', '🔫', '一次喷出十个会跳舞的泡泡', '玩具', 666, 31, 1, '2026-10-14 09:25:03', '2026-10-14 09:25:03');

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user`  (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名（唯一）',
  `password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '密码（SHA-256 hex）',
  `nickname` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '头像地址',
  `status` tinyint NOT NULL DEFAULT 1 COMMENT '状态：1 正常 0 禁用',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_username`(`username` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, 'spongebob', 'f969248d621bcded4a3582a1c3b17a71eedfefa9120c36ee3bd1957438cd55b9', '海绵宝宝', NULL, 1, '2026-10-14 08:33:31', '2026-10-14 08:33:31');
INSERT INTO `sys_user` VALUES (2, '海绵宝宝', '1f3662ccb05ee4aefdb171ebf84907fbbc8173d181d83ad8ceb712278417a028', '海绵宝宝', NULL, 1, '2026-10-14 08:54:14', '2026-10-14 08:54:14');

SET FOREIGN_KEY_CHECKS = 1;

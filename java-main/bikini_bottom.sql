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

 Date: 06/11/2026 16:43:06
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
) ENGINE = InnoDB AUTO_INCREMENT = 153 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比奇堡分类（支持多级）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bb_category
-- ----------------------------
INSERT INTO `bb_category` VALUES (1, '美食', 0, 1, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (2, '玩具', 0, 1, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (3, '宠物', 0, 1, 3, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (4, '工具', 0, 1, 4, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (5, '乐器', 0, 1, 5, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (6, '服饰', 0, 1, 6, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (7, '家居', 0, 1, 7, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (8, '书籍', 0, 1, 8, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (9, '美妆护理', 0, 1, 9, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (10, '科技数码', 0, 1, 10, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (11, '蟹堡王美食', 1, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (12, '甜品冷饮', 1, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (13, '海之霸黑暗料理', 1, 2, 3, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (14, '生鲜食材', 0, 1, 11, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (15, '运动户外', 0, 1, 12, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (21, '泡泡玩具', 2, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (22, '神奇小物', 2, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (23, '水母周边', 2, 2, 3, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (31, '蜗牛与伙伴', 3, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (32, '海洋生物', 3, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (41, '捕捞工具', 4, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (42, '清洁用品', 4, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (51, '管乐器', 5, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (52, '打击乐', 5, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (61, '日常穿搭', 6, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (62, '运动装备', 6, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (71, '菠萝屋装饰', 7, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (72, '厨房用品', 7, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (81, '漫画杂志', 8, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (82, '教科书', 8, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (91, '护肤', 9, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (92, '香氛', 9, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (101, '智能设备', 10, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (102, '影音娱乐', 10, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (141, '蟹堡原料', 14, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (142, '海产鲜货', 14, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (151, '水上运动', 15, 2, 1, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_category` VALUES (152, '健身器材', 15, 2, 2, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');

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
) ENGINE = InnoDB AUTO_INCREMENT = 60 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '比奇堡条目（蟹黄堡、水母网等）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of bb_item
-- ----------------------------
INSERT INTO `bb_item` VALUES (1, '蟹黄堡', '🍔', '蟹堡王招牌，海之霸永远无法复制的秘方', '美食', 9999, 11, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (2, '海霸王薯条', '🍟', '趁热吃，凉了它可能会跟你聊天', '美食', 3333, 11, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (3, '蟹黄堡套餐', '🍔', '蟹黄堡+薯条+饮料，派大星的最爱', '美食', 888, 11, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (4, '双层蟹黄堡', '🍔', '两层海藻肉饼，派大星说还不够', '美食', 777, 11, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (5, '小蟹黄堡', '🍔', '一口一个版，小蜗都抢着吃', '美食', 666, 11, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (6, '海藻冰淇淋', '🍦', '珊迪发明的海藻味冰淇淋，清爽一整夏', '美食', 6666, 12, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (7, '海藻气泡水', '🥤', '喝一口能吐三分钟泡泡', '美食', 555, 12, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (8, '珊瑚派', '🥧', '蟹老板私藏，只有节假日才肯做上一炉', '美食', 444, 12, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (9, '泡泡奶茶', '🧋', '里面的珍珠是会往上飘的小气泡', '美食', 333, 12, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (10, '章鱼哥特调咖啡', '☕', '苦到让人沉思人生的深海咖啡，附赠一声叹息', '美食', 222, 12, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (11, '海之霸披萨（仿）', '🍕', '痞老板出品，据说每份附赠窃听器一枚', '黑暗料理', 111, 13, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (12, '海霸糊', '🥫', '痞老板的看家菜，吃完需要一点勇气', '黑暗料理', 99, 13, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (13, '泡泡水', '🫧', '吹出会说话的大泡泡，还能装下菠萝屋', '玩具', 7777, 21, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (14, '泡泡枪', '🔫', '一次喷出十个会跳舞的泡泡', '玩具', 666, 21, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (15, '巨型泡泡圈', '🫧', '能把整个人包在泡泡里飘起来', '玩具', 555, 21, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (16, '会唱歌的海螺', '🐚', '按一下就能听到比奇堡的海浪声', '神奇', 5555, 22, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (17, '派大星的石头', '🪨', '房子是石头，沙发也是石头，但很温馨', '搞笑', 1111, 22, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (18, '魔法海螺', '🔮', '问它问题它会回答\"是\"或\"不是\"，偶尔会骗你', '神奇', 444, 22, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (19, '毛绒水母玩偶', '🪼', '软乎乎的发光水母抱枕，抱着睡觉特别安心', '玩具', 888, 23, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (20, '水母奖杯', '🏆', '水母田捕捞大赛冠军奖杯，派大星说他也得过', '玩具', 77, 23, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (21, '小蜗的壳', '🐌', '一只会喵喵叫的宠物蜗牛，比奇堡最黏人', '宠物', 2222, 31, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (22, '宠物小螃蟹', '🦀', '会夹筷子但不会夹手指，蟹老板的远房亲戚', '宠物', 333, 31, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (23, '观赏小丑鱼', '🐠', '在菠萝屋鱼缸里游来游去，心情好会吐泡泡', '宠物', 222, 32, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (24, '宠物小章鱼', '🦑', '安静优雅，偶尔会吹小竖笛', '宠物', 111, 32, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (25, '水母网', '🪼', '抓水母必备神器，派大星强烈推荐', '工具', 8888, 41, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (26, '水母罐头', '🥫', '封存一整只发光水母，装饰与食用两不误', '工具', 777, 41, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (27, '海绵擦', '🧽', '比奇堡最勤快的清洁工，擦什么都亮', '日用', 999, 42, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (28, '深海扫帚', '🧹', '一扫一片海草，章鱼哥说它比自己勤快', '日用', 88, 42, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (29, '章鱼哥的竖笛', '🎺', '吹出来的每一个音符都写满忧伤', '乐器', 4444, 51, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (30, '海草萨克斯', '🎷', '珊迪推荐，吹起来自带爵士海风', '乐器', 222, 51, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (31, '珊瑚鼓', '🥁', '敲起来像海浪拍岸，派大星能敲一整天', '乐器', 111, 52, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (32, '贝壳吉他', '🎸', '用贝壳做的吉他，弹起来嗡嗡响', '乐器', 99, 52, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (33, '海裤', '👖', '比奇堡居民标配，耐脏又耐穿', '服饰', 666, 61, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (34, '海绵黄衬衫', '👕', '经典款，海绵宝宝同款', '服饰', 555, 61, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (35, '水母网手套', '🧤', '抓水母不被电，派大星同款', '服饰', 444, 62, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (36, '贝壳运动鞋', '👟', '踩在珊瑚上也不滑，跑水母田专用', '服饰', 333, 62, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (37, '石头沙发', '🛏️', '派大星同款，坐上去硬邦邦但很有安全感', '家居', 222, 71, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (38, '海草盆栽', '🪴', '放在菠萝屋里，不用浇水也能活', '家居', 111, 71, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (39, '蟹黄堡煎锅', '🍳', '蟹堡王后厨同款，煎出来的堡特别香', '家居', 333, 72, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (40, '海藻菜刀', '🔪', '切海草如泥，蟹老板亲测好用', '家居', 222, 72, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (41, '比奇堡漫画周刊', '📚', '每周三出版，章鱼哥是忠实读者', '书籍', 444, 81, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (42, '水母捕捞指南', '📖', '从入门到精通，派大星看了三遍还是不会', '书籍', 333, 82, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (43, '章鱼哥的忧伤日记', '📓', '记录了每一天的不开心，请勿在公共场合阅读', '书籍', 222, 82, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (44, '海藻保湿霜', '🧴', '珊迪实验室出品，抹上像刚出水的海带一样水润', '美妆', 444, 91, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (45, '贝壳指甲油', '💅', '七彩贝壳色，涂完手指会发光', '美妆', 222, 91, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (46, '海葵香水', '🌸', '前调海盐，后调海葵，章鱼哥说有点过于浪漫', '美妆', 333, 92, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (47, '比奇堡香薰', '🕯️', '点燃后整个菠萝屋都是蟹黄堡的香味（假的）', '香氛', 111, 92, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (48, '蟹堡机器人', '🤖', '自动煎蟹黄堡，蟹老板又爱又恨', '数码', 777, 101, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (49, '泡泡智能手环', '⌚', '测心率、计步，还能提醒你该去抓水母了', '数码', 555, 101, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (50, '海底电视', '📺', '能收到比奇堡所有频道，包括章鱼哥的诗朗诵', '数码', 333, 102, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (51, '水母控制器', '🎮', '用手柄就能指挥水母跳舞，派大星沉迷', '数码', 222, 102, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (52, '神秘酱料瓶', '🥬', '蟹黄堡的灵魂，配方全球仅海绵宝宝一人知晓', '食材', 666, 141, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (53, '海藻面包胚', '🍞', '松软得像云朵，蟹堡王每日现烤', '食材', 333, 141, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (54, '深海小虾', '🦐', '活蹦乱跳，珊迪说富含优质蛋白', '食材', 222, 142, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (55, '鲜贝柱', '🐚', '比奇堡特产，清甜弹牙', '食材', 111, 142, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (56, '海绵冲浪板', '🏄', '踩上去稳如菠萝屋，派大星也能站稳', '运动', 444, 151, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (57, '深海潜水面罩', '🤿', '看清水母田里每一只发光水母', '运动', 222, 151, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (58, '蟹钳哑铃', '🏋️', '一边举一边夹，练出蟹老板同款手臂', '运动', 111, 152, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');
INSERT INTO `bb_item` VALUES (59, '海草瑜伽垫', '🧘', '铺在珊瑚上也能做平衡术，珊迪推荐', '运动', 99, 152, 1, '2026-11-06 16:07:10', '2026-11-06 16:07:10');

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
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表' ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
INSERT INTO `sys_user` VALUES (1, 'spongebob', 'f969248d621bcded4a3582a1c3b17a71eedfefa9120c36ee3bd1957438cd55b9', '海绵宝宝', NULL, 1, '2026-10-14 08:33:31', '2026-10-14 08:33:31');
INSERT INTO `sys_user` VALUES (2, '海绵宝宝', '1f3662ccb05ee4aefdb171ebf84907fbbc8173d181d83ad8ceb712278417a028', '海绵宝宝', NULL, 1, '2026-10-14 08:54:14', '2026-10-14 08:54:14');

SET FOREIGN_KEY_CHECKS = 1;

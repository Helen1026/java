-- =============================================================
-- 比奇堡登录系统 · 数据库初始化脚本
-- 数据库：bikini_bottom
-- 账号规则：用户名唯一；密码存储 SHA-256 哈希（hex）
-- 使用方式：mysql -u root -p123456 < init.sql
--          或在 Navicat / IDEA Database 工具中直接执行本文件
-- =============================================================

CREATE DATABASE IF NOT EXISTS bikini_bottom
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE bikini_bottom;

-- -----------------------------
-- 用户表
-- -----------------------------
DROP TABLE IF EXISTS sys_user;
CREATE TABLE sys_user (
    id          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键',
    username    VARCHAR(50)  NOT NULL                COMMENT '用户名（唯一）',
    password    VARCHAR(64)  NOT NULL                COMMENT '密码（SHA-256 hex）',
    nickname    VARCHAR(50)  DEFAULT NULL            COMMENT '昵称',
    avatar      VARCHAR(255) DEFAULT NULL            COMMENT '头像地址',
    status      TINYINT      NOT NULL DEFAULT 1      COMMENT '状态：1 正常 0 禁用',
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (id),
    UNIQUE KEY uk_username (username)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT ='用户表';

-- -----------------------------
-- 演示账号：spongebob / 12345678a
-- （密码为 SHA-256('12345678a') 的 hex 值）
-- -----------------------------
INSERT INTO sys_user (username, password, nickname)
VALUES ('spongebob',
        'f969248d621bcded4a3582a1c3b17a71eedfefa9120c36ee3bd1957438cd55b9',
        '海绵宝宝');

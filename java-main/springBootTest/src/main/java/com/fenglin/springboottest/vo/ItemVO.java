package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 首页条目视图对象，与前端 src/api/home.js 的约定一致：
 * 字段为 { id, icon, title, desc, tag, hot }（desc 对应库表 description）
 */
@Data
public class ItemVO implements Serializable {

    private Long id;

    /** 图标（emoji） */
    private String icon;

    /** 名称 */
    private String title;

    /** 描述（对应 bb_item.description） */
    private String desc;

    /** 标签 */
    private String tag;

    /** 热度 */
    private Integer hot;

    /** 所属分类ID */
    private Long categoryId;

    /** 所属分类名称（冗余展示用） */
    private String categoryName;
}

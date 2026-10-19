package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 首页条目实体，对应表 bb_item（蟹黄堡、水母网等）
 */
@Data
@TableName("bb_item")
public class Item {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 名称 */
    private String title;

    /** 图标（emoji） */
    private String icon;

    /** 描述 */
    private String description;

    /** 标签 */
    private String tag;

    /** 热度，用于热门推荐排序 */
    private Integer hot;

    /** 所属分类ID（关联 bb_category） */
    private Long categoryId;

    /** 状态：1 正常 0 禁用 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}

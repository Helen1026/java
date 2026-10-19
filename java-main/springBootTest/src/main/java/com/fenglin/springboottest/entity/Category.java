package com.fenglin.springboottest.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 分类实体，对应表 bb_category（支持多级 / 分级分类）
 */
@Data
@TableName("bb_category")
public class Category {

    @TableId(type = IdType.AUTO)
    private Long id;

    /** 分类名称 */
    private String name;

    /** 父级ID，0 表示一级分类 */
    private Long parentId;

    /** 层级：1=一级，2=二级…… */
    private Integer level;

    /** 排序，越小越靠前 */
    private Integer sort;

    /** 状态：1 正常 0 禁用 */
    private Integer status;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}

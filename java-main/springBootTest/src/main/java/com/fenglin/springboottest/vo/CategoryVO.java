package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;

/**
 * 后台分类管理视图对象：在 Category 基础上补上父级名称，便于后台表单展示。
 */
@Data
public class CategoryVO implements Serializable {

    private Long id;

    /** 分类名称 */
    private String name;

    /** 父级ID，0 表示一级分类 */
    private Long parentId;

    /** 父级名称（parentId<=0 时为「顶级」） */
    private String parentName;

    /** 层级：1=一级，2=二级…… */
    private Integer level;

    /** 排序，越小越靠前 */
    private Integer sort;

    /** 状态：1 正常 0 禁用 */
    private Integer status;
}

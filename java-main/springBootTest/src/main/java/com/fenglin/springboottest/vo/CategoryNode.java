package com.fenglin.springboottest.vo;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 分类树节点（用于「分级分类」展示）：id / name / children
 */
@Data
public class CategoryNode implements Serializable {

    private Long id;

    private String name;

    private Integer level;

    private Integer sort;

    private List<CategoryNode> children;
}

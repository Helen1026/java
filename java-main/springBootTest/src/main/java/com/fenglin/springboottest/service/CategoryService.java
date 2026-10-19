package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.fenglin.springboottest.entity.Category;
import com.fenglin.springboottest.vo.CategoryNode;

import java.util.List;

public interface CategoryService extends IService<Category> {

    /**
     * 取某个分类的全部后代ID（含自身），用于「分级分类」搜索时按子树过滤。
     * 例如传入一级分类「美食」的ID，会返回其下所有二级分类ID + 自身。
     *
     * @param rootId 根分类ID（null 或 <=0 视为空，返回空列表）
     * @return 包含 rootId 及其所有后代的分类ID列表（去重）
     */
    List<Long> listDescendantIds(Long rootId);

    /**
     * 构建分类树（只含 status=1 的正常分类，子节点按 sort 升序）
     */
    List<CategoryNode> tree();
}

package com.fenglin.springboottest.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fenglin.springboottest.entity.Category;
import com.fenglin.springboottest.mapper.CategoryMapper;
import com.fenglin.springboottest.service.CategoryService;
import com.fenglin.springboottest.vo.CategoryNode;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.LinkedTransferQueue;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Override
    public List<Long> listDescendantIds(Long rootId) {
        List<Long> result = new ArrayList<>();
        if (rootId == null || rootId <= 0) {
            return result;
        }
        // 一次性加载全部分类，内存中构建父子关系，BFS 收集后代
        List<Category> all = list();
        Map<Long, List<Category>> childrenMap = all.stream()
                .filter(c -> c.getParentId() != null && c.getParentId() != 0)
                .collect(Collectors.groupingBy(Category::getParentId));

        result.add(rootId);
        LinkedTransferQueue<Long> queue = new LinkedTransferQueue<>(result);
        while (!queue.isEmpty()) {
            Long current = queue.poll();
            List<Category> children = childrenMap.get(current);
            if (children != null) {
                for (Category child : children) {
                    result.add(child.getId());
                    queue.add(child.getId());
                }
            }
        }
        return result;
    }

    @Override
    public List<CategoryNode> tree() {
        List<Category> all = list(new LambdaQueryWrapper<Category>()
                .eq(Category::getStatus, 1)
                .orderByAsc(Category::getSort));

        Map<Long, List<Category>> childrenMap = all.stream()
                .filter(c -> c.getParentId() != null && c.getParentId() != 0)
                .collect(Collectors.groupingBy(Category::getParentId));

        List<CategoryNode> roots = new ArrayList<>();
        for (Category c : all) {
            if (c.getParentId() == null || c.getParentId() == 0) {
                roots.add(toNode(c, childrenMap));
            }
        }
        roots.sort(Comparator.comparing(CategoryNode::getSort, Comparator.nullsLast(Integer::compareTo)));
        return roots;
    }

    private CategoryNode toNode(Category c, Map<Long, List<Category>> childrenMap) {
        CategoryNode node = new CategoryNode();
        node.setId(c.getId());
        node.setName(c.getName());
        node.setLevel(c.getLevel());
        node.setSort(c.getSort());
        List<Category> children = childrenMap.get(c.getId());
        if (children != null) {
            List<CategoryNode> childNodes = new ArrayList<>();
            for (Category child : children) {
                childNodes.add(toNode(child, childrenMap));
            }
            childNodes.sort(Comparator.comparing(CategoryNode::getSort, Comparator.nullsLast(Integer::compareTo)));
            node.setChildren(childNodes);
        }
        return node;
    }
}

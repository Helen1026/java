package com.fenglin.springboottest.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fenglin.springboottest.entity.Category;
import com.fenglin.springboottest.entity.Item;
import com.fenglin.springboottest.vo.CategoryNode;
import com.fenglin.springboottest.vo.ItemVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import com.fenglin.springboottest.service.CategoryService;

/**
 * 首页业务：搜索、热门推荐、分类树。
 * 对应前端 src/api/home.js 的 /home/search、/home/recommend、/home/categories。
 */
@Service
public class HomeService {

    @Autowired
    private ItemService itemService;

    @Autowired
    private CategoryService categoryService;

    /**
     * 搜索。
     *
     * @param keyword    关键词（匹配 title / description / tag，缺省则忽略）
     * @param categoryId 分类ID（分级分类：会连同其所有后代分类一起过滤；null/<=0 则忽略）
     * @return 命中的条目视图列表，按热度降序
     */
    public List<ItemVO> search(String keyword, Long categoryId) {
        LambdaQueryWrapper<Item> q = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            String kw = keyword.trim();
            q.and(w -> w.like(Item::getTitle, kw)
                    .or().like(Item::getDescription, kw)
                    .or().like(Item::getTag, kw));
        }
        if (categoryId != null && categoryId > 0) {
            List<Long> ids = categoryService.listDescendantIds(categoryId);
            q.in(Item::getCategoryId, ids);
        }
        q.eq(Item::getStatus, 1).orderByDesc(Item::getHot);
        return toVO(itemService.list(q));
    }

    /**
     * 首页热门推荐：取 status=1 中热度最高的 8 条。
     */
    public List<ItemVO> recommend() {
        LambdaQueryWrapper<Item> q = new LambdaQueryWrapper<>();
        q.eq(Item::getStatus, 1).orderByDesc(Item::getHot).last("LIMIT 8");
        return toVO(itemService.list(q));
    }

    /**
     * 分类树（分级分类），用于前端渲染分类导航 / 筛选。
     */
    public List<CategoryNode> categoryTree() {
        return categoryService.tree();
    }

    private List<ItemVO> toVO(List<Item> items) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }
        Set<Long> catIds = items.stream()
                .map(Item::getCategoryId)
                .filter(Objects::nonNull)
                .filter(id -> id > 0)
                .collect(Collectors.toSet());

        Map<Long, String> catNameMap = Collections.emptyMap();
        if (!catIds.isEmpty()) {
            List<Category> cats = categoryService.list(
                    new LambdaQueryWrapper<Category>().in(Category::getId, catIds));
            catNameMap = cats.stream()
                    .collect(Collectors.toMap(Category::getId, Category::getName, (a, b) -> a));
        }

        List<ItemVO> vos = new ArrayList<>(items.size());
        for (Item it : items) {
            ItemVO v = new ItemVO();
            v.setId(it.getId());
            v.setIcon(it.getIcon());
            v.setTitle(it.getTitle());
            v.setDesc(it.getDescription());
            v.setTag(it.getTag());
            v.setHot(it.getHot());
            v.setCategoryId(it.getCategoryId());
            v.setCategoryName(it.getCategoryId() != null ? catNameMap.get(it.getCategoryId()) : null);
            vos.add(v);
        }
        return vos;
    }
}

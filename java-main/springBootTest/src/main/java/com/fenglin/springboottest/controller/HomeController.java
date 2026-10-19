package com.fenglin.springboottest.controller;

import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.service.HomeService;
import com.fenglin.springboottest.vo.CategoryNode;
import com.fenglin.springboottest.vo.ItemVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 首页接口，与前端 src/api/home.js 对应：
 *   GET /api/home/search?keyword=xxx&categoryId=yyy   搜索（支持分级分类）
 *   GET /api/home/recommend                           热门推荐（首页展示）
 *   GET /api/home/categories                          分类树（分级分类导航）
 *
 * 这三个接口已在 CorsConfig 中排除 JWT 鉴权，公开可访问（首页展示无需登录）。
 */
@RestController
@RequestMapping("/api/home")
public class HomeController {

    @Autowired
    private HomeService homeService;

    /** 搜索：关键词 + 可选分级分类过滤 */
    @GetMapping("/search")
    public Result<List<ItemVO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId) {
        return Result.ok(homeService.search(keyword, categoryId));
    }

    /** 首页热门推荐 */
    @GetMapping("/recommend")
    public Result<List<ItemVO>> recommend() {
        return Result.ok(homeService.recommend());
    }

    /** 分类树（分级分类） */
    @GetMapping("/categories")
    public Result<List<CategoryNode>> categories() {
        return Result.ok(homeService.categoryTree());
    }
}

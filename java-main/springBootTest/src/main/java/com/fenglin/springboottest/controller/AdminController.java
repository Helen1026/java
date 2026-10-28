package com.fenglin.springboottest.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fenglin.springboottest.common.Result;
import com.fenglin.springboottest.entity.Category;
import com.fenglin.springboottest.entity.Item;
import com.fenglin.springboottest.service.CategoryService;
import com.fenglin.springboottest.service.ItemService;
import com.fenglin.springboottest.vo.CategoryVO;
import com.fenglin.springboottest.vo.ItemVO;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * 后台管理接口，与前端后台管理系统（/admin）对应。
 * 统一管理首页展示的数据：条目（bb_item）与分类（bb_category）。
 * 此路径未加入 CorsConfig 的放行列表，因此受 JWT 拦截器保护，需携带 Authorization: Bearer <token>。
 *
 * 接口一览：
 *   GET    /api/admin/item           列出全部条目（含禁用），支持关键词搜索
 *   POST   /api/admin/item           新增条目
 *   PUT    /api/admin/item/{id}      更新条目
 *   DELETE /api/admin/item/{id}      删除条目
 *   GET    /api/admin/category       列出全部分类（含禁用），附父级名称
 *   POST   /api/admin/category       新增分类（level 由父级自动推导）
 *   PUT    /api/admin/category/{id}  更新分类
 *   DELETE /api/admin/category/{id}  删除分类（存在子分类时禁止）
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ItemService itemService;

    @Autowired
    private CategoryService categoryService;

    /**
     * 允许进入后台管理系统的账号白名单（逗号分隔，大小写敏感）。
     * 不配置时默认仅 spongebob、admin 可访问；其他账号即使登录成功也会被拒绝（403）。
     * 在 application-*.properties 中覆盖：bikini.admin-usernames=alice,bob
     */
    @Value("${bikini.admin-usernames:spongebob,admin}")
    private String adminUsernames;

    /**
     * 列出全部条目（含禁用项，便于后台管理），可按关键词匹配 title/description/tag。
     */
    @GetMapping("/item")
    public Result<List<ItemVO>> listItems(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<Item> q = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isBlank()) {
            String kw = keyword.trim();
            q.and(w -> w.like(Item::getTitle, kw)
                    .or().like(Item::getDescription, kw)
                    .or().like(Item::getTag, kw));
        }
        q.orderByDesc(Item::getHot);
        return Result.ok(toItemVO(itemService.list(q)));
    }

    /** 新增条目（status 缺省为 1，hot 缺省为 0） */
    @PostMapping("/item")
    public Result<ItemVO> createItem(@RequestBody Item item) {
        if (item.getTitle() == null || item.getTitle().isBlank()) {
            throw new IllegalArgumentException("条目名称不能为空");
        }
        if (item.getStatus() == null) item.setStatus(1);
        if (item.getHot() == null) item.setHot(0);
        itemService.save(item);
        return Result.ok(toItemVO(List.of(item)).get(0));
    }

    /** 更新条目（仅覆盖传入的字段，其余保留数据库原值） */
    @PutMapping("/item/{id}")
    public Result<ItemVO> updateItem(@PathVariable Long id, @RequestBody Item item) {
        Item exist = itemService.getById(id);
        if (exist == null) {
            throw new IllegalArgumentException("条目不存在");
        }
        if (item.getTitle() != null) exist.setTitle(item.getTitle());
        if (item.getIcon() != null) exist.setIcon(item.getIcon());
        if (item.getDescription() != null) exist.setDescription(item.getDescription());
        if (item.getTag() != null) exist.setTag(item.getTag());
        if (item.getHot() != null) exist.setHot(item.getHot());
        if (item.getCategoryId() != null) exist.setCategoryId(item.getCategoryId());
        if (item.getStatus() != null) exist.setStatus(item.getStatus());
        itemService.updateById(exist);
        return Result.ok(toItemVO(List.of(exist)).get(0));
    }

    /** 删除条目 */
    @DeleteMapping("/item/{id}")
    public Result<Void> deleteItem(@PathVariable Long id) {
        itemService.removeById(id);
        return Result.ok(null);
    }

    /**
     * 列出全部分类（含禁用项），附父级名称，便于后台选择父级与展示层级。
     */
    @GetMapping("/category")
    public Result<List<CategoryVO>> listCategories() {
        List<Category> all = categoryService.list(new LambdaQueryWrapper<Category>().orderByAsc(Category::getSort));
        Map<Long, Category> map = all.stream()
                .collect(Collectors.toMap(Category::getId, c -> c, (a, b) -> a));
        List<CategoryVO> list = new ArrayList<>(all.size());
        for (Category c : all) {
            list.add(toCategoryVO(c, map));
        }
        return Result.ok(list);
    }

    /** 新增分类：level 由 parentId 自动推导（一级=1，其余=父级 level+1） */
    @PostMapping("/category")
    public Result<CategoryVO> createCategory(@RequestBody Category category) {
        if (category.getName() == null || category.getName().isBlank()) {
            throw new IllegalArgumentException("分类名称不能为空");
        }
        Long parentId = (category.getParentId() == null) ? 0L : category.getParentId();
        category.setParentId(parentId);
        if (category.getStatus() == null) category.setStatus(1);
        if (category.getSort() == null) category.setSort(0);
        int level = 1;
        if (parentId != null && parentId > 0) {
            Category parent = categoryService.getById(parentId);
            if (parent == null) {
                throw new IllegalArgumentException("父级分类不存在");
            }
            level = (parent.getLevel() == null ? 0 : parent.getLevel()) + 1;
        }
        category.setLevel(level);
        categoryService.save(category);
        return Result.ok(toCategoryVO(category,
                Map.of(category.getId(), category)));
    }

    /** 更新分类 */
    @PutMapping("/category/{id}")
    public Result<CategoryVO> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        Category exist = categoryService.getById(id);
        if (exist == null) {
            throw new IllegalArgumentException("分类不存在");
        }
        if (category.getName() != null) exist.setName(category.getName());
        if (category.getParentId() != null) {
            Long parentId = category.getParentId();
            if (parentId > 0) {
                Category parent = categoryService.getById(parentId);
                if (parent == null) {
                    throw new IllegalArgumentException("父级分类不存在");
                }
                // 不能把分类挂到自己的后代之下（简单校验：不允许指向自身）
                if (Objects.equals(parentId, id)) {
                    throw new IllegalArgumentException("父级分类不能是自己");
                }
                exist.setLevel(parent.getLevel() + 1);
            } else {
                exist.setLevel(1);
            }
            exist.setParentId(parentId);
        }
        if (category.getSort() != null) exist.setSort(category.getSort());
        if (category.getStatus() != null) exist.setStatus(category.getStatus());
        categoryService.updateById(exist);
        return Result.ok(toCategoryVO(exist, Map.of(id, exist)));
    }

    /** 删除分类：若存在子分类则禁止，避免产生孤儿数据 */
    @DeleteMapping("/category/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        long children = categoryService.count(
                new LambdaQueryWrapper<Category>().eq(Category::getParentId, id));
        if (children > 0) {
            throw new IllegalArgumentException("该分类下还有子分类，请先删除子分类");
        }
        categoryService.removeById(id);
        return Result.ok(null);
    }

    /** Item -> ItemVO（补齐分类名称） */
    private List<ItemVO> toItemVO(List<Item> items) {
        List<ItemVO> vos = new ArrayList<>(items.size());
        if (items.isEmpty()) return vos;
        Map<Long, String> catNameMap = categoryService.list().stream()
                .collect(Collectors.toMap(Category::getId, Category::getName, (a, b) -> a));
        for (Item it : items) {
            ItemVO v = new ItemVO();
            v.setId(it.getId());
            v.setIcon(it.getIcon());
            v.setTitle(it.getTitle());
            v.setDesc(it.getDescription());
            v.setTag(it.getTag());
            v.setHot(it.getHot());
            v.setCategoryId(it.getCategoryId());
            if (it.getCategoryId() != null) {
                v.setCategoryName(catNameMap.get(it.getCategoryId()));
            }
            vos.add(v);
        }
        return vos;
    }

    /** Category -> CategoryVO（补齐父级名称） */
    private CategoryVO toCategoryVO(Category c, Map<Long, Category> allMap) {
        CategoryVO v = new CategoryVO();
        v.setId(c.getId());
        v.setName(c.getName());
        v.setParentId(c.getParentId());
        v.setLevel(c.getLevel());
        v.setSort(c.getSort());
        v.setStatus(c.getStatus());
        if (c.getParentId() != null && c.getParentId() > 0 && allMap.containsKey(c.getParentId())) {
            v.setParentName(allMap.get(c.getParentId()).getName());
        } else {
            v.setParentName("顶级");
        }
        return v;
    }

    /**
     * 进入任意后台接口前先校验当前登录账号是否在管理员白名单内。
     * 用户名由 AuthInterceptor 在 JWT 校验通过后写入 request 的 "username" 属性。
     * 这样即便普通用户拿到 token，调用 /api/admin/** 也会被 403 拒绝。
     */
    @ModelAttribute
    public void ensureAdmin() {
        String username = currentUsername();
        boolean allowed = username != null
                && Arrays.stream(adminUsernames.split(","))
                        .map(String::trim)
                        .anyMatch(username::equals);
        if (!allowed) {
            throw new IllegalStateException("无权限访问后台管理系统");
        }
    }

    /** 从当前请求中取出 JWT 拦截器写入的登录用户名 */
    private String currentUsername() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes sra) {
            Object u = sra.getRequest().getAttribute("username");
            return u == null ? null : u.toString();
        }
        return null;
    }

    /** 业务参数错误统一返回 400 + { code, message }，前端拦截器读取 message 展示 */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<Void>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Result.error(400, e.getMessage()));
    }

    /** 非管理员访问后台统一返回 403 + { code, message } */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Result<Void>> handleForbidden(IllegalStateException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Result.error(403, e.getMessage()));
    }
}

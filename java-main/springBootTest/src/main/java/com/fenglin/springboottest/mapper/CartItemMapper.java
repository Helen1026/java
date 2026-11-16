package com.fenglin.springboottest.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fenglin.springboottest.entity.CartItem;
import org.apache.ibatis.annotations.Mapper;

/**
 * 购物车 Mapper。常规增删改查由 MyBatis-Plus 的 BaseMapper 提供，
 * 复杂条件用 LambdaQueryWrapper 在 Service 层拼装即可。
 */
@Mapper
public interface CartItemMapper extends BaseMapper<CartItem> {
}

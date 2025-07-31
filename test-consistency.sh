#!/bin/bash

echo "🔍 测试社区动态内容一致性"
echo "================================"

# 获取动态列表
echo "1. 获取动态列表..."
LIST_RESPONSE=$(curl -s "http://localhost:8080/api/community/posts?type=recommend&page=1&pageSize=5")

# 提取mock_post_11的信息
echo "2. 查找 mock_post_11 在列表中的信息..."
echo "$LIST_RESPONSE" | grep -o '"id":"mock_post_[^"]*"[^}]*}' | while read -r post_info; do
  if echo "$post_info" | grep -q "mock_post_11"; then
    echo "📋 列表中的 mock_post_11:"
    echo "$post_info" | sed 's/.*"content":"\([^"]*\)".*/   内容: \1/'
    echo "$post_info" | sed 's/.*"username":"\([^"]*\)".*/   用户: \1/'
    echo "$post_info" | sed 's/.*"tags":\[\([^\]]*\)\].*/   标签: [\1]/'
  fi
done

echo ""
echo "3. 获取 mock_post_11 的详情..."
DETAIL_RESPONSE=$(curl -s "http://localhost:8080/api/community/posts/mock_post_11")
echo "📋 详情中的 mock_post_11:"
echo "$DETAIL_RESPONSE" | sed 's/.*"content":"\([^"]*\)".*/   内容: \1/'
echo "$DETAIL_RESPONSE" | sed 's/.*"username":"\([^"]*\)".*/   用户: \1/'
echo "$DETAIL_RESPONSE" | sed 's/.*"tags":\[\([^\]]*\)\].*/   标签: [\1]/'

echo ""
echo "✅ 测试完成"

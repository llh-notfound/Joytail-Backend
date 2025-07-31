#!/bin/bash

# PetPal 医院模块 API 测试脚本

echo "==============================================="
echo "PetPal 医院模块 API 测试"
echo "==============================================="

BASE_URL="http://localhost:8080"

# 测试1: 获取医院列表
echo "
1. 测试医院列表 API"
echo "GET $BASE_URL/api/medical/hospitals"
echo "---"
response=$(curl -s $BASE_URL/api/medical/hospitals)
echo "$response" | head -c 200
echo "..."
echo "状态: $(echo "$response" | grep -o '"code":[0-9]*' | cut -d: -f2)"

# 测试2: 获取医院详情 (ID=1)
echo "
2. 测试医院详情 API (ID=1)"
echo "GET $BASE_URL/api/medical/hospitals/1"
echo "---"
response=$(curl -s $BASE_URL/api/medical/hospitals/1)
echo "$response" | head -c 200
echo "..."
echo "状态: $(echo "$response" | grep -o '"code":[0-9]*' | cut -d: -f2)"

# 测试3: 获取医院详情 (ID=2)
echo "
3. 测试医院详情 API (ID=2)"
echo "GET $BASE_URL/api/medical/hospitals/2"
echo "---"
response=$(curl -s $BASE_URL/api/medical/hospitals/2)
hospital_name=$(echo "$response" | grep -o '"name":"[^"]*"' | cut -d: -f2 | tr -d '"')
echo "医院名称: $hospital_name"
echo "状态: $(echo "$response" | grep -o '"code":[0-9]*' | cut -d: -f2)"

# 测试4: 测试不存在的医院ID
echo "
4. 测试不存在的医院 API (ID=999)"
echo "GET $BASE_URL/api/medical/hospitals/999"
echo "---"
response=$(curl -s $BASE_URL/api/medical/hospitals/999)
echo "$response"

echo "
==============================================="
echo "测试完成"
echo "==============================================="

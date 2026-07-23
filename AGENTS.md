# 文档工程 AI 工作指南

多品牌（白标）支付文档中心：同一套内容按品牌生成多个 Mintlify 站点。整体结构、构建与部署见 [README.md](./README.md)。

## 关于本项目

- 基于 [Mintlify](https://mintlify.com) 的文档站，页面为带 YAML frontmatter 的 MDX。
- **唯一内容源在 `src/`**（所有 `.mdx` 与 `openapi.yaml`），**只维护这一份**。
- **配置模板是 `src/docs.template.json`**（不是 `docs.json`）。`docs.json` 是构建产物，位于 `build/<brand>/`，**不要手改**。
- 品牌差异用 `{{TOKEN}}` 占位符表示（`{{BRAND}}`、`{{DOMAIN_BASE}}`、`{{COLOR_*}}`），取值在 `brands/<brand>.json`。改文案时保留占位符，不要写死品牌名/域名。
- 构建：`npm run build`（脚本 `scripts/build.mjs`，无三方依赖）。新增占位符若未在 brand 配置中定义，构建会报错。

## 内容准确性（重要）

- 本文档描述的是真实运行的支付平台。涉及接口路径、字段名、错误码、状态枚举、签名规则、Webhook 事件与 payload 时，**以后端源码为准**（`pmp-platform/payment-server`），不要臆造。
- API 请求鉴权用 RSA（`X-Merchant-Id / X-Timestamp / X-Nonce / X-Signature`）；Webhook 用 HMAC-SHA256（`t=,v1=` 格式）。二者不同，勿混淆。
- 时间格式：查询 API 为 `YYYY-MM-DD HH:mm:ss`，Webhook payload 为 ISO-8601 `YYYY-MM-DDTHH:mm:ss`。

## 术语

- 订单（order）/ 交易（transaction）/ 支付（payment）是不同层级，注意区分；平台订单号 = `order_id` = 查询入参 `orderId` = 响应 `platform_order_id`（同一值）。
- 结算（内部释放）≠ 提现（打款到银行）。

## 风格

- 面向读者用第二人称「你」，主动语态，一句一意。
- 文件名、命令、路径、字段、代码引用用 `代码` 格式；UI 元素用**加粗**。
- 中文正文，术语/字段名保留英文原样。

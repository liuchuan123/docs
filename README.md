# 多品牌（白标）文档中心

同一套文档内容，按品牌生成多个 Mintlify 站点（当前：**PayMatrix**、**Banana Paid**）。
内容只维护一份，品牌差异（名称 / logo / 颜色 / 域名）集中在配置里。

## 目录结构

```
src/                     唯一内容源（所有 .mdx / openapi.yaml）
  docs.template.json     Mintlify 配置模板，构建时 -> docs.json
brands/
  paymatrix.json         每个品牌一个配置（占位符取值 + logo 目录 + 部署分支）
  bananapaid.json
assets/logo/<brand>/     每个品牌的 logo-light.png / logo-dark.png / icon.png
scripts/build.mjs        构建脚本（无三方依赖）
build/<brand>/           构建产物（已 gitignore）
.github/workflows/deploy.yml   CI：push main 后自动生成并推送到各部署分支
```

## 占位符约定

在 `src/` 内用 `{{TOKEN}}` 表示品牌相关内容，取值在 `brands/<brand>.json` 的 `tokens` 里：

| 占位符 | 含义 | 示例 |
| --- | --- | --- |
| `{{BRAND}}` | 品牌名 | `PayMatrix` / `Banana Paid` |
| `{{DOMAIN_BASE}}` | 基础域名（子域前缀如 `merchant.`/`openapi.` 保持不变） | `paymatrixpay.com` |
| `{{COLOR_PRIMARY}}` `{{COLOR_LIGHT}}` `{{COLOR_DARK}}` | 主题色，仅 docs.json 使用 | `#0052FF` |

> 构建时若发现未在 brand 配置中定义的占位符会报错，避免漏配。

## 本地预览

```bash
npm run build                 # 构建全部品牌 -> build/
# 或只构建一个： npm run build:bananapaid
cd build/bananapaid && mint dev
```

## 新增一个品牌

1. 新建 `brands/<id>.json`（照抄现有的，改 tokens、logoDir、deployBranch）。
2. 新建 `assets/logo/<id>/`，放入 `logo-light.png`、`logo-dark.png`、`icon.png`。
3. 在 Mintlify 建一个新项目，监听该品牌的 `deployBranch`。

CI 会自动识别新增的 brand 配置，无需改动 workflow。

## 部署

- `main` 分支只放**内容源 + 脚本**，不直接对外。
- 每次 push 到 `main`，GitHub Action 按品牌构建，并把产物强推到各自的部署分支
  （`deploy/paymatrix`、`deploy/bananapaid`）。
- Mintlify 侧为每个品牌建一个项目，分别监听对应部署分支即可自动上线。

## 待补充（占位）

- `brands/bananapaid.json` 里的 `DOMAIN_BASE` 与颜色目前是占位值，需替换为真实值。
- `assets/logo/bananapaid/` 目前是 PayMatrix logo 的占位副本，需替换为真实素材。

# 备婚规划与方案对比平台

面向个人备婚场景的 Next.js 全栈应用。当前仅包含正式工程骨架，尚未实现业务模型与业务逻辑。

## 技术栈

- Next.js 16、React 19、TypeScript
- Tailwind CSS 4、shadcn/ui、Motion、Lucide React
- Drizzle ORM、SQLite（Node.js `node:sqlite`）
- Zod、Vitest、ESLint、Prettier
- Docker Compose

## 开发环境

项目使用 Node.js 24 和 npm 11。首次启动前执行：

```bash
cp .env.example .env.local
npm install
npm run dev
```

打开 <http://localhost:3000>。后端健康检查地址为 <http://localhost:3000/api/health>。

## 常用命令

```bash
npm run check        # 格式、Lint、类型和单元测试
npm run build        # 生产构建
npm run db:generate  # 根据 schema 生成迁移
npm run db:migrate   # 执行迁移
npm run db:studio    # 打开 Drizzle Studio
```

## 目录约定

```text
src/
├── app/                    # 页面、布局、Route Handlers
├── actions/                # Server Actions
├── components/             # UI、布局和共享组件
├── db/                     # 数据库连接、Schema、Migration
├── lib/                    # 校验、常量和无状态工具
├── server/
│   ├── services/           # 业务规则
│   └── repositories/       # 数据访问
└── types/                  # 跨模块共享类型
```

依赖方向保持为 `UI -> Actions -> Services -> Repositories -> Database`。Route Handler 仅用于健康检查、导出、下载或未来外部集成，不用来包装普通 CRUD。

## 部署

```bash
docker compose up --build -d
```

SQLite 文件保存在 Docker 命名卷 `wedding_data` 的 `/app/data` 目录中，更新容器不会删除数据。

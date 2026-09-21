# 备婚规划与方案对比平台

面向个人备婚场景的 Next.js 全栈应用。支持婚礼项目、候选方案、资源、宾客和整体方案快照。

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

打开 <http://localhost:3000>。首次启动会运行数据库迁移，并初始化中国婚礼默认项目树与资源分类。执行 `npm run db:examples` 可在空业务数据库中加入一组可编辑的商家、宾客、候选方案和方案快照示例；当前本地数据库已加入这组示例。点击左侧新人姓名可设置婚礼日期、地点和预算。后端健康检查地址为 <http://localhost:3000/api/health>。

当前方案随项目金额和候选方案选择实时变化。保存整体方案时会复制当时各项目的选择与金额；之后修改项目或报价不会改变已保存快照。方案对比仅实时计算，不保存对比结果。

主页面沿用原型的布局。婚礼项目、资源库和宾客页面的新增入口会进入对应管理页面，那里可以编辑或删除记录；宾客页面的导出按钮可下载 CSV。

## 常用命令

```bash
npm run check        # 格式、Lint、类型和单元测试
npm run build        # 生产构建
npm run db:generate  # 根据 schema 生成迁移
npm run db:migrate   # 执行迁移
npm run db:backup    # 一致性备份到 backups/
npm run db:examples  # 仅在空业务数据库中写入可编辑的示例数据
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

依赖方向保持为 `UI -> Actions -> Services -> Database`，共享读取集中在 `Repositories`。Route Handler 用于健康检查和宾客 CSV 导出，普通 CRUD 使用 Server Actions。

## 部署

```bash
docker compose up --build -d
```

SQLite 文件保存在 Docker 命名卷 `wedding_data` 的 `/app/data` 目录中，更新容器不会删除数据。

Compose 默认只将端口绑定到本机 `127.0.0.1:3000`。如需局域网或公网访问，应先增加访问控制，再调整端口绑定。升级前请备份数据库，并将备份文件保存在容器卷之外。

使用 Docker 时，可先停止应用，再从容器复制数据库文件，随后重新启动：

```bash
docker compose stop app
mkdir -p backups
docker compose cp app:/app/data/wedding.db ./backups/wedding.db
docker compose start app
```

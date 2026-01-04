# Web3 钱包登录与邮箱绑定 - 完整部署指南

本文档汇集了 **钱包登录 (`wallet-login`)** 和 **邮箱绑定 (`bind-email`)** 两个 Edge Function 的详细部署与配置说明。

---

## 📋 目录

1. [项目准备](#1-项目准备)
2. [数据库配置 (SQL RPC)](#2-数据库配置-sql-rpc)
3. [Edge Function 部署](#3-edge-function-部署)
   - [wallet-login](#31-部署-wallet-login)
   - [bind-email](#32-部署-bind-email)
4. [环境变量配置 (JWT Secret)](#4-环境变量配置-jwt-secret-重要)

---

## 1. 项目准备

确保你已经安装了 Supabase CLI 并登录：

```bash
npm install -g supabase
supabase login
```

确保你的本地代码是最新的，特别是 `supabase/functions` 目录下的代码。

---

## 2. 数据库配置 (SQL RPC)

**安全核心组件**：我们需要在数据库中创建一个 SQL 函数，用于强制撤销用户的邮箱验证状态。这是防止“未验证邮箱登录漏洞”的关键。

请在 Supabase Dashboard 的 **SQL Editor** 中执行以下 SQL 语句：

```sql
-- 创建一个名为 unverify_user 的函数
-- 功能：将指定用户的 email_confirmed_at 字段设为 NULL (即未验证状态)
-- 权限：SECURITY DEFINER (允许 Edge Function 通过 Service Role 调用)

CREATE OR REPLACE FUNCTION unverify_user(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NULL
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

✅ **验证**：执行后，你应该能在 Database -> Functions 中看到 `unverify_user` 函数。

---

## 3. Edge Function 部署

### 3.1. 部署 `wallet-login`

此函数用于处理 Metamask 签名验证，并签发包含 Supabase 兼容声明 (`iss: 'supabase'`) 的 JWT Token。

在项目根目录运行：

```bash
npx supabase functions deploy wallet-login
```

### 3.2. 部署 `bind-email`

此函数用于将钱包账户绑定到真实邮箱。它使用了手动 JWT 验签机制 (Trusted Auth) 来绕过标准的 `getUser` 限制，并调用上述 RPC 函数确保安全。

在项目根目录运行：

```bash
npx supabase functions deploy bind-email
```

---

## 4. 环境变量配置 (JWT Secret) [重要!]

为了让 Edge Functions 能够正确签发和验证 Token，你需要配置 `JWT_SECRET`。

1.  **获取 Secret**:

    - 前往 Supabase Dashboard -> **Project Settings** -> **API**.
    - 找到 **JWT Settings**.
    - 复制 **JWT Secret** 的值。

2.  **设置变量**:
    - 在本地运行以下命令 (替换 `<your_secret>` 为实际值)：
      ```bash
      npx supabase secrets set JWT_SECRET=<your_secret>
      ```
    - 或者在 Dashboard -> **Edge Functions** -> **wallet-login / bind-email** -> **Manage Secrets** 中手动添加：
      - Key: `JWT_SECRET`
      - Value: `<粘贴你的 Secret>`

> ⚠️ **注意**: `wallet-login` 和 `bind-email` 两个函数都需要这个 Secret。如果使用 CLI 设置，它通常是全局生效的。

---

## ✅ 验证清单

- [ ] SQL 函数 `unverify_user` 已创建。
- [ ] 两个 Edge Functions 已成功部署。
- [ ] `JWT_SECRET` 环境变量已设置。
- [ ] 前端应用可以正常进行“连接钱包”和“绑定邮箱”操作。

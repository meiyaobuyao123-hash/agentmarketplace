# 05 — Token 设计

> **核心立场**：token 是 **"对一个 agent 的看好凭证 + 持有者权益绑定"**，不是投机工具。
> 我们不做 bonding curve、不做 launchpad UI、不做撮合、不做行情、不接 DEX。
> 商业化、KYC、合规这些事情**当前阶段都不考虑**（用户已确认）。

---

## 1. 为什么需要 token

不是为了"发币赚钱"，而是为了：

1. **正反馈循环**：好 package 的作者得到链上凭证可分发的资产，后续的更新、空投、治理都围绕这个资产展开
2. **持有者粘性**：一个用户持有某 package 的 token，意味着他对这个 agent 的长期看好；他会得到更新通知、空投权重、治理权
3. **去中心化身份**：作者的"作品集 + 持有者关系"可以脱离平台单独存在；理论上即使 marketplace 关闭，链上数据仍存活

---

## 2. 链与合约选型

| 维度 | 选择 | 理由 |
|------|------|------|
| 链 | **Sepolia testnet** | 免费、工具最熟、避开 meme coin 标签 |
| 标准 | **ERC-20**（OpenZeppelin） | 最通用 |
| 部署模式 | **工厂合约** `AgentTokenFactory` | 一次部署 factory，每个 package 一次 deploy |
| 库 | **OpenZeppelin Contracts 5.x** | 久经考验 |
| 开发框架 | **Foundry** | 测试快、部署脚本清晰 |

主网相关问题（GA / 商业化 / 合规）**留到 v1.0 再决定**。

---

## 3. 经济模型

### 3.1 总供应

每枚 token **固定 1,000,000 枚**（18 位小数）。固定供应 = 不增发 = 抗通胀，简化设计。

### 3.2 初始分配

| 比例 | 用途 | 分发方式 |
|------|------|---------|
| **40%** | 作者奖励 | 12 个月线性 vesting，cliff 30 天 |
| **30%** | 早期用户空投池 | 按 reviewer / installer 名单，merkle 空投 |
| **20%** | 站内激励池 | 排行榜奖励、bug 修复贡献者奖励，作者 + 平台共同管理 |
| **10%** | 平台保留 | 紧急流动性、治理用 |

### 3.3 反投机设计

- **作者份额带 vesting**：1 年线性，不能上来就砸盘
- **空投有冷却**：领空投后 7 天内不能转出（v0.3 加 NTT 模式）
- **不上 DEX**：v0.2 → v0.3 都不接 Uniswap / 不做撮合
- **不做行情**：详情页 token tab 不显示价格、不显示 K 线，只显示总供应、持有者数、自己的余额

### 3.4 持有者的实际权益

| 权益 | 何时生效 |
|------|---------|
| 新版本发布通知（邮件 / push） | v0.2 |
| 后续空投权重 | v0.2 |
| 评论高亮（"持有者评论"标识） | v0.2 |
| 治理投票（提议新功能 / 调整方向） | v0.3 |
| 优先查看 changelog 草稿 | v0.3 |

---

## 4. 合约清单

### 4.1 `AgentTokenFactory.sol`

```solidity
contract AgentTokenFactory {
    event TokenDeployed(
        bytes32 indexed slugHash,
        address indexed token,
        address indexed deployer,
        string slug
    );

    address public platformTreasury;
    address public owner;
    mapping(bytes32 => address) public tokenBySlug;

    function deployToken(
        string calldata slug,
        string calldata name,
        string calldata symbol,
        address authorWallet,
        bytes32 airdropMerkleRoot
    ) external returns (address token);
}
```

部署逻辑：
1. 校验 `slug` 没被部署过
2. new `AgentToken(name, symbol, totalSupply=1_000_000e18)`，初始 mint 给 factory
3. new `VestingWallet(authorWallet, start=block.timestamp + 30 days, duration=365 days)`，转 40 万入
4. new `MerkleAirdrop(token, airdropMerkleRoot)`，转 30 万入
5. transfer 20 万到 `platformTreasury`（站内激励池由后端管控分发）
6. transfer 10 万到 `owner`（平台保留）
7. emit `TokenDeployed`

### 4.2 `AgentToken.sol`

继承 `ERC20`、`ERC20Permit`（gasless approve）。无增发能力。

### 4.3 `VestingWallet`

直接用 [OpenZeppelin VestingWallet](https://docs.openzeppelin.com/contracts/5.x/api/finance#VestingWallet)。

### 4.4 `MerkleAirdrop.sol`

```solidity
contract MerkleAirdrop {
    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;
    mapping(uint256 => uint256) private claimedBitMap;

    function claim(
        uint256 index,
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external;
}
```

后端：
- 维护 `airdrop_claims` 表，触发空投时生成 merkle tree、上传 root
- 用户领取时返回 `(index, amount, proof)`

### 4.5 `Treasury.sol`（v0.3 加）

简易多签 / timelock，控制激励池分发。v0.2 直接 EOA（platformTreasury），v0.3 升级。

---

## 5. 发射流程（用户视角）

1. 作者在自己 package 详情页看到 "Launch Token" 按钮（仅 owner 可见）
2. 点进 `/p/{slug}/launch` 向导：
   - 设定 `name` / `symbol`（带前缀 `tAGM-` 提示这是 testnet）
   - 平台展示分配方案（不可改）、vesting 计划
   - 选定**早期空投快照时间**（默认：上线起到现在所有 reviewer + installer）
3. 后端生成 merkle tree（基于截至此刻的 reviewer / installer 列表，加权规则见 §6）
4. 前端调用 `factory.deployToken(...)`，钱包签名
5. tx 上链 → worker 索引到 `TokenDeployed` 事件 → 落库
6. 详情页 token tab 出现，作者份额开始 vesting，早期用户在 `/wallet` 看到可领取的空投

---

## 6. 早期空投权重

`reward = base + log(1 + days_since_launch_inverse) × multiplier`

简化版规则：

| 行为 | 基础点数 |
|------|---------|
| 首次安装（且当时是该 package 前 N 名） | 100 |
| 留下评分（rating ≥ 4） | 50 |
| 留下评分（rating ≤ 3 但内容有效） | 30 |
| 提交 issue / PR 被合并 | 200 |

总点数归一化到空投池（30 万枚）。每个用户至少 100 枚（达到门槛者）。
评分内容质量审核：v0.2 简单按字数 / 是否含 markdown / 是否含代码块；v0.3 接 LLM 评分。

---

## 7. 链事件索引器（worker）

监听事件并回写 DB：

| 事件 | 表 | 操作 |
|------|----|------|
| `TokenDeployed` | `tokens` | 插入 |
| `Transfer` | `token_holders` | 增量更新 from/to 余额 |
| `Claimed`（MerkleAirdrop） | `airdrop_claims` | 标记 claimed_at |
| `ERC20Votes.DelegateChanged`（v0.3） | `delegations` | 治理用 |

实现：
- 启动时从 last indexed block 开始，拉链上日志
- 用 [eth_getLogs](https://docs.alchemy.com/reference/eth-getlogs) 批量拉
- 每 12 秒（Sepolia 出块约 12s）轮询一次新 block
- 持久化 `last_indexed_block` 在单独的 SQLite 行 / Postgres 行

---

## 8. 安全考量

| 风险 | 应对 |
|------|------|
| 作者 rugpull（量大砸盘） | vesting 1 年；不上 DEX |
| 女巫攻击空投 | 评分需安装凭证 + 钱包；空投权重按行为评估而非平均 |
| factory 被攻击导致重复部署 | tokenBySlug mapping 强校验 |
| factory 私钥泄漏 | factory 是无所有权部署器（无 admin function） |
| 索引器漏事件 | 启动时全量回放 + 周期性 reconcile（按 block 范围重扫） |
| 未来需迁主网 | tokens 表保留 chain_id，可平滑加新链；slug → token mapping 走 (chain_id, slug) 复合键 |

---

## 9. 不做的事（再次强调）

- ❌ Bonding curve
- ❌ Launchpad UI / 倒计时 / "开盘"
- ❌ 接 Uniswap / Curve / 其它 DEX
- ❌ 站内撮合订单簿
- ❌ K 线 / 涨跌榜 / 价格预言机
- ❌ 主网部署
- ❌ 收手续费 / 发射税

如果未来产品方向变化要做这些，必须先解决合规、KYC、商业模式问题，单独立项讨论。

---

## 10. 开放问题（v0.2 启动前需定）

1. 早期空投快照截止时间：发射时刻还是固定窗口？默认走前者
2. 一个作者可不可以同时给多个 package 发币？默认可以
3. 同一 slug 销毁后能否复用？默认不能（factory 永久占用）
4. Vesting 期间作者能否提前转 vesting 合约的所有权？默认不能
5. 平台保留份额（10%）做什么？v0.3 之前不动，留到治理 / 激励池补充

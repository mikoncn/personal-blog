-- 添加 wallet_address 列到 profiles 表
-- 如果列已存在，这个语句会失败，但不会影响现有数据

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- 为 wallet_address 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);

-- 添加注释说明
COMMENT ON COLUMN profiles.wallet_address IS '用户的 Web3 钱包地址';

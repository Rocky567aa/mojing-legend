/**
 * HeroData — 8位英雄共享数据（ProfessionSelectScene + CombatSystem 共用）
 */
export const HERO_DATA = {
  kane:  { id:'kane',  name:'铁壁战士·卡恩', icon:'🛡️', color:0xff5500, element:'🔥 火焰晶', passive:'最大HP +50%，受到伤害 -20%', desc:'坚不可摧的前锋，新手首选', difficulty:'★★',    beginnerFriendly:true,  stats:{ hp:220, atk:18, crit:0.05, critMul:1.8, moveInterval:155 } },
  vera:  { id:'vera',  name:'暗影刺客·薇拉', icon:'🗡️', color:0xffdd00, element:'⚡ 雷电晶', passive:'暴击率 +25%，暴击伤害 ×2.5',  desc:'极速单体爆发，玻璃炮',     difficulty:'★★★★★', beginnerFriendly:false, stats:{ hp:100, atk:30, crit:0.32, critMul:2.5, moveInterval:120 } },
  oren:  { id:'oren',  name:'星界法师·奥伦', icon:'🌟', color:0x44aaff, element:'❄️ 冰霜晶', passive:'冰霜矿采集 ×1.5，攻击可冰冻', desc:'范围冰冻输出，需要走位',    difficulty:'★★★★',  beginnerFriendly:false, stats:{ hp:120, atk:34, crit:0.12, critMul:2.0, moveInterval:165 } },
  lena:  { id:'lena',  name:'圣光祭司·莉娜', icon:'✨', color:0xffee88, element:'✨ 神圣晶', passive:'每10s回复15HP，副作用 -30%', desc:'持久作战，最佳续航',        difficulty:'★★',    beginnerFriendly:true,  stats:{ hp:170, atk:15, crit:0.08, critMul:1.8, moveInterval:160 } },
  ella:  { id:'ella',  name:'自然德鲁伊·艾拉',icon:'🌿',color:0x44ff88, element:'🌿 自然晶', passive:'植物资源 ×2，食物回血 +50%', desc:'资源采集专精，生态亲和',    difficulty:'★★★',   beginnerFriendly:false, stats:{ hp:145, atk:20, crit:0.10, critMul:2.0, moveInterval:155 } },
  reg:   { id:'reg',   name:'龙裔骑士·雷格', icon:'🐉', color:0xff8800, element:'🔥 火焰晶', passive:'移速 +15%，攻击附带燃烧',    desc:'攻守均衡，可解锁坐骑',     difficulty:'★★★',   beginnerFriendly:false, stats:{ hp:175, atk:22, crit:0.10, critMul:2.0, moveInterval:140 } },
  mag:   { id:'mag',   name:'幽冥术士·玛格', icon:'💀', color:0x9900cc, element:'🌑 暗影晶', passive:'提纯耗时 -40%，诅咒伤害 ×1.8',desc:'战略控场，生产链最快',    difficulty:'★★★★',  beginnerFriendly:false, stats:{ hp:115, atk:28, crit:0.16, critMul:2.2, moveInterval:165 } },
  thor:  { id:'thor',  name:'雷霆游侠·托尔', icon:'⚡', color:0x88ddff, element:'⚡ 雷电晶', passive:'攻击范围 +2格，雷电矿 +20%', desc:'远程精准输出，保持距离',   difficulty:'★★★',   beginnerFriendly:false, stats:{ hp:135, atk:25, crit:0.15, critMul:2.0, moveInterval:145 } },
}

export const PROFESSIONS = Object.values(HERO_DATA)

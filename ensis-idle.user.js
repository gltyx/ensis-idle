// ==UserScript==
// @name         Ensis IDLE丨放置之刃 中文汉化脚本
// @namespace    http://tampermonkey.net/
// @version      1.2.3
// @description  中文汉化脚本，安装即可用，带开关汉化的菜单（要在油猴菜单开关）
// @author       技术支持：麦子、JAR、小蓝、好阳光的小锅巴   翻译君：林雷丨LinLei_Baruch
// @match        https://cerbion.net/ensis-idle/
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // ================= 开关控制 =================
    const isEnabled = GM_getValue('translation_enabled', true);
    GM_registerMenuCommand(isEnabled ? "🟢 汉化已开启 (点击关闭)" : "🔴 汉化已关闭 (点击开启)", () => {
        GM_setValue('translation_enabled', !isEnabled);
        location.reload();
    });

    const isBgRunEnabled = GM_getValue('background_run_enabled', false);
    GM_registerMenuCommand(isBgRunEnabled ? "🟢 后台挂机已开启 (点击关闭)" : "🔴 后台挂机已关闭 (点击开启)", () => {
        GM_setValue('background_run_enabled', !isBgRunEnabled);
        location.reload();
    });

    // ================= 后台挂机注入 =================
    if (isBgRunEnabled) {
        // 1. 媒体播放法：通过播放极低音量的循环音频，欺骗浏览器保持后台活跃 (解决浏览器底层的节流休眠)
        const startBackgroundAudio = () => {
            if (window.__bgAudioStarted) return;
            const audio = new Audio('https://download.samplelib.com/mp3/sample-9s.mp3');
            audio.loop = true;
            audio.volume = 0.01; // 音量极低，不影响正常使用

            audio.play().then(() => {
                window.__bgAudioStarted = true;
                console.log("🟢 锅巴汉化：后台挂机音频已启动，浏览器防休眠已激活！");
            }).catch(() => {
                // 如果被浏览器自动播放策略拦截，静默等待用户交互
            });
        };

        // 尝试在页面加载时立即播放
        startBackgroundAudio();

        // 监听用户交互以绕过浏览器的自动播放限制（只要玩家点了一下页面，立刻启动挂机）
        const initAudioOnInteract = () => {
            startBackgroundAudio();
            if (window.__bgAudioStarted) {
                document.removeEventListener('click', initAudioOnInteract);
                document.removeEventListener('keydown', initAudioOnInteract);
            }
        };
        document.addEventListener('click', initAudioOnInteract);
        document.addEventListener('keydown', initAudioOnInteract);

        // 2. 页面可见性劫持：防止某些游戏自带的代码检测到切换标签页而自动暂停
        const bgScript = document.createElement('script');
        bgScript.textContent = `
            (function() {
                try {
                    Object.defineProperty(document, 'hidden', { get: () => false });
                    Object.defineProperty(document, 'webkitHidden', { get: () => false });
                    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });

                    const events = ['visibilitychange', 'webkitvisibilitychange', 'blur', 'focus', 'pagehide'];
                    for (let ev of events) {
                        document.addEventListener(ev, e => e.stopImmediatePropagation(), true);
                        window.addEventListener(ev, e => e.stopImmediatePropagation(), true);
                    }
                    console.log("🟢 锅巴汉化：游戏防暂停劫持已激活！");
                } catch (e) {}
            })();
        `;
        if (document.head || document.documentElement) {
            (document.head || document.documentElement).appendChild(bgScript);
            bgScript.remove(); // 保持DOM整洁
        }
    }

    if (!isEnabled) {
        console.log("汉化注入器已关闭。");
        return;
    }

    // ================= 后台挂机注入 =================
    if (isBgRunEnabled) {
        const bgScript = document.createElement('script');
        bgScript.textContent = `
            (function() {
                try {
                    // 获取原生的 hidden 属性 getter
                    const hiddenGetter = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden')?.get;

                    // 强制覆盖页面的可见性状态，欺骗游戏
                    Object.defineProperty(document, 'hidden', { get: () => false });
                    Object.defineProperty(document, 'webkitHidden', { get: () => false });
                    Object.defineProperty(document, 'visibilityState', { get: () => 'visible' });

                    // 在捕获阶段拦截可见性变化和失焦事件
                    const events = ['visibilitychange', 'webkitvisibilitychange', 'blur', 'focus', 'pagehide'];
                    for (let ev of events) {
                        document.addEventListener(ev, e => e.stopImmediatePropagation(), true);
                        window.addEventListener(ev, e => e.stopImmediatePropagation(), true);
                    }

                    // 劫持 requestAnimationFrame，后台时降级为 setTimeout，防止游戏循环彻底停止
                    const originalRAF = window.requestAnimationFrame;
                    const originalCAF = window.cancelAnimationFrame;
                    window.requestAnimationFrame = function(cb) {
                        const isHidden = hiddenGetter ? hiddenGetter.call(document) : false;
                        if (isHidden) {
                            return setTimeout(() => cb(performance.now()), 1000 / 60);
                        } else {
                            return originalRAF(cb);
                        }
                    };
                    window.cancelAnimationFrame = function(id) {
                        clearTimeout(id);
                        originalCAF(id);
                    };
                    console.log("🟢 锅巴汉化：后台挂机防暂停模式已激活");
                } catch (e) {
                    console.error("后台挂机脚本注入失败:", e);
                }
            })();
        `;
        // 注入到页面环境中以绕过沙盒限制
        if (document.head || document.documentElement) {
            (document.head || document.documentElement).appendChild(bgScript);
            bgScript.remove(); // 保持DOM整洁
        }
    }

    if (!isEnabled) {
        console.log("汉化注入器已关闭。");
        return;
    }

    // ================= 字典数据 =================
    const cnItems = {

        //Settings 设置
        'Return to Game': '返回游戏',
        'Settings': '设置',
        'Customize your experience, all settings are saved automatically to your device.': '自定义您的体验，所有设置会自动保存到您的设备。',
        'Number Notation': '计数法',
        'Standard': '标准',
        'Short': '简短',
        'Scientific': '科学',
        'Engineering': '工程',
        'Audio': '音频',
        'Sound Effects': '音效',
        'Music': '音乐',
        'Visual': '视觉',
        'Floating Numbers': '浮动数字',
        'Show damage numbers when clicking': '点击时显示伤害数字',
        'Theme': '主题',
        'Light': '浅色',
        'Dark': '深色',
        'System': '系统',
        'Confirmations': '确认提示',
        'Obliteration': '湮灭',
        'Show a confirmation dialog before Obliterating': '在湮灭前显示确认对话框',
        'Form Body': '重塑肉身',
        'Show a confirmation dialog before Forming Body': '在重塑肉身前显示确认对话框',
        'Savegame': '游戏存档',
        'Auto-Save Interval': '自动保存间隔',
        '1 min': '1分钟',
        '10 min': '10分钟',
        '1 hour': '1小时',
        'Save Now': '立即保存',
        'Export Save to Clipboard': '导出存档到剪贴板',
        'Import Save': '导入存档',
        'Danger Zone': '危险区域',
        'Reset Game Progress': '重置游戏进度',
        'Delete all game progress, irreversibly. Settings will remain.': '不可逆转地删除所有游戏进度。设置将保留。',
        'Wipe': '清除',
        'Reset Settings': '重置设置',
        'Restore all settings to default values, irreversibly. Game progress will remain.': '不可逆转地将所有设置恢复为默认值。游戏进度将保留。',
        'All settings are automatically saved to your device': '所有设置会自动保存到您的设备',
        'Reset': '重置',
        'Game saved!':'游戏已保存！',
        'Game saved': '游戏已保存',
        'Game saved manually':'游戏已手动保存',
        'Made with ♥ by': '（汉化：LinLei_Baruch丨林雷） 用心制作 ♥ 来自',

        //About 关于
        'About': '关于',
        'Project attribution and metadata': '项目归属与元数据',
        'Creator': '创作者',
        'Inspiration': '灵感',
        'Icons': '图标',
        'Logo/Banner/Favicon': 'Logo/横幅/网站图标',
        'Material Icons': 'Material 图标',
        'AI Disclosure': 'AI 披露',
        'LLMs were used during development within the IDE workflow. No Story, Imagery or Audio was generated using generative AI.': '在 IDE 工作流开发期间使用了大语言模型。未使用生成式 AI 生成故事、图像或音频。',
        'Creation date': '创建日期',
        'February 19th 2026': '2026.2.19',

        //Statistics 统计
        'Statistics': '统计',
        'Resources': '资源',
        'Highest Ash': '最高灰烬',
        'Total Clicks': '总点击次数',
        'Highest Runes':'最高符文',
        'Playtime': '游戏时长',
        'Total Playtime': '总游戏时长',
        'Time in Current Obliteration': '当前湮灭时长',
        'Time in Current Body': '当前重塑肉身时长',
        'Progression': '进度',
        'Total Obliterations': '总湮灭次数',
        'Highest Obliteration':'最高湮灭次数',
        'Bodies Formed': '已成型躯体',
        'Highest Body Formed':'最高已成型躯体',
        'Upgrades Bought': '已购买升级',
        'Highest Clones (Base)':'最高克隆体 (基础)',
        'Highest Clones (with Multipliers)':'最高克隆体 (含倍数)',
        'Highest Perk Points':'最高技能点',
        'Exploration': '探索',
        'Explorations Completed': '已完成探索',
        'Nothing Events': '无事发生事件',
        'Area Completions Recorded': '记录的区域完成次数',
        'Buildings Built': '已建造建筑',
        'Time Spent Exploring': '探索耗时',
        'Time Spent Traveling': '旅行耗时',
        'Total Runes Found':'发现的符文总数',
        'Highest Runes found':'发现的最高符文数',
        'Highest Wood found':'发现的最高木材数',
        'Highest Stone found':'发现的最高石头数',
        'Highest Metal found':'发现的最高金属数',
        'Highest Crystal found':'发现的最高水晶数',

        //Upgrades 升级
        'This Ash can be formed into something...':'这份灰烬可以被塑造成某种东西……',
        'You are learning to shape the Ash, but there is more to discover.':'你正在学习塑造灰烬，但还有更多等待发现。',
        'Your body is taking shape, but it\'s not good enough...':'你的身体正在重塑，但还不够好…',
        'Your bodyless mind is adrift, Ash surrounds you...':'你失去躯体的意识在四处飘荡，灰烬环绕着你……',
        'The world seems to respond to your presence...':'世界似乎在回应你的存在…',
        '(from': '(来自',
        '/s': '/秒',
        'Obliterations': '湮灭',
        'Formed Bodies': '重塑肉身',
        '% ASH': '% 灰烬',
        'Ash': '灰烬',
        'Tip: You can hold this, instead of clicking a lot!': '提示：您可以按住它，而不需要频繁点击！',
        'Runes': '符文',
        'Obliterate?':'湮灭？',
        'You will lose all your current Ash and Ash upgrades, but will be reborn stronger.':'你将失去当前所有的灰烬及灰烬升级，但重生后会变得更强。',
        'Upcoming Unlocks:':'即将解锁：',
        'Form Body?':'重塑肉身？',
        'This will wipe': '这将清除',
        'your Ash, Upgrades and Obliterations': '你的灰烬、升级和湮灭',
        '! Clones, Trainings, Perks and later Features will persist.': '！克隆、训练、特权以及后续功能将被保留。',
        'The next Body Forming will unlock a':'下一次重塑肉身将解锁',
        'new Training':'一项新训练',
        'You\'ve unlocked all Trainings for now.':'您已解锁目前所有的训练。',
        'Cancel':'取消',
        'Confirm':'确认',
        'Auto-buy upgrades': '自动购买升级',
        'Next auto-upgrade buy:': '下一次自动购买升级:',
        'Upgrades': '升级',
        'MAX LEVEL': '满级',
        'Total:': '总计:',
        'Buy': '购买',
        'Max': '全部购买',
        'Max All': '购买所有升级',
        'Buy upgrades to increase Ash production.': '购买升级以增加灰烬产量。',
        'COLLECT': '收集',
        'Offline Progress': '离线进度',
        'You were away for': '您离开了',
        'Ash earned': '灰烬获得',
        'Perk Points': '技能点',
        'Offline Runes':'离线符文',
        'Training Progress': '训练进度',
        'Materials earned':'获得的材料',
        'Progress +':'进度 +',
        'Continue':'继续',
        'Ashen Hand': '灰烬之手',
        'Increases Ash collection by': '每次点击使灰烬收集量增加',
        'per click.': '',
        'Aura':'光环',
        'Passively generates': '每秒被动生成',
        'Ash per second.': '灰烬。',
        'Ash per second': '灰烬。',
        'Skeleton': '骨骼',
        'Boosts all Ash production by': '将所有灰烬产量提升',
        'Organs': '器官',
        'Decrease cost of all Upgrades by': '所有升级的成本降低',
        ', cannot gain bonus levels.': '，无法获得额外等级。',
        'Muscles': '肌肉',
        'Increase Ash collection by': '增加灰烬收集量',
        'Skin': '皮肤',
        'Passively generate': '每秒被动生成',
        'of click value per second.': '的点击收益.',
        'Senses': '感官',
        'Increases base Ash collection from Ashen Hand by': '使来自灰烬之手的基础灰烬收集量增加',
        'Reflexes': '反射',
        'Each Muscle level increases total Ash production by': '每个肌肉等级使总灰烬产量增加',
        'Soul': '灵魂',
        'Increases max level of all other upgrades by 1.': '使所有其他升级的最高等级增加1。',
        'Instinct': '本能',
        'Increases base Ash production from your Aura by 8.': '使你的光环的基础灰烬产量增加8。',
        'Digestion': '消化',
        'Total upgrade levels boost Ash production by': '总升级等级使灰烬产量提升',
        'Accurate Memory': '准确的记忆',
        'Keep 1 level of all other upgrades on Obliteration.': '保留“湮灭”上所有其他升级的1个等级。',
        'Intimidating Presence': '骇人威仪',
        'Core Strength': '核心力量',
        'Further boost Ash production by': '进一步将灰烬产量提升',
        'Complex Nervous System': '复杂神经系统',
        'Grants 1 bonus level to every other upgrade, cannot gain bonus levels.': '为其他所有升级提供1个额外等级，无法获得额外等级。',
        'Void Resonator': '虚空共鸣器',
        'Reduces the cost of Obliteration by': '使湮灭的成本降低',
        'Shared Workload': '共享工作负载',
        'Increases Ash production by': '每创造一个克隆体，灰烬产量增加',
        'per Clone created.': '',
        'Corporeal Transference': '肉体转移',
        'Retain 1 level of all other upgrades on Form Body.': '保留“重塑肉身”上所有其他升级的1级。',

        //Training 训练
        'Assign clones to other tasks or leave them idle here to generate points.':'将克隆体分配给其他任务，或者让它们在这里闲置以生成技能点。',
        'Training': '训练',
        'Create ashen clones, allocate them to train for you. Idle clones create perk points.': '创造灰烬克隆体，分配它们为你训练。闲置的克隆体会产生技能点。',
        'Refund': '返还升级',
        'Ashen Clones:': '灰烬克隆体:',
        'Creating ~': '正在创造 ~',
        'Creating': '正在创造 ',
        'Clones...': '个克隆体',
        'Clone...': '个克隆体',
        'Req:': '需求：',
        'Perk Point Generation': '技能点生成',
        'idle clones are generating': '个闲置克隆体每秒产生',
        'Perk Points per second...': '的技能点…',
        'Available': '可用',
        'Total': '总计',
        'Allocate:': '分配:',
        'ALL': '全部',
        'Recall': '召回',
        'Clones': '克隆体',
        'create clone':'创造克隆体',
        'Create Clone':'创造克隆体',
        'Perk Point Speed': '技能点速度',
        'Automatic Cloning':'自动创造克隆体',
        'Your Clones are training everything simultaneously.':'你的克隆体正在同时训练一切。',
        'Increases the speed of creating perk points by 20%': '生成技能点的速度提高20%',
        'Ash Production': '灰烬生成',
        'Increases total Ash production by 10%': '灰烬总产量增加10%',
        'Upgrade Bonus Levels': '升级奖励等级',
        'Grant 2% of each Upgrade level as bonus to that Upgrade': '将每个升级等级的2%作为加成赋予该升级',
        'Obliteration Cost Reduction': '湮灭成本降低',
        'Decreases the cost of obliteration by 10%': '降低10%的湮灭成本',
        'Upgrade Limit': '升级限制',
        'Increases the maximum level of all Ash Upgrades by 1 (except Soul)': '所有灰烬升级的最高等级提升1（灵魂除外）',
        'Cloning Cost Reduction': '克隆体成本降低',
        'Decreases Cost for new clones by 20%': '新克隆体成本降低20%',
        'Training Speed': '训练速度',
        'Increase the speed for training by 20%': '将训练速度提高20%',
        'Clones creating Clones': '克隆体创造克隆体',
        'Increase the total amount of Clones by 2.5% per level (compounding)': '每级增加2.5%的克隆体总数（复利）',
        'Cloning Speed': '克隆体速度',
        'Increases the speed of creating clones by 10%': '创造克隆体的速度提升10%',
        'Form Body Efficiency': '重塑肉身效率',
        'Decrease the amount of Clones needed to form a Body by 0.5%': '将重塑肉身所需的克隆体数量减少0.5%',
        'Perks': '技能',
        'Unlock persistent upgrades that survive Obliteration': '解锁在湮灭后依然保留的永久升级',
        'Unlocked': '已获得',
        'Double your Ash production': '使你的灰烬产量翻倍',
        'Permanently produce 10000 Ash per second passively': '永久被动每秒产生10000灰烬',
        'Always retain 10 levels of Organs (stacks with other Boni)': '始终保留10级器官（与其他加成叠加）',
        'Decreases cloning cost by 90%': '克隆体成本降低90%',
        'Each training level increases Ash production by 1%': '每个训练等级使灰烬产量增加1%',
        'Double the bonus to 100% per Obliteration': '将每次湮灭的加成翻倍至100%',
        'Upgrade cost is halved': '升级成本减半',
        'Clones are automatically bought when affordable': '买得起时自动购买克隆体',
        'Each formed Body grants +200% Ash production': '每次重塑肉身将提供+200%灰烬产量',
        'You can Obliterate multiple times at once with enough Ash': '如果有足够的灰烬，你可以一次进行多次湮灭',
        'Unlock three new Upgrades': '解锁三个新升级',
        'Attempts to autobuy upgrades once every 10 seconds': '每10秒尝试自动购买一次升级',
        'Unspent Perk Points grant 1% to Ash production each': '每个未使用的技能点提供1%的灰烬产量加成',
        'Reduce Clone cost scaling from 25% to 10% per level': '将克隆体成本递增幅度从每级25%降低至10%',
        'Raises the Obliteration bonus to the power of 1.5': '将湮灭加成提高至1.5次方',
        'Unlock the ability to explore your surroundings': '解锁探索周围环境的能力',
        'Rune Perks':'符文技能',
        'Potent effects, unlocked during Exploration and unleashed with the power of Runes':'强大的效果，在探索中解锁，并借助符文的力量释放',
        'Autobuy uses Max All instead of +1 to all':'自动购买使用“购买所有升级”而不是“购买升级 +1”',
        'Buying Ash Upgrades does not spend Ash':'购买灰烬升级不消耗灰烬。',
        'Training time is raised to the power of 0.9':'训练时间提升至0.9次方',
        'Obliteration is free, automatic and does not reset anything. Triggers with auto-buy.':'湮灭是免费且自动的，并且不会重置任何内容。随自动购买触发。',
        'Cloning cost is raised to the power of 0.9':'克隆体成本提升至0.9次方',
        'Clones always work on all Trainings simultaneously':'克隆体始终同时在所有训练上工作',
        'Perk Point generation time is raised to the power of 0.9':'技能点生成时间变为0.9次幂',
        'All Building levels decrease Training time by 5% each':'所有建筑等级各减少5%的训练时间',

        //Exploration 探索
        'Exploration': '探索',
        'Fully explored.': '已完成探索该区域。（建筑、遗物已发现）',
        'You are here.': '你在这里。',
        'Click to travel here (': '点击旅行至此 (',
        'Exploring…': '探索中… 剩余',
        's remaining': ' 秒',
        'Traveling to': '正在前往',
        'Too far to travel.': '距离过远，无法前往。',
        'Venture into the unknown, beyond the Ash.': '踏入未知，前往灰烬之外。',
        'There is more to find here.': '这里还有更多东西可以发现。',
        'You completed this area.':'你完美探索了该区域。（建筑、遗物已发现并且遗物已满级）',
        'Unknown Area':'未知区域',
        'Current Location':'当前位置',
        'Discovery Progress:':'发现进度：',
        'You\'ve explored this area': '你已经探索该区域',
        'times': '次',
        'times.': '次。',
        ', reducing your exploration time by': '，使你的探索时间减少了',
        '(maxed out)': '(已达上限)',
        'Clones currently not exploring.': '克隆体当前未在探索。',
        'Clones are exploring this area...': '克隆体正在探索这个区域…',
        'Explore': '探索',
        'You feel like there is more to find here...': '你感觉这里还有更多值得探索的东西……',
        'It feels like you explored everything in this area.': '看起来你已经把这片区域探索得差不多了。',
        'You\'re trying to find a path to a distant point of interest...':'你正在寻找一条通往远处目标点的路径……',
        'You found a safe path to':'你找到了一条通往',
        '! You can now travel there, if you wish.':' 的安全路线！现在只要你愿意，就可以前往那里。',
        'storage is full, some was lost.': '存储空间已满，部分物品已丢失。',
        'stone': '石材',
        'Stone': '石材',
        'metal':'金属',
        'Metal':'金属',
        'crystal':'水晶',
        'Crystal':'水晶',
        'wood':'木材',
        'Wood':'木材',

        'Mud Cavern': '泥浆洞穴',
        'A muddy, sprawling cave system with several small chambers.': '一个泥泞、四处延伸的洞穴系统，包含几个小洞室。',
        'Dead Forest':'死亡森林',
        'A sparse, lifeless forest, littered with branches and stumps, did the Ash cause this?':'一片稀疏、毫无生气的森林，到处散落着树枝和树桩，这是灰烬造成的吗？',
        'Ashen Camp':'灰烬营地',
        'Ashen Fields':'灰烬原野',
        'The heart of your operations. A vast field of nothing but Ash.':'你的行动核心。一片除了灰烬别无他物的广阔原野。',
        'Stone Wave Cliffs':'石浪悬崖',
        'Giant columnar joints tower against the sea of Ash, you feel like a great tragedy happened here, once.':'巨大的柱状节理屹立于灰烬之海前，你感觉这里曾经发生过一场巨大的悲剧。',
        'Lonely River':'孤独的河流',
        'A slow-moving, dark winding river cutting through the forest.':'一条缓慢流动的幽暗蜿蜒河流穿过森林。',
        'Silent Lake':'寂静之湖',
        'A mysterious lake at the end of the river, the water is dark and calm, no signs of life.':'位于河流尽头的神秘湖泊，湖水幽暗平静，没有任何生命迹象',
        'Crumbling Ruins':'坍塌的废墟',
        'Barely identifiable remains of what used to be a settlement or fortress, most walls have crumbled enough to be easily traversed.':'曾经的聚落或要塞留下的几乎无法辨认的遗迹，大部分墙壁已经坍塌，可以轻易穿行。',
        'Old Battleground':'旧战场',
        'Place of a great battle, long ago. Rusted weaponry and crushed bones litter the area.':'很久以前的一场大战遗址。该地区到处散落着生锈的武器和碎裂的骨头。',
        'Mountainside Path':'山腰小路',
        'A narrow and dangerous path beyond the rocky cliffs, rocks and debris make the trail treacherous.':'一条位于岩石悬崖之外的狭窄险路，岩石和碎石使得这条小径危险重重。',
        'Frozen Mine':'冰封矿井',
        'A deep mine carved into the mountain, it\'s frozen over, but still accessible. You can see something glimmering inside.':'一座开凿在山中的深邃矿井，虽然已经结冰，但仍然可以进入。你能看到里面有东西在闪闪发光。',
        'Hidden Plateau':'隐秘高地',
        'A secluded section of the mountain, shrouded in mist. This place seems to have been used as a hideout once.':'山中一处僻静的区域，笼罩在迷雾之中。这里似乎曾经被用作藏身之处。',
        'Snowdrift Ridge':'积雪岭',
        'The plateau gives way to a cold, icy slope, leading down the mountain. The air is freezing and the crackling of ice is ever present.':'高原变成了一道寒冷结冰的斜坡，通向山下。空气冰冷刺骨，冰层碎裂的声响不绝于耳。',
        'Borean Woodland':'北风林地',
        'A dense pine forest, covered in ice and snow, and traces of magic litter the area.':'一片茂密的松林，被冰雪覆盖，这片区域到处散落着魔法的痕迹。',
        'Poison Marsh':'毒沼泽',
        'A murky swampland filled with poisonous flora and sharp rocks, it\'s extremely difficulty to navigate and you feel like you should not linger here for too long.':'一片充满有毒植物和尖锐岩石的幽暗沼泽地，这里极难穿行，让你感觉不应该在此逗留太久。',
        'Lush Valley':'葱郁山谷',
        'The sight is breathtaking, you still see traces of Ash, but this place is teeming with life, enormous trees, vibrant flowers and sprawling undergrowth.':'景色令人叹为观止，你依然能看到灰烬的痕迹，但这里生机盎然，到处是巨大的树木、鲜艳的花朵和蔓生的灌木丛。',
        'Cursed Shore':'诅咒海岸',
        'A desolate rocky beach, with several large shipwrecks scattered around. The ocean beyond is dark and calm, the Ash is still present here, even if less prominent.': '一片荒凉的岩石海滩，散布着几艘巨大的沉船残骸。远处的海洋黑暗而平静，灰烬依然存在于此，尽管没那么明显。',

        '. It\'s yours now.': '。现在它是你的了。',
        'Runes, a valuable find!': '符文，宝贵的发现！',
        'Runes, nice!': '符文，太棒了！',
        'Runes.': '符文。',
        'Runes!': '符文！',
        'Runes and pocket them.':'符文并将它们收入囊中。',
        'Runes and add them to your collection.':'符文，并将它们加入了你的收藏。',
        'Runes, nice! are yours now, after scouring the area.':'符文，真不错！在搜刮该区域后，现在归你所有了。',
        'Making sure to carefully scavenge the vicinity. Your efforts pay off as you discover':'确保仔细搜刮附近区域。你的努力得到了回报，你发现了',
        '. Not bad.':'。不错。',

        'Unique Events':'特殊事件',
        'Your most profound discoveries in this world.':'你在这个世界中最重大的发现。',
        'just now!':'刚刚！',
        'The expanse of the lake gives you a few ideas how to improve your Ash production.':'广阔的湖面给了你一些关于如何提高灰烬产量的启发。',
        'Ash Silo Unlocked':'灰烬筒仓已解锁',
        'One of the biggest and most luxurious buildings must have been a treasury, maybe building one yourself would be a good idea.':'最大、最豪华的建筑之一想必就是宝库，也许亲自建造一座是个好主意。',
        'Treasury Unlocked':'宝库已解锁',
        'Broken spears, torn armor and rusted swords are all that remain of a fierce battle. To avoid the same fate, you decide to set up a training ground to better prepare yourself and your Clones.':'折断的长矛、残破的盔甲和生锈的剑是一场激战留下的全部。为了避免遭遇同样的命运，你决定建立一个训练场，让你和你的克隆体做好更充分的准备。',
        'Training Grounds Unlocked':'训练场已解锁',
        'Nothing more than a crack in the mountain side, you fit through and discover a vein of ore, you could set up a mining shaft here.':'只不过是山腰上的一个裂缝，你穿过去后发现了一条矿脉，你可以在这里建立一个矿井。',
        'Mine Unlocked':'矿井已解锁',
        'Inside the icy cavern you find mineral veins that reflect light like a gem, you decide to set up a mining station here to gather these crystals.':'在冰冷的洞穴中，你发现了如宝石般反射着光芒的矿脉，你决定在这里建立一个采矿站来收集这些水晶。',
        'Crystal Mine Unlocked':'水晶矿井已解锁',
        'Some tools and materials were left behind and give you an idea how to improve building construction.':'一些遗留下来的工具和材料为你改进建筑施工提供了灵感。',
        'Workshop Unlocked':'建造工坊已解锁',
        'Scouting difficult terrain like this is exhausting; You decide to set up a dedicated building to help you prepare yourself and your Clones on your expeditions.':'侦察如此困难的地形令人筋疲力尽；你决定建造一座专门的建筑，来帮助你和你的克隆体为探险做好准备。',
        'Outrider Post Unlocked':'先遣哨所已解锁',
        'Making your way through the snow you suddenly find an enormous area of what used to be a research facility. Burnt books, broken equipment and faded magic circles are all that remain, you decided to try recreate the research and experiments in your base.':'在雪地中前行时，你突然发现了一大片曾经是研究设施的区域。烧毁的书籍、损坏的设备和褪色的魔法阵是仅存的一切，你决定尝试在你的基地中重现这些研究和实验。',
        'Laboratory Unlocked':'实验室已解锁',
        'This area of the Ashen Fields seems suitable for construction, you decide to set up a camp here.':'灰烬平原的这片区域似乎很适合建造，你决定在这里建立营地。',
        'Base Tab Unlocked':'基地选项卡已解锁',
        'This area was once a lush thicket, you ponder on ways to restore the forest and gather more wood for construction.':'这片区域曾经是一片茂密的灌木丛，你思考着恢复森林的方法，并收集更多木材用于建筑。',
        'Forestry Unlocked':'林场已解锁',
        'Following the winding river each time is tedious, you need some kind of vantage point, maybe you can build one.':'每次沿着蜿蜒的河流走太乏味了，你需要某种制高点，也许你可以建造一个。',
        'Watchtower Unlocked':'瞭望塔已解锁',
        'Although the cavern is very muddy, the walls seem to be made out of a very pristine stone, you make plans to gather it.':'虽然洞穴内泥泞不堪，但岩壁似乎由极为纯净的石料构成，你计划开采这些石料。',
        'Quarry Unlocked':'采石场已解锁',
        'The hexagonal rock formations are a tough terrain to conquer, it would be easier with more clones, you have some ideas how to improve your base.':'六边形岩层是一片难以攻克的险峻地形，拥有更多克隆体会让一切变得轻松许多，你已经有了一些完善基地的思路。',
        'Barracks Unlocked':'兵营已解锁',
        'Sawmill Unlocked':'锯木厂已解锁',
        'This swamp is impossible to get through, but there is a lot of wood here, maybe creating a path out of wood would help.':'这片沼泽根本无法通行，但这里木材资源丰富，或许用木材开辟一条道路会有所帮助。',
        'Smelter Unlocked': '熔炉已解锁',
        'Cutting through the thick plantlife is extremely difficult with your current set of tools, you decide to improve upon them.': '使用当前的这套工具砍穿茂密的植物极其困难，你决定对它们进行改进。',
        'Masonry Unlocked': '石匠屋已解锁',
        'The water has eroded the stones on the shore to such a degree that they seem unreal, you get inspired to improve your own stone processing.': '水流将岸边的石头侵蚀到了令人难以置信的程度，你受到启发，改进了自己的石材加工技术。',
        'Auto-Exploring Unlocked':'自动探索已解锁',
        'All these uncharted areas, countless relics and other hidden secrets take forever to explore. But your Clones could probably help you with that, even if they are not as efficient as yourself.':'所有这些未探索的区域、无数的遗迹以及其他隐藏的秘密，需要耗费无尽的时间去探索。但你的克隆体或许能在这方面帮助你，即使它们的效率不如你自己。',

        //Base 基地
        'Base':'基地',
        'Construct and upgrade structures to improve your base.': '建造并升级建筑来提升你的基地。',
        'Buildings': '建筑',
        'No effect yet':'还没有效果',
        'Effect:': '效果：',
        'MAXED':'已满级',
        'At level': '下个等级',
        'Cost:':'成本：',
        'Build time': '建造时间',
        'Building…': '正在建造中…',
        'remaining': '剩余用时',
        'Not enough Materials':'材料不足',
        'Auto Exploration enabled':'自动探索已启用',
        'Start building your base...':'开始建造你的基地...',
        'Atop a smooth hill, with a lot of space to build, you decide to set up your base of operations. Looking around, all you can see are the neverending dunes of Ash, this world is certainly difficult to explore, but constructing buildings will make it easier.':'在一座平缓的山丘顶上，有着充足的建造空间，你决定建立你的行动基地。环顾四周，你所能看到的只有无尽的灰烬沙丘，这个世界无疑很难探索，但建造建筑会使这一切变得容易些。',
        'Base Name':'基地名称',
        'Establish Base':'建立基地',
        'Change the name of your base and home area on the map.':'在地图上更改你的基地和家园区域的名称。',
        'Rename':'重新命名',

        'Fort': '堡垒',
        'Your headquarters, built amidst the Ash. It increases your capabilities to expand.': '你的总部，建于灰烬之中。它提升了你的扩张能力。',
        'Barracks': '兵营',
        'Trains your Clones more efficiently, reducing the Ash cost of creating new Clones.': '更高效地训练你的克隆体，降低创造新克隆体所需的灰烬成本。',
        'Watchtower':'瞭望塔',
        'A tall vantage point that improves scouting efficiency, reducing Travel time.':'一个高处的观察点，可提高侦察效率，缩短旅行时间。',
        'Wood Pile': '木材堆',
        'Neatly stacked collection of Wood for building, upgrading allows you to store more Wood.': '整齐堆放的建筑用木材，升级可让你储存更多木材。',
        'Forestry': '林场',
        'Harvest and replant trees to gather Wood.': '砍伐并重新种植树木以收集木材。',
        'Stone Depot': '石材仓库',
        'A sizable pile of Stone for construction, upgrading increases your Stone storage capacity.': '大量用于建筑的石材，升级可提升你的石材储存容量。',
        'Quarry': '采石场',
        'A suitable spot to gather Stone for construction.': '适合采集建筑用石材的地点。',
        'Metal Storage': '金属仓库',
        'Carefully organized section for Metal parts, upgrading increases your Metal storage capacity.': '精心整理的金属零件存放区，升级可提升你的金属储存容量。',
        'Ash Silo':'灰烬筒仓',
        'Store Ash and improve your Ash production by optimizing logistics.':'储存灰烬，并通过优化物流来提高灰烬产量。',
        'Mine': '矿井',
        'A narrow shaft leading into the Mountain that yields a lot of Metal ore': '通向山脉深处的狭窄竖井，出产大量金属矿石。',
        'Crystal Vault': '水晶仓库',
        'A secured area to store all your Crystals in.': '一个用于存放你所有水晶的安全区域。',
        'Crystal Mine': '水晶矿井',
        'Extract valuable crystals to enhance your resources and capabilities.': '开采珍贵的水晶以增强你的资源和能力。',
        'Treasury': '宝库',
        'Store your Runes and let Clones help collect more. Ensuring you always collect more Runes if you find some.': '存放你的符文，让克隆体帮忙收集更多。确保你在找到符文时总是能收集得更多。',
        'Training Grounds': '训练场',
        'Let your clones train more effectively, increasing the training speed.': '让你的克隆体更高效地训练，提升训练速度。',
        'Construction Workshop': '建造工坊',
        'Special tools, prepared materials and everything else you need to improve the speed of constructing buildings.': '特殊工具、预备材料以及提升建筑建造速度所需的一切。',
        'Outrider Post': '先遣哨所',
        'Your Clones assemble here to plan and execute expeditions to distant places. This enables auto exploration.': '你的克隆体在此集结，计划并执行前往遥远之地的探险。这将启用自动探索。',
        'Laboratory':'实验室',
        'Study and research new ways to improve your capabilities. Each level increases research speed.':'学习和研究提升能力的新方法。每一级都会提高研究速度。',
        'Sawmill':'锯木厂',
        'Metal saws, axes and sawblades can vastly accelerate your Wood production.':'金属锯、斧头和锯片能大幅加快你的木材生产。',
        'Masonry': '石匠屋',
        'Using advanced techniques you can shape Stone extremely efficiently and precisely with custom made chisel heads, cut from pure Crystal.': '使用先进的技术，你可以使用由纯水晶切割而成的定制凿头，极其高效且精准地加工石头。',
        'Smelter': '熔炉',
        'Using the best wood as fuel will allow you to create the purest and most durable Metal parts.': '使用最好的木材作为燃料，将使你能够制造出最纯净、最耐用的金属部件。',

        'Relics': '遗物',
        'Collecting items increases your knowledge and morale, boosting your efficiency.': '收集物品会增加你的知识和士气，从而提升你的效率。',
        'Completed Collections:': '已完成的收藏: ',
        'Completion bonus:': '完成奖励:',
        'collected': '已收集',
        'found': '已发现',
        'Maxed Relics:': '满级遗物: ',
        'Not yet discovered.':'尚未发现。',
        'Max all Relics in this set for a reward!':'将此收藏内的所有遗物升至满级即可获得奖励！',
        'Peculiar Remnants': '奇异残骸',
        'Strange bones and fragments found among the Ashen Fields.': '在灰烬平原中发现的奇怪骨骼与碎片。',
        'Gnarly Bone': '扭曲的骨头',
        '+5% Ash production': '+5% 灰烬产量',
        'Odd Skull': '古怪的头骨',
        '-1% Upgrade cost': '-1% 升级成本',
        'Sharpened Splinter': '锋利的骨片',
        '-1% Obliteration cost': '-1% 湮灭成本',
        'Gilded Collarbone': '镀金锁骨',
        '+1% Upgrade bonus levels': '+1% 升级加成等级',
        'Forest Curios': '森林奇物',
        'The Dead Forest bears a lot of curiosities, some worth studying.': '死亡森林孕育了许多奇物，其中一些值得研究。',
        'Ashen Leaf': '灰烬之叶',
        '+5% Perk Point speed': '+5% 技能点获取速度',
        'Crystalized Berry': '结晶浆果',
        '+1 Bonus level on all Trainings': '+1 所有训练奖励等级',
        'Petrified Twig': '石化树枝',
        '-2% Training time': '-2% 训练时间',
        'Obscure Objects': '神秘物品',
        'A handful of very strange trinkets from the Stone Wave Cliffs.': '一些来自石浪悬崖的非常奇怪的小饰品。',
        'Shiny Rock': '闪亮岩石',
        '-1% Travel time': '-1% 旅行时间',
        'Golden Ink Bottle': '金色墨水瓶',
        '+3% Runes found': '+3% 发现的符文',
        'Ancient Lamp': '古老提灯',
        '+2% Materials found': '+2% 发现的材料',
        'A collarbone wrapped in thin strips of tarnished gold leaf. Someone valued this once.': '一根包裹着暗淡金箔细条的锁骨。曾经有人很珍视它。',
        'A long sliver of bone ground to a fine point. Crude but effective.': '一根磨得极尖的长条碎骨。粗糙但有效。',
        'A perfectly preserved leaf, covered in a fine layer of Ash. How did it stay so intact?': '一片保存完好的树叶，表面覆盖着一层薄薄的灰烬。它是如何保持得如此完整的？',
        'A skull with too many cavities. Hard to tell what creature it belonged to.': '一个布满空洞的头骨。很难分辨它属于什么生物。',
        'A small, smooth rock that inspires hope, you kind of want to name it.': '一块小巧光滑的石头，能带来希望，你都有点想给它起个名字了。',
        'A twisted, warped bone of unknown origin. Still surprisingly sturdy.': '一根扭曲变形且来历不明的骨头。依然出奇地坚固。',
        'Nearly perfect straight and an arms length, this twig could almost be used as a weapon.': '几乎笔直且有一臂长，这根树枝简直可以当作武器。',
        'Perfectly round, glossy and hard like a gem, this berry is an odd find even in the Dead Forest.': '浑圆、光滑且坚如宝石，即使在死亡森林中，这颗浆果也是个奇特的发现。',
        'Though it\'s light faded, you can tell this lamp was masterfully crafted.': '尽管光芒已经黯淡，你仍能看出这盏灯的工艺极为精湛。',
        'Very old and completely empty, this small bottle with intricate golden patterns once contained an inky substance.': '十分古老且空空如也，这个带有复杂金色图案的小瓶子曾装过某种墨黑色的物质。',
        'River Trinkets': '河流饰品',
        'The River is full of oddities, but some are more interesting than others.': '河里充满了稀奇古怪的东西，但有些比其他的更有趣。',
        'Perfect Pebble': '完美鹅卵石',
        'Small yet a perfectly round pebble, polished to perfection by the river\'s flow.': '一颗虽小却十分圆润的鹅卵石，被河水打磨得完美无瑕。',
        '+10% Ash production per 1000 Clone': '每 1000 个克隆体 +10% 灰烬产量',
        'Rusty Ring': '生锈的戒指',
        'Barely holding together, this oxidized ring has seen better days, you wonder how it ended up in the river.': '几乎快要碎裂，这枚氧化的戒指也曾有过光辉岁月，你很好奇它是怎么落入河中的。',
        '-3% Clone cost': '-3%克隆体成本',
        'Fancy Feather': '华丽的羽毛',
        'This is no ordinary feather, whatever being this is from it must be both large and majestic, the colors are mesmerizing.': '这不是普通的羽毛，不管它来自什么生物，那个生物一定既庞大又威严，这色彩令人着迷。',
        '+1% Total clones': '+1%总克隆体',
        'Artifacts of the Old': '旧日遗物',
        'Scavenging in the Crumbling Ruins has unearthed some truly impressive items.': '在摇摇欲坠的废墟中拾荒，发掘出了一些真正令人惊叹的物品。',
        'Delicate Chisel': '精致的凿子',
        'Gorgeous designs are etched into this chisel, this was not a tool for precision and art.': '这把凿子上刻有华丽的图案，这不是一件为了精密与艺术而生的工具。',
        '-1% Building material cost': '-1% 建筑材料消耗',
        'Ornate Mold': '华丽的模具',
        'This piece of an old mold not just looks impressive, but it\'s precision is unmatched, no rough edges or imperfections anywhere.': '这件旧模具不仅看起来令人惊叹，而且其精度更是无与伦比，没有任何粗糙的边缘或瑕疵。',
        '+5% Resource production': '+5% 资源产量',
        'Forgotten Necklace': '被遗忘的项链',
        'Adorned with some sort of gem, this piece of jewelry is still in good shape and beautiful to behold.': '这件首饰上装饰着某种宝石，依然保存完好，美丽动人。',
        'Triskelion Key': '三螺旋钥匙',
        'A somewhat worn key with a triskelion symbol on the handle, it emanates an aura of importance.': '一把略显磨损的钥匙，手柄上带有三螺旋符号，散发着非凡的气息。',
        '+0.5% chance for extra relic drop': '+0.5% 额外遗物掉落几率',
        'Advanced Tools': '高级工具',
        'Various equipment that has been used in the Ice Mine in the past, examining them could improve your own.': '过去在冰矿中曾使用过的各种设备，研究它们可以改进你自己的设备。',
        'Old Axe': '旧斧头',
        'An Axe that was probably used for preparing wood for the beams and supports inside the mine.': '一把可能曾用于处理木材，以制作矿井内横梁和支撑物的斧头。',
        '+3% Wood production': '+3% 木材产量',
        'Broken Shovel': '破损的铲子',
        'If the blade was still attached to the handle, this would be a perfectly good shovel to unearth all kinds of things with.': '如果铲头还连在铲柄上，这会是一把用来挖掘各种东西的完美铲子。',
        '+3% Stone production': '+3% 石材产量',
        'Splintered Pickaxe': '碎裂的镐',
        'Some parts of the mountain must have brought this pickaxe to its end, very little remains of this once sturdy tool.': '大山的某些部分肯定让这把镐迎来了它的终结，这把曾经坚固的工具如今已所剩无几。',
        '+2% Metal production': '+2% 金属产量',
        'Crystal Shard': '水晶碎片',
        'This piece of a crystal seems to have been shaped in some way or form, like it was used to be embedded into something.': '这块水晶似乎被以某种方式或形态塑造过，就像曾经被用来镶嵌在某物中一样。',
        '+1% Crystal production': '+1% 水晶产量',
        'Mystical': '神秘',
        'A bunch of wonderous things found in the Borean Woodlands, each brimming with old magic.': '在北风林地发现的一堆奇妙物品，每一件都蕴含着古老的魔法。',
        'Quill of the Scribe': '抄写员的羽毛笔',
        'This old piece of writing equipment was used quite a lot, you can almost feel the weight of knowledge it helped put to paper.': '这件古老的书写工具曾被频繁使用，你几乎能感受到它所写下的知识的分量。',
        '-1% Research time': '-1% 研究时间',
        'Strange Tome': '奇异典籍',
        'No markings, no title, from the outside it just looks like a regular old book, but it contains vast amounts of arcane texts, most of it unintelligible, sadly.': '没有标记，没有书名，从外面看它只是一本普通的旧书，但里面却包含大量奥术文本，遗憾的是，其中大部分都无法理解。',
        '-1% Research cost': '-1% 研究成本',
        'Brass Scales': '黄铜天平',
        'One of the few remaining flasks that haven\'t been shattered or severely cracked. The liquid inside is long gone, but coloration indicates it wasn\'t just water.': '少数未被粉碎或严重开裂的烧瓶之一。里面的液体早已干涸，但残留的颜色表明它装的不仅仅是水。',
        '+2% Treasury effect': '+2% 宝库效果',
        'Coastal Loot':'海岸战利品',
        'A bunch of shiny treasure washed up on the Cursed Shore.':'一堆闪闪发光的宝藏被冲上了灰烬海岸。',
        '+2% Resource production': '+2% 资源产量',
        'Carpenter\'s Square': '木工角尺',
        'This must have been for measuring and precisely aligning construction materials. Not in perfect shape, but this could prove useful.': '这一定是用来测量和精确对齐建筑材料的。虽然状态不佳，但这可能会派上用场。',
        '-2% Building time': '-2% 建造时间',
        'Earthen Enigmas': '大地之谜',
        'A few very mysterious items found deep inside the Mud Caves.': '在泥土洞穴深处发现的一些非常神秘的物品。',
        'Spiral Root': '螺旋根',
        'A twisted root that looks like a helix, a prime example of how strange and interesting trees can be.': '一根状似螺旋的扭曲树根，完美展现了树木可以有多么奇特和有趣。',
        '+1 extra Wood': '+1 额外木材',
        'Glowing Mushroom': '发光蘑菇',
        'Bioluminescent fungi growing directly on a few rocks, the rocks must contain a lot of minerals to support this kind of growth.': '直接生长在一些岩石上的生物发光真菌，这些岩石必定含有大量矿物质，才能维持这种生长。',
        '+1 extra Stone': '+1 额外石头',
        'Triskelion Emblem': '三螺旋徽章',
        'A somewhat worn emblem with a triskelion symbol, it emanates an aura of importance.': '一枚带有三螺旋符号、略显磨损的徽章，散发出一种非同寻常的气息。',
        'Pearl': '珍珠',
        'A shiny, pitch black pearl, not sure how it ended up here on the shore. It serves as a good luck charm.': '一颗闪亮的漆黑珍珠，不知道它是怎么落在这片海岸上的。它可作为幸运符使用。',
        '+1 Extra Runes': '+1 额外符文',
        'New Rune Perk unlocked!':'新符文技能已解锁！',

        //Research 研究
        'Research':'研究',
        'Use the inert magical power of your Runes to study, experiment, and develop enhancements to your operations.': '利用符文的惰性魔力进行研究、实验，并开发对你运营的强化。',
        'Duration:': '研究用时：',
        'Researching:':'研究中：',
        'Researching…':'研究中……',
        'Start Research': '开始研究',
        'Cancel Research': '取消研究',
        'Not enough Runes. Need': '符文不足，需要',
        'Lv': '等级',
        's':'秒',
        'Cancel the current research first.':'请先取消当前的研究。',
        'research speed from Laboratory level': '来自实验室等级的研究速度 当前实验室等级：',
        'Structural Analysis of Ash': '灰烬的结构分析',
        'Research your most basic Resource to increase its production.': '研究你最基础的资源以提高其产量。',
        'Optimized Topology': '优化拓扑',
        'Experiment with different ways to arrange Ash more efficiently, reducing the cost of Upgrades.': '尝试以更高效的不同方式排列灰烬，从而降低升级成本。',
        'Production Acceleration': '生产加速',
        'Work on methods to increase the rate of production of your buildings.': '致力于寻找提高建筑生产率的方法。',
        'Local Surveying': '局部测绘',
        'Map out and catalog every point of interest and details of the terrain to reduce the time it takes to explore.': '绘制地图并记录每一个兴趣点及地形细节，以减少探索所需的时间。',
        'Construction Streamlining': '简化建造',
        'Parallelize workflows and carefully coordinate building projects to decrease the time it takes to finish construction.': '并行化工作流程并仔细协调建筑项目，以减少完成建造所需的时间。',
        'Rune Synthesis': '符文合成',
        'With enough Runes you can surely discover a way to create more, allowing you to passively produce them. The production rate is based on the highest amount of Runes you ever found.': '拥有足够的符文，你一定能发现创造更多符文的方法，让你能够被动地生产它们。生产速率取决于你曾发现过的符文最高数量。',

        //TIP 提醒
        'In Development!': '开发中！',
        'This feature is still very new, there might be bugs and balance issues.': '该功能还很新，可能存在 bug 和平衡性问题。',
        'If you feel like something is not working right, or balanced poorly, please report it on our': '如果您觉得有什么地方运行不正常，或者平衡性不佳，请反馈至我们的 ',
        'or Discord server (see below).': '或 Discord 服务器（见下文）。',
        'Thanks for your understanding and support!': '感谢您的理解与支持！',

        //Changelog 更新日志
        'NEW!':'最新！',
        'Changelog':'更新日志',
        'Added':'新增',
        'Changed':'更改',
        'Removed':'移除',
        'Fixed':'修复',

        //2026.4.1 更新日志
        'UNIQUE EVENTS ARE RESET! As some of these changelogs get quite long, I will start omitting some of the entries that are just smaller Tweaks and Adjustments without or little gameplay impact.': '特殊事件已重置！由于部分更新日志内容过长，我将开始省略一些仅为小幅优化与调整、对游戏玩法几乎没有影响的条目。',
        '3 new areas to explore': '新增 3 个可探索区域',
        '3 new buildings': '新增 3 座建筑',
        '2 new collections of Relics (4 total)': '新增 2 组圣物收藏（总计 4 组）',
        '3 new Researches': '新增 3 项研究',
        'Runes can now be gained offline with Auto Exploration on': '开启自动探索后，现在可离线获取符文',
        'Clone allocation amount can now be edited directly': '现在可直接编辑克隆体分配数量',
        'Unique events are now categorized separately in the event list': '特殊事件现已在事件列表中单独分类',
        'Increased Material production Research from +2% to +5% per level':'材料产量研究的每级加成从 +2% 提高至 +5%',
        'Increased Upgrade cost Research from -5% to -10% per level':'升级消耗研究的每级效果从 -5% 提高至 -10%',
        'Conway/Guy (Short) notation now works up to e300 instead of e99':'Conway/Guy（简短）记数法的上限现在从 e99 提高至 e300',
        'Short notation now uses PascalCase for units (e.g. QaVg instead of Qavg)':'短记数法的单位现在使用大驼峰命名法（PascalCase）（例如 QaVg 而非 Qavg）',
        'Increased Building production multiplier from +25% to +40% per level':'建筑产量倍率的每级加成从 +25% 提高至 +40%',
        'Increased effect of Barracks from -10% to -20% per level':'兵营效果的每级加成从 -10% 提高至 -20%',
        'Balanced most building costs and scalings':'平衡了大多数建筑的消耗与花费递增比例',
        'Hardcap for Exploration from 0.2s to 0.1s':'探索时间硬上线从 0.2 秒缩短至 0.1 秒',
        'Rebalanced all Relics':'重新平衡了所有遗物',
        'Triskelion Key and Forgotten Necklace have been moved to a different collection':'三曲枝钥匙和遗忘项链已移至另一个收藏集中',
        'Extra Unique event from Stone Wave Cliffs that was used for testing':'移除了石浪悬崖中原本用于测试的额外特殊事件',
        'Non-Unique events from save-game decreasing savegame size substantially':'存档中的非特殊事件已移除，大幅减小了存档文件体积',
        'Max All button not accounting for Research when checking available Upgrades':'检查可用升级时，“购买所有升级”按钮未将研究计算在内',
        'Upgrade cost description effect':'升级成本描述效果',
        'Exponent not showing in Standard and Short notation':'标准和简短计数法中未显示指数',
        'Upgrades not unlocking correctly after Obliteration':'湮灭后升级未正确解锁',
        'Some occasionas where the exact amount of materials are met but building remains unaffordable':'在某些情况下，即使刚好满足材料数量要求，建筑仍然显示材料不足',

        //2026.4.6 更新日志
        'Last content patch before v0.5! WARNING: Auto exploration has to be unlocked again, just explore a bit!':'v0.5 之前的最后一个内容补丁！警告：必须重新解锁自动探索，只需稍微探索一下即可！',
        '4 new Rune Perks':'4个新符文技能',
        'Highlighting when a collection is completed':'收集完成时高亮显示',
        'Toggle for auto cloning':'自动创造克隆体开关',
        'Map can now be panned':'现在可以拖动地图',
        'More statistics':'更多统计数据',
        'You can name your base now':'现在可以为你的基地命名了',
        'Decreased effect of Carpenter\'s Square from 2% to 0.5%':'木工角尺的效果从 2% 降低至 0.5%',
        'Decreased Construction Streamlining Research from 5% to 2.5% per level':'建筑精简研究的效果从每级 5% 降低至 2.5%',
        'Upgrades are now unlocked more evenly each Obliteration':'每次湮灭后升级的解锁现在更加均匀',
        'Rune Synthesis Research now works differently':'符文合成研究现在的运作方式有所不同',
        'Decrease effect of Perfect Pebble from 0.1% to 0.01%':'完美鹅卵石的效果从 0.1% 降低至 0.01%',
        'Perfect Pebble effect scales additively now':'完美鹅卵石的效果现在按加法叠加',
        'Decreased cost/scaling for some buildings':'降低了部分建筑的成本/成本递增率',
        'Auto Exploration is now unlocked far earlier':'自动探索现在的解锁时间大大提前',
        'Outrider Post effect now starts at level 1 not 2':'先遣哨所的效果现在从 1 级而不是 2 级开始',
        'Increased Pearl effect from 1 to 2':'珍珠效果从 1 增加至 2',
        'Pearl effect is now applied before Golden Ink Bottle':'珍珠效果现在在金色墨水瓶之前应用',
        'Rebalanced early game progression':'重新平衡了游戏前期的进度',
        'Cursed Shore being named Ashen Shore in the map':'地图中“诅咒海岸”被命名为“灰烬海岸”的问题',
        'Rune Perks refundable (they shouldn\'t be)':'符文技能可返还的问题（它们本不应可返还）',
        'Cursed shore description':'诅咒海岸的描述问题',
        'Description for the unique event in Lush Valley':'繁茂山谷中独特事件的描述问题',
        'Relic effect value rounding':'遗物效果数值的四舍五入问题',
        'Crystal Storage Lv2 not buyable':'水晶仓库Lv2无法购买的问题',
        'Minor UI issues on smaller screens':'较小屏幕上的轻微UI问题',
        'New areas falsely showing as completed':'新区域错误显示为已完成的问题',
        'Unique event order resetting on reload':'重新加载时独特事件顺序重置的问题',

        // 过滤不需要汉化的文本
        'I': 'I',
        'II': 'I',
        'III': 'III',
        'IV': 'IV',
        'V': 'V',
        'VI': 'VI',
        'VII': 'VII',
        'VIII': 'VIII',
        'X': 'X',
        'XI': 'XI',
        'XII': 'XII',
        'XIII': 'XIII',
        'XIV': 'XIV',
        'XV': 'XV',
        'XVI': 'XVI',
        'A': 'A',
        'B': 'B',
        'C': 'C',
        'D': 'D',
        'E': 'E',
        'F': 'F',
        'G': 'G',
        'H': 'H',
        'I': 'I',
        'J': 'J',
        'K': 'K',
        'L': 'L',
        'M': 'M',
        'N': 'N',
        'O': 'O',
        'P': 'P',
        'Q': 'Q',
        'R': 'R',
        'S': 'S',
        'T': 'T',
        'U': 'U',
        'V': 'V',
        'W': 'W',
        'X': 'X',
        'Y': 'Y',
        'Z': 'Z',
        '': '',
        '': '',
        '': '',
        '': '',
        '': '',
        '': '',
    };

    //需处理的前缀，此处可以截取语句开头部分的内容进行汉化
    const cnPrefix = {
        "\n": "\n",
        "                   ": "",
        "                  ": "",
        "                 ": "",
        "                ": "",
        "               ": "",
        "              ": "",
        "             ": "",
        "            ": "",
        "           ": "",
        "          ": "",
        "         ": "",
        "        ": "",
        "       ": "",
        "      ": "",
        "     ": "",
        "    ": "",
        "   ": "",
        "  ": " ",
        " ": " ",
        //树游戏
        "\t\t\t": "\t\t\t",
        "\n\n\t\t": "\n\n\t\t",
        "\n\t\t": "\n\t\t",
        "\t": "\t",
        "Show Milestones: ": "显示里程碑：",
        "Autosave: ": "自动保存: ",
        "Offline Prod: ": "离线生产: ",
        "Completed Challenges: ": "完成的挑战: ",
        "High-Quality Tree: ": "高质量树贴图: ",
        "Offline Time: ": "离线时间: ",
        "Theme: ": "主题: ",
        "Anti-Epilepsy Mode: ": "抗癫痫模式：",
        "In-line Exponent: ": "直列指数：",
        "Single-Tab Mode: ": "单标签模式：",
        "Time Played: ": "已玩时长：",
        "Shift-Click to Toggle Tooltips: ": "Shift-单击以切换工具提示：",
        "Level:": "等级:",
        'OBLITERATE':'湮灭',
        'FORM BODY':'重塑肉身',
        "REQ:": "需求:",
        "": "",
        "": "",
        "": "",
        "": "",
        "": "",
    };

    //需处理的后缀，此处可以截取语句结尾部分的内容进行汉化
    //例如：13 Coin、14 Coin、15 Coin... 这种有相同结尾的语句
    //可以在这里汉化结尾：" Coin":" 金币"
    const cnPostfix = {
        "                   ": "",
        "                  ": "",
        "                 ": "",
        "                ": "",
        "               ": "",
        "              ": "",
        "             ": "",
        "            ": "",
        "           ": "",
        "          ": "",
        "         ": "",
        "        ": "",
        "       ": "",
        "      ": "",
        "     ": "",
        "    ": "",
        "   ": "",
        "  ": "  ",
        " ": " ",
        "\n": "\n",
        "\n\t\t\t": "\n\t\t\t",
        "\t\t\n\t\t": "\t\t\n\t\t",
        "\t\t\t\t": "\t\t\t\t",
        "\n\t\t": "\n\t\t",
        "\t": "\t",
        'ASH': '灰烬',
        "CLONES": "克隆体",
        "LV": "等级",
        "XP": "经验",
    };

    //需排除的，正则匹配
    const cnExcludeWhole = [
        /^(\d+)$/, /^\s*$/, /^([\d\.]+):([\d\.]+)$/, /^([\d\.]+):([\d\.]+):([\d\.]+)$/,
        /^([\d\.]+):([\d\.]+):([\d\.]+):([\d\.]+):([\d\.]+)$/, /^([\d\.]+)h ([\d\.]+)m ([\d\.]+)s$/,
        /^([\d\.]+)y ([\d\.]+)d ([\d\.]+)h$/, /^([\d\.]+)\-([\d\.]+)\-([\d\.]+)$/,
        /^([\d\.]+)e(\d+)$/, /^([\d\.]+)$/, /^\(([\d\.]+)\)$/, /^([\d\.]+)\%$/,
        /^([\d\.]+)\/([\d\.]+)$/, /^\(([\d\.]+)\/([\d\.]+)\)$/, /^成本(.+)$/,
        /^\(([\d\.]+)\%\)$/, /^([\d\.]+)K$/, /^([\d\.]+)M$/, /^([\d\.]+)B$/,
        /^([\d\.]+) K$/, /^([\d\.]+) M$/, /^([\d\.]+) B$/, /^([\d\.]+)s$/,
        /^([\d\.]+)x$/, /^x([\d\.]+)$/, /^([\d\.,]+)$/, /^\+([\d\.,]+)$/,
        /^\-([\d\.,]+)$/, /^([\d\.,]+)x$/, /^x([\d\.,]+)$/, /^([\d\.,]+) \/ ([\d\.,]+)$/,
        /^([\d\.]+)e([\d\.,]+)$/, /^([\d\.,]+)\/([\d\.]+)e([\d\.,]+)$/,
        /^([\d\.]+)e([\d\.,]+)\/([\d\.]+)e([\d\.,]+)$/, /^([\d\.]+)e\+([\d\.,]+)$/,
        /^e([\d\.]+)e([\d\.,]+)$/, /^x([\d\.]+)e([\d\.,]+)$/, /^([\d\.]+)e([\d\.,]+)x$/,
        /^[\u4E00-\u9FA5]+$/
    ];

    const cnExcludePostfix = [];

    //正则替换，带数字的固定格式句子
    //纯数字：(\d+)
    //逗号：([\d\.,]+)
    //小数点：([\d\.]+)
    //原样输出的字段：(.+)
    //换行加空格：\n(.+)
    const cnRegReplace = new Map([
        [/^Level ([+\-\d\.,%]+)$/, '等级 $1'],
        [/^([+\-\d\.,%]+) stone$/, '$1 石材'],
        [/^([+\-\d\.,%]+) metal$/, '$1 金属'],
        [/^([+\-\d\.,%]+) crystal$/, '$1 水晶'],
        [/^([+\-\d\.,%]+) wood$/, '$1 木材'],
        [/^Lv([+\-\d\.,%]+)$/,'等级$1'],
        [/^Building Maxlevel: ([+\-\d\.,%]+)$/, '建筑最高等级：$1'],
        [/^Upgrade to level ([+\-\d\.,%]+)$/, '升级至等级 $1'],
        [/^([+\-\d\.,%]+) Cloning cost$/, '$1 克隆体成本'],
        [/^([+\-\d\.,%]+) Training speed$/, '$1 训练速度'],
        [/^([+\-\d\.,%]+) Construction time$/, '$1 建造时间'],
        [/^([+\-\d\.,%]+) dropped Runes$/, '$1 掉落的符文'],
        [/^([+\-\d\.,%]+) Exploration time$/, '$1 探索时间'],
        [/^([+\-\d\.,%]+) Research speed$/, '$1 研究速度'],
        [/^Max Wood: ([+\-\d\.,%]+)$/, '最大木材： $1'],
        [/^Max Stone: ([+\-\d\.,%]+)$/, '最大石材： $1'],
        [/^Max Metal: ([+\-\d\.,%]+)$/, '最大金属： $1'],
        [/^Max Crystals: ([+\-\d\.,%]+)$/, '最大水晶： $1'],
        [/^([+\-\d\.,%]+)\/s Wood$/, '$1/秒 木材'],
        [/^([+\-\d\.,%]+)\/s Stone$/, '$1/秒 石材'],
        [/^([+\-\d\.,%]+)\/s Metal$/, '$1/秒 金属'],
        [/^([+\-\d\.,%]+)\/s Crystal$/, '$1/秒 水晶'],
        [/^Exploring takes ([+\-\d\.,%]+) seconds$/, '探索耗时 $1 秒'],
        [/^Exploring takes ([+\-\d\.,%]+) seconds \(([+\-\d\.,%]+)x longer\)$/, '探索耗时 $1 秒 (耗时增加 $2x)'],
        [/^Lv ([+\-\d\.,%]+)$/, '等级 $1'],

        [/^([+\-\d\.,%]+) Ash production$/, '$1 灰烬产量'],
        [/^([+\-\d\.,%]+) Upgrade cost$/, '$1 升级成本'],
        [/^([+\-\d\.,%]+) Obliteration cost$/, '$1 湮灭成本'],
        [/^([+\-\d\.,%]+) Upgrade bonus levels$/, '$1 升级加成等级'],
        [/^([+\-\d\.,%]+) Perk Point speed$/, '$1 技能点获取速度'],
        [/^([+\-\d\.,%]+) Bonus level on all Trainings$/, '$1 所有训练奖励等级'],
        [/^([+\-\d\.,%]+) Travel time$/, '$1 训练时间'],
        [/^([+\-\d\.,%]+) Training time$/, '$1 旅行时间'],
        [/^([+\-\d\.,%]+) Runes found$/, '$1 发现的符文'],
        [/^([+\-\d\.,%]+) Materials found$/, '$1 发现的材料'],
        [/^([+\-\d\.,%]+) Ash production per 1000 Clones$/, '每 1000 个克隆体 $1 灰烬产量'],
        [/^([+\-\d\.,%]+) Clone cost$/, '$1 克隆体成本'],
        [/^([+\-\d\.,%]+) Total clones$/, '$1 总克隆体'],
        [/^([+\-\d\.,%]+) Building material cost$/, '$1 建筑材料消耗'],
        [/^([+\-\d\.,%]+) extra relic chance$/, '$1 遗物掉落几率'],
        [/^([+\-\d\.,%]+) Wood production$/, '$1 木材产量'],
        [/^([+\-\d\.,%]+) Stone production$/, '$1 石材产量'],
        [/^([+\-\d\.,%]+) Metal production$/, '$1 金属产量'],
        [/^([+\-\d\.,%]+) Crystal production$/, '$1 水晶产量'],
        [/^([+\-\d\.,%]+) Resource production$/, '$1 资源产量'],
        [/^([+\-\d\.,%]+) Rune production$/, '$1 符文产量'],
        [/^([+\-\d\.,%]+) Research time$/, '$1 研究时间'],
        [/^([+\-\d\.,%]+) Research cost$/, '$1 研究成本'],
        [/^([+\-\d\.,%]+) Treasury effect$/, '$1 宝库效果'],
        [/^([+\-\d\.,%]+) Building time$/, '$1 建造时间'],
        [/^([+\-\d\.,%]+) extra Wood found$/, '额外找到 $1 个木材'],
        [/^([+\-\d\.,%]+) extra Stone found$/, '额外找到 $1 个石头'],
        [/^([+\-\d\.,%]+) extra Runes found$/, '额外找到 $1 个符文'],
        [/^([+\-\d\.,%]+) Material production from Buildings$/, '$1 材料产量提升'],
        [/^([+\-\d\.,%]+) Building construction time$/, '$1 建筑建造时间'],
        [/^([+\-\d\.,%]+) of Treasury bonus per second$/, '$1 每秒宝库收益加成'],
        [/^([+\-\d\.,%]+) minutes ago$/, '$1 分钟前'],
        [/^([+\-\d\.,%]+) hours ago$/, '$1 小时前'],
        [/^([+\-\d\.,%]+) hour ago$/, '$1 小时前'],
        [/^([+\-\d\.,%]+) day ago$/, '$1 天前'],
        [/^([+\-\d\.,%]+) days ago$/, '$1 天前'],

        [/^Stone Depot completed \(Level (\d+)\)$/, '石材仓库已建造完成 （等级 $1）'],
        [/^Metal Storage completed \(Level (\d+)\)$/, '金属仓库已建造完成 （等级 $1）'],
        [/^Wood Pile completed \(Level (\d+)\)$/, '木材堆已建造完成 （等级 $1）'],
        [/^Fort completed \(Level (\d+)\)$/, '堡垒已建造完成 （等级 $1）'],
        [/^Barracks completed \(Level (\d+)\)$/, '兵营已建造完成 （等级 $1）'],
        [/^Watchtower completed \(Level (\d+)\)$/, '瞭望塔已建造完成 （等级 $1）'],
        [/^Forestry completed \(Level (\d+)\)$/, '林场已建造完成 （等级 $1）'],
        [/^Quarry completed \(Level (\d+)\)$/, '采石场已建造完成 （等级 $1）'],
        [/^Ash Silo completed \(Level (\d+)\)$/, '灰烬筒仓已建造完成 （等级 $1）'],
        [/^Mine completed \(Level (\d+)\)$/, '矿井已建造完成 （等级 $1）'],
        [/^Crystal Vault completed \(Level (\d+)\)$/, '水晶仓库已建造完成 （等级 $1）'],
        [/^Crystal Mine completed \(Level (\d+)\)$/, '水晶矿井已建造完成 （等级 $1）'],
        [/^Treasury completed \(Level (\d+)\)$/, '宝库已建造完成 （等级 $1）'],
        [/^Training Grounds completed \(Level (\d+)\)$/, '训练场已建造完成 （等级 $1）'],
        [/^Construction Workshop completed \(Level (\d+)\)$/, '建造工坊已建造完成 （等级 $1）'],
        [/^Outrider Post completed \(Level (\d+)\)$/, '先遣哨所已建造完成 （等级 $1）'],
        [/^Laboratory completed \(Level (\d+)\)$/, '实验室已建造完成 （等级 $1）'],
        [/^Sawmill completed \(Level (\d+)\)$/, '锯木厂已建造完成 （等级 $1）'],
        [/^Masonry completed \(Level (\d+)\)$/, '石匠屋已建造完成 （等级 $1）'],
        [/^Smelter completed \(Level (\d+)\)$/, '熔炉已建造完成 （等级 $1）'],

        [/^([+\-\d\.,%]+) per level multiplicatively$/, '每级 $1（乘法叠加）'],
        [/^([+\-\d\.,%]+) per level additively$/, '每级加算 $1'],
        [/^Research complete: Structural Analysis of Ash \(Level (\d+)\)$/, '研究完成：灰烬的结构分析 （等级 $1）'],
        [/^Research complete: Optimized Topology \(Level (\d+)\)$/, '研究完成：优化拓扑 （等级 $1）'],
        [/^Research complete: Production Acceleration \(Level (\d+)\)$/, '研究完成：生产加速 （等级 $1）'],
        [/^Research complete: Local Surveying \(Level (\d+)\)$/, '研究完成：局部测绘 （等级 $1）'],
        [/^Research complete: Construction Streamlining \(Level (\d+)\)$/, '研究完成：简化建造 （等级 $1）'],
        [/^Research complete: Rune Synthesis \(Level (\d+)\)$/, '研究完成：符文合成 （等级 $1）'],

        [/^\s*([+\-\d\.,%]+)d\s+([+\-\d\.,%]+)h\s+([+\-\d\.,%]+)m\s+([+\-\d\.,%]+)s\s*$/, '$1天 $2时 $3分 $4秒'],
        [/^\s*([+\-\d\.,%]+)h\s+([+\-\d\.,%]+)m\s+([+\-\d\.,%]+)s\s*$/, '$1时 $2分 $3秒'],
        [/^\s*([+\-\d\.,%]+)m\s+([+\-\d\.,%]+)s\s*$/, '$1分 $2秒'],
        [/^\s*([+\-\d\.,%]+)s\s*$/, '$1秒'],
    ]);

    // ================= 核心翻译逻辑 =================
    function cnItemByTag(text, itemgroup, node, textori){
        for (let i in itemgroup){
            if (i[0] == '.') {
                let current_node = node;
                while (current_node){
                    if ( current_node.classList && current_node.classList.contains(i.substr(1)) ) return itemgroup[i];
                    else if( current_node.parentElement && current_node.parentElement != document.documentElement ) current_node = current_node.parentElement;
                    else break;
                }
            }
            else if (i[0] == '#'){
                let current_node = node;
                while (current_node){
                    if ( current_node.id == i.substr(1) ) return itemgroup[i];
                    else if( current_node.parentElement && current_node.parentElement != document.documentElement ) current_node = current_node.parentElement;
                    else break;
                }
            }
            else if (i[0] == '$'){
                if (document.querySelector(i.substr(1)) != null) return itemgroup[i];
            }
            else if (i[0] == '*'){
                if ( textori.includes(i.substr(1)) ) return itemgroup[i];
            }
        }
        return null;
    }

    function cnItem(text, node) {
        if (typeof (text) != "string") return text;
        let textori = text;

        let text_prefix = "";
        for (let prefix in cnPrefix) {
            if (text.startsWith(prefix)) {
                text_prefix += cnPrefix[prefix];
                text = text.substr(prefix.length);
            }
        }

        let text_postfix = "";
        for (let postfix in cnPostfix) {
            if (text.endsWith(postfix)) {
                text_postfix = cnPostfix[postfix] + text_postfix;
                text = text.substr(0, text.length - postfix.length);
            }
        }

        let text_reg_exclude_postfix = "";
        for (let reg of cnExcludePostfix) {
            let result = text.match(reg);
            if (result) {
                text_reg_exclude_postfix = result[0] + text_reg_exclude_postfix;
                text = text.substr(0, text.length - result[0].length);
            }
        }

        for (let reg of cnExcludeWhole) {
            if (reg.test(text)) return text_prefix + text + text_reg_exclude_postfix + text_postfix;
        }

        for (let [key, value] of cnRegReplace.entries()) {
            if (key.test(text)) return text_prefix + text.replace(key, value) + text_reg_exclude_postfix + text_postfix;
        }

        for (let i in cnItems) {
            if (typeof(cnItems[i]) == "string" && (text == i || text == cnItems[i])){
                return text_prefix + cnItems[i] + text_reg_exclude_postfix + text_postfix;
            } else if ( typeof(cnItems[i]) == "object" && text == i ){
                let result = cnItemByTag(i, cnItems[i], node, textori);
                if (result != null) return text_prefix + result + text_reg_exclude_postfix + text_postfix;
            }
        }

        // 移除了原版收集生词的逻辑，直接返回原词，提升性能
        return text_prefix + text + text_reg_exclude_postfix + text_postfix;
    }

    // 采用 TreeWalker 替代原版递归，极大提升性能
    function translateNode(rootNode) {
        let walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, null, false);
        let textNode;
        let tasks = [];
        while (textNode = walker.nextNode()) {
            let parent = textNode.parentNode;
            if (parent && (parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE' || parent.nodeName === 'TEXTAREA')) continue;

            let originalText = textNode.nodeValue;
            let translatedText = cnItem(originalText, textNode);
            if (originalText !== translatedText) {
                tasks.push({ node: textNode, text: translatedText });
            }
        }
        // 统一修改 DOM，避免边遍历边修改造成的重绘卡顿
        for (let task of tasks) {
            task.node.nodeValue = task.text;
        }
    }

    // ================= 启动与监听 =================
    console.log("加载汉化模块...");
    translateNode(document.body);

    const observer = new MutationObserver(function (mutations) {
        let tasks = [];
        for (let mutation of mutations) {
            if (mutation.type === 'childList') {
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        let originalText = node.nodeValue;
                        let translatedText = cnItem(originalText, node);
                        if (originalText !== translatedText) tasks.push({ node: node, text: translatedText });
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.nodeName !== "SCRIPT" && node.nodeName !== "STYLE" && node.nodeName !== "TEXTAREA") {
                            translateNode(node);
                        }
                    }
                }
            } else if (mutation.type === 'characterData') {
                let originalText = mutation.target.nodeValue;
                let translatedText = cnItem(originalText, mutation.target);
                if (originalText !== translatedText) tasks.push({ node: mutation.target, text: translatedText });
            }
        }
        for (let task of tasks) {
            task.node.nodeValue = task.text;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

})();
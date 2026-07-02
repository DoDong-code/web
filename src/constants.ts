export interface Project {
  id: string;
  titleEn: string;
  titleZh: string;
  category: 'UI Motion' | 'UI' | '3D Motion' | 'Visual';
  image: string;
  year: string;
  descEn: string;
  descZh: string;
  detailImages: string[];
  video?: string;
}

const MOCK_DETAIL_IMAGES_1 = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
];

const MOCK_DETAIL_IMAGES_2 = [
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1200&auto=format&fit=crop',
];

const MOCK_DETAIL_IMAGES_3 = [
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
];

export const PROJECTS: Project[] = [
  {
    id: '1',
    titleEn: 'DuoDuo Video - Lunar New Year Short Drama Invite',
    titleZh: '多多视频 - 新年短剧拉人红包',
    category: 'UI Motion',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1000&auto=format&fit=crop',
    year: '2024',
    descEn: 'Designed and implemented growth-loop motion mechanics for Lunar New Year short drama invitations. Reached +125% UV entry rate and +260% watch time duration through delightful and fluid dynamic reward feedback.',
    descZh: '负责新年短剧拉人红包玩法、节点奖励和即时奖励策略的动效设计。通过清晰灵动的动态表现引导，助力活动进入UV提升125%，短剧观看时长提升260%。',
    detailImages: MOCK_DETAIL_IMAGES_1,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-liquid-3444-large.mp4'
  },
  {
    id: '2',
    titleEn: 'UI Motion Design System & Spec Refining',
    titleZh: 'UI 动效设计规范与参数提炼体系',
    category: 'UI Motion',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    year: '2024',
    descEn: 'Established modular motion guidelines by extracting reusable animation parameters (popup, toast, exit animations, interactive buttons). Streamlined delivery using Bodymovin, BX-AE2CSS, and Lego formats to optimize load time and render performance.',
    descZh: '提炼出一套高复用性的动态微交互组件规范（如弹窗/toast、退场、活动红包按钮、高亮按钮等）。通过参数提炼配合BX-AE2CSS、Bodymovin等开发组件工具，确保视觉还原与包体性能最优化。',
    detailImages: MOCK_DETAIL_IMAGES_2,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-of-a-swimming-pool-4694-large.mp4'
  },
  {
    id: '3',
    titleEn: 'Temu Growth UI Design & Social Virality',
    titleZh: 'Temu 裂变增长游戏化与兑换链路',
    category: 'UI',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
    year: '2024',
    descEn: 'Engineered growth-focused user experience designs for international viral referral games, optimizing across different regulatory regions. Designed user emotion mapping from entry attraction to micro-successes, driving significant growth in activation and GMV.',
    descZh: '针对多国合规场景，深度研发多版本社交裂变游戏与兑换流程。科学布局用户决策漏斗，贯穿“引流-对比-犹豫-初次成功-循环-终极冲刺”的用户心理曲线，大幅提升分享激活率与订单GMV。',
    detailImages: MOCK_DETAIL_IMAGES_3,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-white-clouds-in-a-blue-sky-2311-large.mp4'
  },
  {
    id: '4',
    titleEn: 'Speed Quiz Challenge Gamification',
    titleZh: '限时答题挑战赢免单游戏化设计',
    category: 'UI',
    image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=1000&auto=format&fit=crop',
    year: '2024',
    descEn: 'A high-retention 30-second countdown quiz gameplay. Incorporated rich spatial visual feedback, continuous count-downs, and instant reward celebration overlays to trigger psychological commitment, successfully maximizing order conversion rates.',
    descZh: '限时30秒极速免单答题玩法设计。通过倒计时常驻渲染紧张氛围、礼物落下装车等即时反馈强化心智，设计沉默成本锁定流程，大幅降低用户流失，拉升大促主链路转化率。',
    detailImages: MOCK_DETAIL_IMAGES_1,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-out-of-focus-2314-large.mp4'
  },
  {
    id: '5',
    titleEn: 'Year of the Dragon Gift - Golden Carp Gate',
    titleZh: '龙年限定 3D 礼物 - 鲤鱼跃龙门',
    category: '3D Motion',
    image: 'https://ais-dev-ftzcxlcebkmcjvdvmfztrw-466561077391.us-east1.run.app/api/attachments/466561077391_ais-dev-ftzcxlcebkmcjvdvmfztrw_1742384193498_image.png',
    year: '2024',
    descEn: 'Created a flagship Year of the Dragon 3D broadcast gift featuring hand-crafted cartoon models and expressive bone bindings for fins and whiskers. Set inside an imperial gold-and-turquoise palace environment with fluid wave animations, producing a massive visual splash.',
    descZh: '围绕龙年国潮文化，打造重磅级3D直播礼物。运用卡通3D建模与骨骼绑定精细控制鱼鳍与胡须摆动，场景结合红黄青经典配色以及青山绿水古风元素，构建出极具冲击力的视觉效果。',
    detailImages: MOCK_DETAIL_IMAGES_2,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-curvy-lines-of-light-on-a-black-background-3446-large.mp4'
  },
  {
    id: '6',
    titleEn: 'Holiday Celebration - Good Fortune Persimmon',
    titleZh: '节日祈愿 3D 礼物 - 柿柿如意与新年烟花',
    category: '3D Motion',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop',
    year: '2023',
    descEn: 'Delivered interactive celebration gifts. Combines real 3D assets with advanced AE particle systems (shattered golden ribbons, physical dynamic sparks) to evoke a joyful, tactile festive ambiance.',
    descZh: '专为节日大促设计的互动特效礼物。结合3D水果角色与高级AE粒子图层叠合，模拟真实华丽烟花绽放与柿子炸裂的金粉彩带飘落，创造出浓厚且精致的沉浸式节日庆典氛围。',
    detailImages: MOCK_DETAIL_IMAGES_3,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-ink-swirling-in-water-3447-large.mp4'
  },
  {
    id: '7',
    titleEn: 'H5 Dynamic Viral Visual System',
    titleZh: 'H5 增长视觉首屏与运营设计体系',
    category: 'Visual',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=1000&auto=format&fit=crop',
    year: '2023',
    descEn: 'Standardized highly engaging visual themes for holiday promotions, super vouchers, and mini-games. Designed high-contrast typographic layouts and dynamic button animations that maximize CTR and overall promotional traffic.',
    descZh: '针对大促营销、春节红包、百元神券等运营活动建立高转化率的H5视觉规范。通过立体化字形设计、亮色调背景组合与高反差点击按钮，精准激发好奇心，提升运营页面整体点击率。',
    detailImages: MOCK_DETAIL_IMAGES_1,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-flowing-liquid-3444-large.mp4'
  },
  {
    id: '8',
    titleEn: 'Live Stream Broadcast Header Templates',
    titleZh: '商家直播间头图与秒杀信息指引规范',
    category: 'Visual',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
    year: '2023',
    descEn: 'Standardized visual hierarchy for merchant live broadcast channels. Designed prominent behavioral cues ("Flash Sale", "Compensation Guarantee") with structured badge overlays to increase live stream dwell times and immediate buy actions.',
    descZh: '为千万级商户直播间定制规范化的顶端信息头图视觉框架。精心打磨“特价秒杀”、“坏了包赔”、“今日新品”等核心利益点的艺术字与辅助框，提供强烈视觉暗示，提升观众停留率及下单率。',
    detailImages: MOCK_DETAIL_IMAGES_2,
    video: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-of-a-swimming-pool-4694-large.mp4'
  }
];

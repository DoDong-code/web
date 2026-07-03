import { ArrowLeft, ArrowRight, Mail, MapPin, Menu, MessageCircle, Phone, Sparkles, Wand2, Layers3, Workflow, BadgeCheck, CircleDot, LayoutGrid, Monitor, Box, Cpu, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const navItems = [
  { label: '首页', href: '#top' },
  { label: '经历', href: '#about' },
  { label: '项目', href: '#work' },
  { label: '优势', href: '#strengths' },
];

const stats = [
  { value: '8+', label: '年互联网设计经验' },
  { value: '2017-2026', label: 'MG动画 / 3D / 动效 / UI / AI辅助' },
  { value: '10倍+', label: '直播间流水增长' },
  { value: 'A', label: '盲盒玩法GMV / 激活暴增' },
];

const project1DetailImages = [
  '/portfolio/project1-detail/board-22.png',
  '/portfolio/project1-detail/board-23.png',
  '/portfolio/project1-detail/board-24.png',
  '/portfolio/project1-detail/board-25.png',
  '/portfolio/project1-detail/board-26.png',
  '/portfolio/project1-detail/board-27.png',
  '/portfolio/project1-detail/board-28.png',
  '/portfolio/project1-detail/board-28.gif',
  '/portfolio/project1-detail/board-28-1.jpg',
  '/portfolio/project1-detail/board-29.png',
  '/portfolio/project1-detail/item-003.jpg',
  '/portfolio/project1-detail/duo-2.gif',
  '/portfolio/project1-detail/duo-3.gif',
  '/portfolio/project1-detail/duo-4.gif',
  '/portfolio/project1-detail/duo-5.gif',
  '/portfolio/project1-detail/duo-6.gif',
  '/portfolio/project1-detail/item-004.jpg',
  '/portfolio/project1-detail/item-004.gif',
  '/portfolio/project1-detail/item-005.jpg',
  '/portfolio/project1-detail/item-005.gif',
  '/portfolio/project1-detail/item-006.jpg',
  '/portfolio/project1-detail/item-007.jpg',
  '/portfolio/project1-detail/item-007.gif',
  '/portfolio/project1-detail/item-008.jpg',
  '/portfolio/project1-detail/item-009.jpg',
  '/portfolio/project1-detail/item-009.gif',
  '/portfolio/project1-detail/item-010.jpg',
  '/portfolio/project1-detail/item-011.jpg',
  '/portfolio/project1-detail/item-012.jpg',
  '/portfolio/project1-detail/item-013.jpg',
  '/portfolio/project1-detail/item-013.gif',
  '/portfolio/project1-detail/item-014.jpg',
  '/portfolio/project1-detail/item-014.gif',
  '/portfolio/project1-detail/item-016.jpg',
  '/portfolio/project1-detail/item-017.jpg',
  '/portfolio/project1-detail/item-017.gif',
  '/portfolio/project1-detail/item-018.jpg',
  '/portfolio/project1-detail/item-019.jpg',
  '/portfolio/project1-detail/item-019.gif',
  '/portfolio/project1-detail/item-020.jpg',
  '/portfolio/project1-detail/item-020.gif',
  '/portfolio/project1-detail/item-021.jpg',
  '/portfolio/project1-detail/duo-1.gif',
];

const project2DetailImages = [
  '/portfolio/project2-detail/board-3.png',
  '/portfolio/project2-detail/board-4.png',
  '/portfolio/project2-detail/board-5.png',
  '/portfolio/project2-detail/board-6.png',
  '/portfolio/project2-detail/board-7.png',
];

const project3DetailImages = [
  '/portfolio/project3-detail/board-8.png',
  '/portfolio/project3-detail/board-9.png',
  '/portfolio/project3-detail/board-10.png',
  '/portfolio/project3-detail/board-11.png',
  '/portfolio/project3-detail/board-12.png',
  '/portfolio/project3-detail/board-13.png',
  '/portfolio/project3-detail/board-14.png',
  '/portfolio/project3-detail/board-15.png',
  '/portfolio/project3-detail/board-16.png',
  '/portfolio/project3-detail/board-17.png',
  '/portfolio/project3-detail/board-18.png',
];

const project4DetailImages = [
  '/portfolio/project4-detail/board-30.png',
  '/portfolio/project4-detail/board-31.png',
  '/portfolio/project4-detail/board-23.jpg',
  '/portfolio/project4-detail/board-24.jpg',
  '/portfolio/project4-detail/board-25.jpg',
  '/portfolio/project4-detail/board-26.jpg',
  '/portfolio/project4-detail/board-27.jpg',
  '/portfolio/project4-detail/board-28.jpg',
  '/portfolio/project4-detail/board-30-extra.jpg',
  '/portfolio/project4-detail/board-31-extra.jpg',
];

const project5DetailImages = [
  '/portfolio/project5-detail/board-19.png',
  '/portfolio/project5-detail/board-20.png',
  '/portfolio/project5-detail/board-21.png',
];

const project6DetailImages = [
  '/portfolio/project6-detail/dog-1.png',
  '/portfolio/project6-detail/dog-2.png',
  '/portfolio/project6-detail/dog-3.png',
  '/portfolio/project6-detail/dog-4.png',
  '/portfolio/project6-detail/dog-5.png',
  '/portfolio/project6-detail/dog-6.gif',
  '/portfolio/project6-detail/dog-7.gif',
  '/portfolio/project6-detail/dog-8.gif',
  '/portfolio/project6-detail/dog-9.gif',
  '/portfolio/project6-detail/dog-10.gif',
  '/portfolio/project6-detail/dog-11.gif',
  '/portfolio/project6-detail/dog-12.gif',
  '/portfolio/project6-detail/dog-13.gif',
  '/portfolio/project6-detail/dog-14.gif',
  '/portfolio/project6-detail/dog-15.gif',
  '/portfolio/project6-detail/dog-16.gif',
  '/portfolio/project6-detail/dog-17.gif',
  '/portfolio/project6-detail/dog-18.gif',
  '/portfolio/project6-detail/dog-19.gif',
  '/portfolio/project6-detail/dog-20.gif',
  '/portfolio/project6-detail/dog-21.png',
  '/portfolio/project6-detail/dog-22.png',
  '/portfolio/project6-detail/dog-23.png',
  '/portfolio/project6-detail/dog-24.png',
  '/portfolio/project6-detail/dog-25.gif',
  '/portfolio/project6-detail/dog-26.gif',
];

const project7DetailImages = [
  '/portfolio/project7-detail/gift-002.png',
  '/portfolio/project7-detail/gift-003.jpg',
  '/portfolio/project7-detail/gift-004.gif',
  '/portfolio/project7-detail/gift-005.gif',
  '/portfolio/project7-detail/gift-006.gif',
  '/portfolio/project7-detail/gift-007.gif',
  '/portfolio/project7-detail/gift-008.gif',
  '/portfolio/project7-detail/gift-009.gif',
  '/portfolio/project7-detail/gift-extra-1.gif',
  '/portfolio/project7-detail/gift-extra-2.gif',
  '/portfolio/project7-detail/gift-extra-3.gif',
  '/portfolio/project7-detail/gift-extra-4.gif',
  '/portfolio/project7-detail/gift-010.png',
  '/portfolio/project7-detail/gift-011.gif',
];

const projects = [
  {
    title: '多多视频-直播礼物',
    tag: '3D动效',
    category: '3D Motion',
    year: '2026',
    image: '/portfolio/reference-project1.png',
    desc: '春节直播礼物 3D 动态设计，围绕开播引导、付费人数和 ARPPU 指标建立高冲击视觉表达。',
    video: '/portfolio/project1-detail/gift-collection.mp4',
    detailImages: project1DetailImages,
  },
  {
    title: 'UI 动效设计规范与参数提炼',
    tag: 'UI动效',
    category: 'UI Motion',
    year: '2024',
    image: '/portfolio/project2-cover.png',
    desc: '提炼弹窗、toast、退场、活动按钮等可复用动效参数，建立面向落地和性能的 UI 动效规范。',
    video: '/portfolio/project2-detail/ui-motion.mp4',
    detailImages: project2DetailImages,
  },
  {
    title: 'TEMU-裂变增长UI',
    tag: '增长UI',
    category: 'UI',
    year: '2026',
    image: '/portfolio/project3-cover.png',
    desc: '针对海外裂变增长链路设计 UI 体验，覆盖入口吸引、利益对比、任务反馈与转化路径。',
    detailImages: project3DetailImages,
  },
  {
    title: '视觉类-H5/头图',
    tag: '视觉',
    category: 'Visual',
    year: '2026',
    image: '/portfolio/project4-cover.png',
    desc: '运营视觉、H5 与头图模板系统，强化信息层级、行动引导和多场景视觉一致性。',
    detailImages: project4DetailImages,
  },
  {
    title: 'AI辅助项目',
    tag: 'AI辅助',
    category: 'AI',
    year: '2026',
    image: '/portfolio/project5-cover.png',
    desc: '将 AI 融入创意探索、视觉生成、文案与动效流程，提升概念到交付的整体效率。',
    detailImages: project5DetailImages,
  },
  {
    title: '多多视频-养狗小游戏',
    tag: '3D动效',
    category: '3D Motion',
    year: '2021',
    image: '/portfolio/project6-cover.png',
    desc: '围绕直播互动与轻量养成玩法设计的 3D 小游戏视觉，覆盖角色资产、动效反馈、状态演示与玩法包装。',
    video: '/portfolio/project6-detail/dog-demo.mp4',
    detailImages: project6DetailImages,
  },
  {
    title: '喜马拉雅 -直播礼物',
    tag: '3D动效',
    category: '3D Motion',
    year: '2020',
    image: '/portfolio/project7-cover.png',
    desc: '面向直播场景的礼物动效与视觉包装项目，强调礼物识别度、播放节奏和送礼瞬间的情绪价值。',
    video: '/portfolio/project7-detail/live-gift-2020.mp4',
    detailImages: project7DetailImages,
  },
];

const heroGalleryItems = projects.map((project, projectIndex) => ({
  image: project.image,
  text: project.title,
  projectIndex,
}));

const strengths = [
  {
    icon: Sparkles,
    title: '动效驱动业务',
    body: '熟悉 UI 动效从策略、参数、制作到开发验收的全链路，让动效服务转化、引导和体验。',
  },
  {
    icon: Wand2,
    title: 'AI 设计落地',
    body: '用 AI 参与视觉生成、本地化文案、表达式与脚本插件，把创意探索和机械流程都变得更快。',
  },
  {
    icon: Layers3,
    title: '全栈视觉能力',
    body: '能力覆盖 UI、动效、3D、运营视觉、品牌表达，能在复杂业务里快速搭出统一且有效的视觉系统。',
  },
  {
    icon: Workflow,
    title: '跨团队协作',
    body: '理解产品、开发、运营和数据反馈，能把设计规范化、组件化，并推动需求稳定上线。',
  },
];

const experience = [
  { company: '拼多多-TEMU', role: 'UI 视觉设计', time: '2024.02-2026.05' },
  { company: '拼多多-多多视频', role: '资深3D动效设计师', time: '2021.04-2024.02' },
  { company: '喜马拉雅', role: '高级 3D 动效设计师', time: '2020.08-2021.04' },
  { company: '白兔网络', role: '3D 动效设计师', time: '2018.11-2020.08' },
];

const workCategories = [
  { id: 'All', label: '全部', icon: LayoutGrid },
  { id: 'UI Motion', label: 'UI动效', icon: Layers3 },
  { id: 'UI', label: '增长UI', icon: Monitor },
  { id: '3D Motion', label: '3D动效', icon: Box },
  { id: 'Visual', label: '视觉', icon: Cpu },
  { id: 'AI', label: 'AI辅助', icon: Sparkles },
] as const;

const HERO_GALLERY_BEND = 1;
const HERO_GALLERY_BORDER_RADIUS = 0.05;
const HERO_GALLERY_SCROLL_SPEED = 2.6;
const HERO_GALLERY_SCROLL_EASE = 0.04;
const HERO_GALLERY_AUTO_SPEED = 0.018;

export default function App() {
  const [activeWorkCategory, setActiveWorkCategory] = useState<(typeof workCategories)[number]['id']>('All');
  const [selectedProject, setSelectedProject] = useState<(typeof projects)[number] | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wechatOpen, setWechatOpen] = useState(false);
  const [activeContact, setActiveContact] = useState<'email' | 'phone' | 'zcool' | 'wechat' | null>(null);
  const footerWechatRef = useRef<HTMLDivElement>(null);
  const heroGalleryRef = useRef<HTMLDivElement>(null);
  const heroGalleryCardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const heroGalleryMotionRef = useRef({ current: 0, target: 0, raf: 0, lastTime: 0 });
  const heroGalleryDragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, didDrag: false });
  const filteredProjects = activeWorkCategory === 'All'
    ? projects
    : projects.filter((project) => project.category === activeWorkCategory);

  useEffect(() => {
    const contactImage = new Image();
    contactImage.src = '/contact-wechat.jpg';
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedProject ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', mobileMenuOpen);
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!footerWechatRef.current?.contains(target)) {
        setWechatOpen(false);
        setActiveContact(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.section, .contact-finale, .section-head, .portrait-panel, .about-content, .stat-card, .timeline-item, .work-filter-card, .project-card, .strength-card, .finale-actions > *, .footer-line',
      ),
    );

    elements.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-index', `${Math.min(index % 8, 7)}`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [activeWorkCategory]);

  useEffect(() => {
    const track = heroGalleryRef.current;
    if (!track) return;

    const motionState = heroGalleryMotionRef.current;
    motionState.current = 0;
    motionState.target = 0;

    const updateCards = () => {
      const gallery = heroGalleryRef.current;
      if (!gallery) return;
      const rect = gallery.getBoundingClientRect();
      const centerX = rect.width / 2;
      const firstCard = heroGalleryCardRefs.current.find(Boolean);
      const cardWidth = firstCard?.offsetWidth ?? 360;
      const styles = window.getComputedStyle(gallery);
      const gap = Number.parseFloat(styles.getPropertyValue('--gallery-gap')) || 44;
      const step = cardWidth + gap;
      const totalWidth = step * heroGalleryItems.length;
      const cardRadius = Math.round(rect.width * HERO_GALLERY_BORDER_RADIUS);

      heroGalleryCardRefs.current.forEach((card, index) => {
        if (!card) return;
        let x = index * step - motionState.current;
        x = ((x + totalWidth / 2) % totalWidth + totalWidth) % totalWidth - totalWidth / 2;
        const distance = (x / rect.width) * 2.15;
        const clamped = Math.max(-1.15, Math.min(1.15, distance));
        const abs = Math.abs(clamped);
        const rotation = clamped * -7 * HERO_GALLERY_BEND;
        const y = abs * 24 * HERO_GALLERY_BEND;
        const scale = 1 - Math.min(0.055, abs * 0.035);
        const fadeStart = 0.62;
        const fadeEnd = 1.18;
        const fadeProgress = Math.max(0, Math.min(1, (abs - fadeStart) / (fadeEnd - fadeStart)));
        const opacity = 1 - fadeProgress * 0.72;
        card.style.setProperty('--gallery-x', `${centerX + x - cardWidth / 2}px`);
        card.style.setProperty('--gallery-rotate', `${rotation}deg`);
        card.style.setProperty('--gallery-y', `${y}px`);
        card.style.setProperty('--gallery-scale', `${scale}`);
        card.style.setProperty('--gallery-radius', `${Math.max(16, Math.min(28, cardRadius))}px`);
        card.style.setProperty('--gallery-opacity', `${opacity}`);
        card.style.zIndex = `${Math.round((1.25 - abs) * 100)}`;
      });
    };

    const tick = (time: number) => {
      const gallery = heroGalleryRef.current;
      if (!gallery) return;
      const state = heroGalleryMotionRef.current;
      const delta = state.lastTime ? Math.min(time - state.lastTime, 48) : 16;
      state.lastTime = time;
      if (!heroGalleryDragRef.current.isDown) {
        state.target += delta * HERO_GALLERY_AUTO_SPEED;
      }
      state.current += (state.target - state.current) * HERO_GALLERY_SCROLL_EASE;
      if (Math.abs(state.target - state.current) < 0.1) {
        state.current = state.target;
      }
      updateCards();
      state.raf = window.requestAnimationFrame(tick);
    };

    updateCards();
    motionState.raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(heroGalleryMotionRef.current.raf);
    };
  }, []);

  const handleHeroGalleryPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = heroGalleryRef.current;
    if (!track || event.button !== 0) return;
    heroGalleryDragRef.current = {
      isDown: true,
      startX: event.clientX,
      scrollLeft: heroGalleryMotionRef.current.target,
      didDrag: false,
    };
    track.setPointerCapture(event.pointerId);
  };

  const handleHeroGalleryPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = heroGalleryRef.current;
    const drag = heroGalleryDragRef.current;
    if (!track || !drag.isDown) return;
    const distance = event.clientX - drag.startX;
    if (Math.abs(distance) > 4) drag.didDrag = true;
    heroGalleryMotionRef.current.target = drag.scrollLeft - distance * HERO_GALLERY_SCROLL_SPEED;
  };

  const handleHeroGalleryPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = heroGalleryRef.current;
    heroGalleryDragRef.current.isDown = false;
    if (track?.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
  };

  const handleHeroGalleryWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.preventDefault();
    const track = heroGalleryRef.current;
    if (!track) return;
    const nextTarget = heroGalleryMotionRef.current.target + event.deltaY * HERO_GALLERY_SCROLL_SPEED * 0.45;
    heroGalleryMotionRef.current.target = nextTarget;
  };

  return (
    <main className="site-shell font-geist">
      <nav className="nav">
        <div className="nav-left">
          <a className="brand" href="#top" aria-label="返回首页">
            DO STUDIO
          </a>
          <div className="nav-links">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <a className="nav-contact desktop-talk" href="#contact">
          联系我
        </a>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <Menu className="menu-icon" size={22} aria-hidden="true" />
          <X className="close-icon" size={22} aria-hidden="true" />
        </button>
      </nav>

      <div className={`mobile-menu${mobileMenuOpen ? ' is-open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-menu-inner">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a className="mobile-talk" href="#contact" onClick={() => setMobileMenuOpen(false)}>
            联系方式
          </a>
        </div>
      </div>

      <section className="hero" id="top">
        <video
          className="hero-video"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204221_5339e40b-e73d-4ab0-9c65-79c18c66fd50.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="hero-scrim" />

        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-top">
              <h1>
                ZHAO<br />
                WEIDONG<br />
                PORTFOLIO
              </h1>
              <div className="hero-gallery">
                <div
                  className="hero-gallery-track"
                  ref={heroGalleryRef}
                  aria-label="精选项目预览"
                  onPointerDown={handleHeroGalleryPointerDown}
                  onPointerMove={handleHeroGalleryPointerMove}
                  onPointerUp={handleHeroGalleryPointerUp}
                  onPointerCancel={handleHeroGalleryPointerUp}
                  onPointerLeave={handleHeroGalleryPointerUp}
                  onWheel={handleHeroGalleryWheel}
                >
                  {heroGalleryItems.map((item, galleryIndex) => {
                    const index = Number(item.projectIndex);
                    return (
                      <button
                        className="hero-gallery-card"
                        key={`${item.text}-${index}`}
                        ref={(node) => {
                          heroGalleryCardRefs.current[galleryIndex] = node;
                        }}
                        type="button"
                        onClick={() => {
                          if (heroGalleryDragRef.current.didDrag) {
                            window.setTimeout(() => {
                              heroGalleryDragRef.current.didDrag = false;
                            }, 0);
                            return;
                          }
                          if (Number.isInteger(index) && projects[index]) setSelectedProject(projects[index]);
                        }}
                      >
                        <img src={item.image} alt={item.text} draggable={false} />
                        <span>{item.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="hero-bottom-copy">
              <p>资深动效设计师，具备 UI、动效、3D、视觉与 AI 辅助设计能力。把视觉、动效与 AI 转化为可增长的设计系统。</p>
              <a className="hero-explore" href="#work">
                查看精选项目
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="section-grid">
          <div className="portrait-panel">
            <div className="portrait-card">
              <div>
                <strong>ZHAO WEIDONG</strong>
                <small>Shanghai</small>
              </div>
            </div>
          </div>

          <div className="about-content">
            <p className="eyebrow">About Experience</p>
            <h2>拥有 8 年互联网设计经验，擅长把复杂业务拆解成清晰、可执行、可复用的视觉方案。</h2>
            <p className="lead">
              工作履历从 MG 动画、3D 动态直播礼物、UI 动效，到视觉与增长 UI，覆盖创意、制作、规范、上线和数据回收。曾带领 3-5 人团队推动直播业务营收多倍增长，并在拼多多、喜马拉雅等业务中沉淀了高强度项目协作经验。
            </p>

            <div className="contact-strip">
              <span><MapPin size={16} />上海市长宁区</span>
              <a href="tel:17766053112"><Phone size={16} />17766053112</a>
              <a href="mailto:825324414@qq.com"><Mail size={16} />825324414@qq.com</a>
            </div>

            <div className="stats-grid">
              {stats.map((stat) => (
                <div className="stat-card" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="timeline">
              {experience.map((item) => (
                <div className="timeline-item" key={`${item.company}-${item.time}`}>
                  <span className="timeline-marker">
                    <CircleDot size={15} />
                  </span>
                  <div className="timeline-copy">
                    <time>{item.time}</time>
                    <strong>{item.company}</strong>
                    <span>{item.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section work-showcase" id="work">
        <p className="eyebrow">精选作品</p>
        <div className="work-filter-grid" aria-label="作品分类筛选">
          {workCategories.map((category) => (
            <button
              key={category.id}
              className={`work-filter-card${activeWorkCategory === category.id ? ' is-active' : ''}`}
              type="button"
              onClick={() => setActiveWorkCategory(category.id)}
            >
              <category.icon size={24} strokeWidth={1.8} />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        <div className="work-list-meta">
          <span>筛选条件: {workCategories.find((category) => category.id === activeWorkCategory)?.label}</span>
          <span>显示 {filteredProjects.length} 个项目</span>
        </div>

        <motion.div layout className="project-grid">
          {filteredProjects.map((project, index) => (
            <motion.article
              layout
              className="project-card"
              key={project.title}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: index * 0.04 }}
              onClick={() => setSelectedProject(project)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedProject(project);
                }
              }}
            >
              <div className="project-image">
                <img src={project.image} alt={project.title} />
                <span className="project-hover-label">查看作品详情</span>
              </div>
              <div className="project-meta">
                <span>{project.tag}</span>
                <span>{project.year}</span>
              </div>
              <h3>{project.title}</h3>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {selectedProject && (
        <motion.section
          className="project-detail"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="detail-back" type="button" onClick={() => setSelectedProject(null)}>
            <span><ArrowLeft size={18} /></span>
            返回作品列表
          </button>

          <div className="detail-inner">
            <div className="detail-hero">
              <div>
                <p className="eyebrow">Project Detail</p>
                <h2>{selectedProject.title}</h2>
                <p>{selectedProject.desc}</p>
              </div>
              <div className="detail-facts">
                <div>
                  <span>Category</span>
                  <strong>{selectedProject.tag}</strong>
                </div>
                <div>
                  <span>Year</span>
                  <strong>{selectedProject.year}</strong>
                </div>
                <div>
                  <span>Role</span>
                  <strong>Visual / Motion / AI</strong>
                </div>
              </div>
            </div>

            <div className="detail-gallery">
              {'video' in selectedProject && selectedProject.video && (
                <motion.figure
                  className="detail-video"
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5 }}
                >
                  <video src={selectedProject.video} controls autoPlay muted loop playsInline />
                </motion.figure>
              )}
              {selectedProject.detailImages.map((image, index) => (
                <motion.figure
                  key={`${selectedProject.title}-${image}`}
                  initial={{ opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, delay: index * 0.04 }}
                >
                  <img src={image} alt={`${selectedProject.title} 详情 ${index + 1}`} />
                </motion.figure>
              ))}
            </div>

            <div className="detail-footer">
              <p className="eyebrow">Next</p>
              <button type="button" onClick={() => setSelectedProject(null)}>继续浏览作品</button>
            </div>
          </div>
        </motion.section>
      )}

      <section className="section strengths-section" id="strengths">
        <div className="section-head compact">
          <p className="eyebrow">Core Advantages</p>
          <h2>个人优势</h2>
        </div>
        <div className="strength-grid">
          {strengths.map((item) => (
            <article className="strength-card" key={item.title}>
              <item.icon size={24} />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-finale" id="contact">
        <div className="finale-inner">
          <p className="eyebrow">Contact</p>
          <h2>期待与你一起，把下一个项目做得更锋利、更清晰。</h2>
          <div className="finale-actions">
            <a
              className={activeContact === 'email' ? 'is-active' : ''}
              href="mailto:825324414@qq.com"
              onClick={() => setActiveContact('email')}
            >
              <Mail size={18} />
              825324414@qq.com
            </a>
            <a
              className={activeContact === 'phone' ? 'is-active' : ''}
              href="tel:17766053112"
              onClick={() => setActiveContact('phone')}
            >
              <Phone size={18} />
              17766053112
            </a>
            <a
              className={activeContact === 'zcool' ? 'is-active' : ''}
              href="https://www.zcool.com.cn/u/16926202"
              target="_blank"
              rel="noreferrer"
              onClick={() => setActiveContact('zcool')}
            >
              <BadgeCheck size={18} />
              站酷主页
            </a>
            <div className="finale-wechat-wrap" ref={footerWechatRef}>
              <button
                type="button"
                className={`finale-wechat-button${activeContact === 'wechat' ? ' is-active' : ''}`}
                aria-expanded={wechatOpen}
                onClick={() => {
                  setWechatOpen((open) => !open);
                  setActiveContact('wechat');
                }}
              >
                <MessageCircle size={18} />
                微信
              </button>
              <div className={`contact-bubble finale-wechat-bubble${wechatOpen ? ' is-open' : ''}`} role="dialog" aria-hidden={!wechatOpen}>
                <img src="/contact-wechat.jpg" alt="微信二维码" decoding="async" />
              </div>
            </div>
          </div>
          <div className="footer-line">
            <span>Portfolio 2026</span>
            <span>Zhao Weidong</span>
          </div>
        </div>
      </section>
    </main>
  );
}

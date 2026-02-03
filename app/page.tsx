"use client";

import Link from "next/link";
import { useState } from "react";
import localFont from "next/font/local";
import { 
  ArrowRight, Plus, Minus, Menu, X, CheckCircle2, 
  Instagram, Twitter, Globe, Mail, Sparkles, Check
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import React from "react";

// --- ШРИФТЫ ---
const akony = localFont({
  src: "./fonts/AKONY.otf",
  display: "swap",
});

// --- АНИМАЦИИ ---
const fadeInUp: Variants = {
  initial: { opacity: 0, y: 40 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const floatAnimation: Variants = {
  animate: {
    y: [0, -20, 0],
    rotate: [0, 2, -2, 0],
    transition: { 
      duration: 6, 
      repeat: Infinity, 
      ease: "easeInOut"
    }
  }
};
type DepthType = 'base' | 'elevated' | 'floating' | 'nav';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: DepthType;
  hoverEffect?: boolean;
}
// --- GLASSMORPHIC CARD COMPONENT ---
function GlassCard({ children, className = "", depth = "base", hoverEffect = false }: GlassCardProps) {
  const depthStyles: Record<DepthType, string> = {
    base: 'bg-white/5 backdrop-blur-sm border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
    elevated: 'bg-white/10 backdrop-blur-md border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
    floating: 'bg-white/10 backdrop-blur-lg border border-white/20 shadow-[0_16px_48px_rgba(0,0,0,0.4)]',
    nav: 'bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg',
  };

  const hoverStyles = hoverEffect
    ? 'hover:bg-white/15 hover:border-white/30 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <div className={`relative overflow-hidden transition-all duration-300 ease-out ${depthStyles[depth]} ${hoverStyles} ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
      {children}
    </div>
  );
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative text-white selection:bg-pink-500/30 overflow-x-hidden">
      
      {/* Fixed Background Layer - Purple/Pink Glassmorphic Theme */}
      <div className="fixed inset-0 z-0 bg-[#0f0a1e]">
        {/* Gradient Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-cyan-600/20 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-[120px]" />

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
             }} 
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        
        {/* --- НАВИГАЦИЯ --- */}
        <div className="fixed top-4 md:top-6 left-0 w-full z-50 flex justify-center px-4">
          <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="w-full max-w-4xl md:max-w-6xl"
          >
            <GlassCard depth="nav" className="rounded-full px-4 md:px-6 py-3 flex items-center justify-between">
              {/* Логотип */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="font-bold text-white text-lg">L</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-white">Linkalink</span>
              </div>
              
              {/* Десктоп меню */}
              <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
                <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">Возможности</button>
                <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">Как работает</button>
                <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Тарифы</button>
              </div>

              <div className="flex items-center gap-4">
                <button className="hidden md:block text-sm font-medium text-white hover:text-white/80 transition-colors">
                  Войти
                </button>
                <button className="hidden md:block bg-white text-purple-900 px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-50 transition-colors shadow-lg shadow-white/10">
                  Начать
                </button>
                <button className="md:hidden text-white/80 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </GlassCard>

            {/* Мобильное меню */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute top-20 w-full"
                >
                  <GlassCard depth="elevated" className="rounded-3xl p-4 flex flex-col gap-2">
                    <MobileMenuItem onClick={() => scrollTo('features')} text="Возможности" />
                    <MobileMenuItem onClick={() => scrollTo('how-it-works')} text="Как работает" />
                    <MobileMenuItem onClick={() => scrollTo('pricing')} text="Тарифы" />
                    <button 
                      onClick={() => scrollTo('contact')}
                      className="mt-2 w-full py-4 bg-white text-purple-900 font-bold rounded-2xl uppercase tracking-widest text-xs"
                    >
                      Начать
                    </button>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </div>

        {/* --- HERO BLOCK с телефоном --- */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                <Sparkles size={14} className="text-pink-400" />
                <span className="text-xs font-medium text-pink-200 uppercase tracking-wider">
                  Будущее Bio Links
                </span>
              </div>

              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className={`text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 tracking-tighter uppercase`}
              >
                ОДНА ССЫЛКА,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300">
                  КОТОРАЯ МОЖЕТ ВСЁ
                </span>
              </motion.h1>

              <p className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed">
                Создайте потрясающую страницу со ссылками за минуты. Поделитесь всем своим цифровым миром с помощью одной ссылки, которая выглядит как произведение искусства.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button className="px-8 py-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                  Начать бесплатно <ArrowRight size={18} />
                </button>
                <GlassCard
                  depth="base"
                  className="px-8 py-4 rounded-xl font-semibold text-white hover:bg-white/10 cursor-pointer flex items-center justify-center"
                >
                  Примеры
                </GlassCard>
              </div>
            </div>

            {/* Right Content - GLASSMORPHIC PHONE MOCKUP */}
            <div className="relative z-10 flex justify-center lg:justify-end perspective-1000">
              {/* Decorative floating elements */}
              <div className="absolute top-1/4 -left-12 w-24 h-24 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-md border border-white/10 animate-float-slow z-0 rotate-12" />
              <div className="absolute bottom-1/4 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-md border border-white/10 animate-float-delayed z-0" />

              {/* Glass Pedestal */}
              <div className="absolute bottom-0 w-64 h-12 bg-white/5 backdrop-blur-md rounded-[100%] blur-xl" />

              {/* Phone Container */}
              <motion.div 
                variants={floatAnimation}
                animate="animate"
                className="relative w-[300px] h-[600px] bg-black rounded-[40px] border-[8px] border-gray-800 shadow-2xl overflow-hidden transform hover:rotate-y-0 transition-transform duration-700"
              >
                {/* Screen Content */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-black overflow-hidden">
                  {/* Status Bar */}
                  <div className="h-8 w-full flex justify-between items-center px-6 pt-2">
                    <span className="text-[10px] text-white font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-white/20"></div>
                      <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div className="flex flex-col items-center mt-8 px-6">
                    <div className="w-20 h-20 rounded-full border-2 border-white/20 p-1 mb-4">
                      <div className="w-full h-full rounded-full bg-gradient-to-tr from-pink-400 to-purple-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg">Ваше Имя</h3>
                    <p className="text-white/50 text-xs mb-6">Креатор & Предприниматель</p>

                    {/* Link Cards - Glassmorphic Style */}
                    <div className="w-full space-y-3">
                      <GlassCard
                        depth="base"
                        className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Globe size={14} className="text-white" />
                        </div>
                        <span className="text-sm text-white font-medium">Мой сайт</span>
                      </GlassCard>

                      <GlassCard
                        depth="base"
                        className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Instagram size={14} className="text-white" />
                        </div>
                        <span className="text-sm text-white font-medium">Instagram</span>
                      </GlassCard>

                      <GlassCard
                        depth="base"
                        className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Twitter size={14} className="text-white" />
                        </div>
                        <span className="text-sm text-white font-medium">Twitter</span>
                      </GlassCard>

                      <GlassCard
                        depth="elevated"
                        className="w-full p-3 rounded-xl flex items-center gap-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/40">
                          <Sparkles size={14} className="text-white" />
                        </div>
                        <span className="text-sm text-white font-medium">Новый продукт</span>
                      </GlassCard>

                      <GlassCard
                        depth="base"
                        className="w-full p-3 rounded-xl flex items-center gap-3 hover:bg-white/10 cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <Mail size={14} className="text-white" />
                        </div>
                        <span className="text-sm text-white font-medium">Рассылка</span>
                      </GlassCard>
                    </div>
                  </div>
                </div>

                {/* Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </motion.div>

              {/* Reflection Under Phone */}
              <div
                className="absolute -bottom-12 w-[280px] h-[600px] bg-gradient-to-br from-indigo-900 via-purple-900 to-black rounded-[40px] opacity-20 blur-sm transform scale-y-[-1]"
                style={{
                  maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))',
                  WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))',
                }}
              />
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1, duration: 2, repeat: Infinity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Прокрутить</span>
            <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
          </motion.div>
        </section>

        {/* --- ВОЗМОЖНОСТИ --- */}
        <section id="features" className="py-24 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              variants={fadeInUp} 
              initial="initial" 
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.2 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight uppercase">
                Больше чем просто ссылки
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto">
                Всё что нужно для демонстрации контента, роста аудитории и монетизации.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <PainItem 
                num="01" 
                title="Глубокая Аналитика" 
                desc="Отслеживайте просмотры, клики и вовлеченность в реальном времени с приватной аналитикой."
              />
              <PainItem 
                num="02" 
                title="Кастомные Темы" 
                desc="Соответствуйте бренду с неограниченными комбинациями цветов и шрифтов."
              />
              <PainItem 
                num="03" 
                title="Соцсети Hub" 
                desc="Подключите все ваши профили в одном красивом месте."
              />
              <PainItem 
                num="04" 
                title="Умные QR-коды" 
                desc="Генерируйте коды мгновенно для офлайн-маркетинга."
              />
              <PainItem 
                num="05" 
                title="Планирование" 
                desc="Планируйте появление и исчезновение ссылок автоматически."
              />
              <PainItem 
                num="06" 
                title="50+ Интеграций" 
                desc="Подключайтесь к инструментам, которые вы уже используете."
              />
            </div>
          </div>
        </section>

        {/* --- КАК ЭТО РАБОТАЕТ --- */}
        <section id="how-it-works" className="py-24 md:py-40 px-4 relative overflow-hidden">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent hidden md:block" />

          <div className="max-w-4xl mx-auto relative z-10">
            <motion.h3 
              variants={fadeInUp} 
              initial="initial" 
              whileInView="whileInView"
              viewport={{ once: true }} 
              className="text-3xl md:text-5xl font-bold text-center mb-16 md:mb-32 uppercase tracking-tighter"
            >
              Как это работает
            </motion.h3>
            
            <div className="space-y-16 md:space-y-32">
              <Step num="01" title="Создайте аккаунт" desc="Зарегистрируйтесь за секунды и получите уникальный URL." />
              <Step num="02" title="Добавьте ссылки" desc="Вставьте URL на ваш контент, продукты и профили." />
              <Step num="03" title="Делитесь везде" desc="Добавьте Linkalink в био на всех платформах." />
            </div>
          </div>
        </section>

        {/* --- ТАРИФЫ (GLASSMORPHIC) --- */}
        <section id="pricing" className="py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 uppercase tracking-tight">Прозрачные Тарифы</h2>
              <p className="text-lg text-white/60">Начните бесплатно, обновляйтесь по мере роста.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
              
              {/* Free Plan */}
              <GlassCard depth="base" className="rounded-3xl p-8 h-fit">
                <h3 className="text-xl font-medium text-white/80 mb-2">Стартовый</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">2499 р</span>
                  <span className="text-white/50">/мес</span>
                </div>
                <p className="text-sm text-white/60 mb-8">
                  Идеально для личного использования.
                </p>

                <ul className="space-y-4 mb-8">
                  {['Безлимитные ссылки', 'Базовая аналитика', 'Стандартные темы', 'QR-код'].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-white/80">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Check size={12} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors font-medium">
                  Начать
                </button>
              </GlassCard>

              {/* Pro Plan - Elevated */}
              <div className="relative z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-pink-500/20 blur-2xl -z-10 rounded-3xl" />
                <GlassCard
                  depth="floating"
                  className="rounded-3xl p-8 border-purple-500/30 transform md:-translate-y-4"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-200 uppercase tracking-wider">
                      Популярный
                    </div>
                  </div>

                  <h3 className="text-xl font-medium text-white mb-2">Pro Креатор</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">3999 р</span>
                    <span className="text-white/50">/мес</span>
                  </div>
                  <p className="text-sm text-white/60 mb-8">
                    Для креаторов, готовых расти.
                  </p>

                  <ul className="space-y-4 mb-8">
                    {['Всё из Стартового', 'Кастомные фоны', 'Продвинутая аналитика', 'Приоритетная поддержка', 'Без брендинга'].map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-sm text-white">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/40">
                          <Check size={12} className="text-white" />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <button className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-[1.02]">
                    Пробный период
                  </button>
                </GlassCard>
              </div>

              {/* Business Plan */}
              <GlassCard depth="base" className="rounded-3xl p-8 h-fit">
                <h3 className="text-xl font-medium text-white/80 mb-2">Бизнес</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">5499 р</span>
                  <span className="text-white/50">/мес</span>
                </div>
                <p className="text-sm text-white/60 mb-8">
                  Для агентств и брендов.
                </p>

                <ul className="space-y-4 mb-8">
                  {['Всё из Pro', '5+ страниц', 'Команда', 'API доступ', 'Менеджер'].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm text-white/80">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <Check size={12} />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors font-medium">
                  Связаться
                </button>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* --- FAQ --- */}
        <section id="faq" className="py-24 max-w-3xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-bold mb-12 text-center uppercase tracking-tighter">Вопросы</h2>
          <div className="space-y-4">
            <FaqItem q="Нужно ли платить за создание?" a="Нет, базовая настройка бесплатна. Вы платите только за выбранный тариф." />
            <FaqItem q="Смогу ли я сам менять настройки?" a="Да, у вас будет удобная панель управления." />
            <FaqItem q="Как быстро все запустится?" a="Обычно настройка занимает несколько минут." />
          </div>
        </section>

        {/* --- ФОРМА ЗАЯВКИ (GLASSMORPHIC) --- */}
        <section id="contact" className="py-24 md:py-40 px-4 relative">
          <div className="max-w-5xl mx-auto">
            <GlassCard
              depth="floating"
              className="rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden"
            >
              {/* Decorative Orbs inside card */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/20 blur-3xl rounded-full translate-x-1/2 translate-y-1/2" />

              <motion.div 
                variants={fadeInUp}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                className="relative z-10"
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight uppercase">
                  Готовы к новому<br />уровню?
                </h2>
                <p className="text-white/70 mb-12 uppercase tracking-widest text-xs md:text-sm">
                  Оставьте заявку, и мы свяжемся с вами
                </p>
                
                <form className="max-w-md mx-auto flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                  <GlassCard depth="base" className="rounded-xl overflow-hidden">
                    <input
                      type="text"
                      placeholder="ИМЯ"
                      className="w-full h-full bg-transparent border-none px-6 py-4 text-white placeholder-white/40 focus:ring-0 outline-none text-center uppercase tracking-wider"
                    />
                  </GlassCard>
                  
                  <GlassCard depth="base" className="rounded-xl overflow-hidden">
                    <input
                      type="tel"
                      placeholder="TELEGRAM / ТЕЛЕФОН"
                      className="w-full h-full bg-transparent border-none px-6 py-4 text-white placeholder-white/40 focus:ring-0 outline-none text-center uppercase tracking-wider"
                    />
                  </GlassCard>

                  <button className="mt-6 px-8 py-4 rounded-xl bg-white text-purple-900 font-bold hover:bg-purple-50 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2 uppercase tracking-widest">
                    Отправить <ArrowRight size={18} />
                  </button>
                </form>
              </motion.div>
            </GlassCard>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-white/5 bg-black/20 backdrop-blur-lg pt-16 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                    <span className="font-bold text-white text-lg">L</span>
                  </div>
                  <span className={`${akony.className} font-bold text-xl tracking-tight text-white`}>LINKALINK</span>
                </div>
                <p className="text-white/40 text-sm">
                  Самый красивый инструмент link in bio для креаторов и брендов.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-6">Платформа</h4>
                <ul className="space-y-4 text-sm text-white/60">
                  <li><a href="#features" className="hover:text-white transition-colors">Возможности</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Тарифы</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Примеры</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6">Компания</h4>
                <ul className="space-y-4 text-sm text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Карьера</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Блог</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Контакты</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6">Правовая информация</h4>
                <ul className="space-y-4 text-sm text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">Конфиденциальность</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Условия</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Безопасность</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/30 text-sm">© 2024 Linkalink Inc. Все права защищены.</p>
              <div className="flex gap-6">
                <div className="w-5 h-5 rounded-full bg-white/10" />
                <div className="w-5 h-5 rounded-full bg-white/10" />
                <div className="w-5 h-5 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- КОМПОНЕНТЫ ---

function MobileMenuItem({ onClick, text }: { onClick: () => void, text: string }) {
  return (
    <button 
      onClick={onClick} 
      className="w-full py-3 px-4 text-left text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors font-medium"
    >
      {text}
    </button>
  );
}

function PainItem({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <motion.div 
      variants={fadeInUp} 
      initial="initial" 
      whileInView="whileInView"
      viewport={{ once: true }}
      className="group"
    >
      <GlassCard 
        depth="elevated" 
        hoverEffect
        className="p-8 rounded-3xl h-full"
      >
        <div className="flex gap-4">
          <span className="text-pink-400 font-bold text-lg shrink-0">{num}</span>
          <div>
            <h4 className="text-xl font-bold mb-2 uppercase tracking-tight">{title}</h4>
            <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <motion.div 
      variants={fadeInUp} 
      initial="initial" 
      whileInView="whileInView" 
      viewport={{ once: true }}
      className="flex flex-col items-center text-center max-w-sm mx-auto group"
    >
      <div className="relative mb-8">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] z-20 relative group-hover:bg-white/10 transition-all">
          <span className="text-2xl font-bold text-white">{num}</span>
        </div>
        <div className="absolute inset-0 rounded-full blur-xl opacity-50 bg-purple-500/30" />
      </div>
      <h4 className="text-xl md:text-2xl font-bold mb-4 uppercase tracking-tighter">{title}</h4>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function FaqItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <GlassCard depth="base" className="rounded-2xl overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-sm md:text-base pr-4">{q}</span>
        {isOpen ? <Minus size={20} className="text-white/70 shrink-0"/> : <Plus size={20} className="text-white/50 shrink-0"/>}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="p-6 pt-0 text-white/60 text-sm leading-relaxed border-t border-white/10 mt-2">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
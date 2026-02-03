"use client";

import Link from "next/link";
import { useState } from "react";
import localFont from "next/font/local";
import Image from "next/image";
import { 
  ArrowRight, Plus, Minus, Menu, X, CheckCircle2, 
  Instagram, Twitter, Globe, Mail, Sparkles, Check,
  Star, Coffee, Scissors, ShoppingBag, TrendingUp,
  Users, Target, Zap, Award, ExternalLink, MessageCircle,
  Clock, BarChart, Palette, Code
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

  // Данные для кейсов
  const cases = [
    {
      title: "Барбершоп «ELEGANT»",
      category: "Барбершоп",
      description: "Современный сайт с онлайн-записью и галереей работ",
      image: "/hero-3d.png",
      link: "https://linkalink.vercel.app/elegant-barbershop",  
      stats: { growth: "+180%", metric: "записей онлайн" }
    },
    {
      title: "Глэмпинг «FOREST GLAMP»",
      category: "Отдых",
      description: "Стильный landing с меню и доставкой",
      image: "/solution-3d.png",
      link: "https://linkalink.vercel.app/forest-glamp",
      stats: { growth: "+250%", metric: "заказов в месяц" }
    },
    /*{
      title: "Салон красоты «BEAUTY»",
      category: "Салон",
      description: "Элегантный сайт с системой бронирования",
      image: "/pain-3d.png",
      link: "https://example.com/salon",
      stats: { growth: "+320%", metric: "клиентов" }
    }*/
  ];

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
                <div className="w-8 h-8 md:w-10 md:h-10 relative overflow-hidden rounded-lg">
                  <Image 
                    src="/logo.jpg" 
                    alt="Logo" 
                    width={40} 
                    height={40}
                    className="w-full h-full object-cover brightness-[1.2] hue-rotate-[-30deg] saturate-[1.2]"
                  />
                </div>
                <span className={`${akony.className} font-bold text-xl tracking-tight text-white`}>LINKALINK</span>
              </div>
              
              {/* Десктоп меню */}
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/70">
                <button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">Услуги</button>
                <button onClick={() => scrollTo('results')} className="hover:text-white transition-colors">Результаты</button>
                <button onClick={() => scrollTo('cases')} className="hover:text-white transition-colors">Кейсы</button>
                <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Тарифы</button>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => scrollTo('contact')}
                  className="hidden md:block bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-pink-500/30 transition-all"
                >
                  Оставить заявку
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
                    <MobileMenuItem onClick={() => scrollTo('services')} text="Услуги" />
                    <MobileMenuItem onClick={() => scrollTo('results')} text="Результаты" />
                    <MobileMenuItem onClick={() => scrollTo('cases')} text="Кейсы" />
                    <MobileMenuItem onClick={() => scrollTo('pricing')} text="Тарифы" />
                    <button 
                      onClick={() => scrollTo('contact')}
                      className="mt-2 w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl uppercase tracking-widest text-xs"
                    >
                      Оставить заявку
                    </button>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </div>

        {/* --- 1. HERO BLOCK --- */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                <Sparkles size={14} className="text-pink-400" />
                <span className="text-xs font-medium text-pink-200 uppercase tracking-wider">
                  Готовое решение для бизнеса
                </span>
              </div>

              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${akony.className} text-5xl md:text-7xl lg:text-8xl font-bold mb-45 leading-[0.95] uppercase tracking-tighter`}
              >
                Одна ссылка, которая<br />
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  решает все
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/70 mb-7 max-w-lg leading-relaxed"
              >
                Создаю стильные сайты для локального бизнеса с интегрированной системой онлайн-записи. 
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
              >
                <button 
                  onClick={() => scrollTo('contact')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl font-bold text-white overflow-hidden shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Обсудить проект <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button 
                  onClick={() => scrollTo('cases')}
                  className="px-8 py-4 rounded-2xl font-bold text-white border-2 border-white/20 hover:bg-white/10 transition-all"
                >
                  Смотреть кейсы
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-8 mt-12 w-full"
              >
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1">+47%</div>
                  <div className="text-white/50 text-sm">Конверсии</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-1">2,5x</div>
                  <div className="text-white/50 text-sm">Рост продаж</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-1">24/7</div>
                  <div className="text-white/50 text-sm">Поддержка</div>
                </div>
              </motion.div>
            </div>

            {/* Right - Enhanced Phone Mockup */}
            <motion.div 
              variants={floatAnimation}
              animate="animate"
              className="relative flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-md lg:max-w-lg">
                {/* Glow Effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 blur-3xl scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 to-transparent blur-2xl" />
                
                {/* Phone Frame */}
                <div className="relative z-10">
                  <GlassCard depth="floating" className="rounded-[3rem] p-3 shadow-2xl">
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-[2.5rem] overflow-hidden">
                      {/* Screen Content */}
                      <div className="relative aspect-[9/19]">
                        <Image 
                          src="/hero-3d.png"
                          alt="Phone mockup"
                          fill
                          className="object-cover"
                        />
                        
                        {/* Overlay UI Elements */}
                        <div className="absolute inset-0 p-8 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <div className="text-xs text-white/80">9:41</div>
                            <div className="flex gap-1">
                              <div className="w-1 h-1 rounded-full bg-white/80" />
                              <div className="w-1 h-1 rounded-full bg-white/80" />
                              <div className="w-1 h-1 rounded-full bg-white/80" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                  
                  {/* Floating Cards */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -left-13 top-3/4 hidden lg:block"
                  >
                    <GlassCard depth="elevated" className="px-3 py-3 rounded-4xl">
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-400" size={16} />
                        <span className="text-sm font-bold">4.9 Rating</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                  
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="absolute -right-8 bottom-2/3 hidden lg:block"
                  >
                    <GlassCard depth="elevated" className="px-3 py-3 rounded-4xl">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="text-green-400" size={16} />
                        <span className="text-sm font-bold">+150% ROI</span>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- 2. УСЛУГИ --- */}
        <section id="services" className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className={`${akony.className} text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter`}>
                Что я <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">предлагаю</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Полный спектр услуг для вывода вашего бизнеса в онлайн
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ServiceCard 
                icon={<Code size={32} />}
                title="Разработка сайтов"
                description="Современные, быстрые и адаптивные сайты для вашего бизнеса с удобной системой управления"
              />
              <ServiceCard 
                icon={<Target size={32} />}
                title="Настройка рекламы"
                description="Таргетированная реклама в социальных сетях с максимальным ROI и привлечением целевой аудитории"
              />
              <ServiceCard 
                icon={<Palette size={32} />}
                title="Брендинг и дизайн"
                description="Создание уникального визуального стиля, который выделит ваш бизнес среди конкурентов"
              />
              <ServiceCard 
                icon={<BarChart size={32} />}
                title="Аналитика и SEO"
                description="Настройка аналитики, оптимизация для поисковых систем и отслеживание ключевых метрик"
              />
              <ServiceCard 
                icon={<MessageCircle size={32} />}
                title="SMM продвижение"
                description="Ведение социальных сетей, создание контента и взаимодействие с аудиторией"
              />
              <ServiceCard 
                icon={<Clock size={32} />}
                title="Техподдержка"
                description="Круглосуточная поддержка, обновления и консультации по всем вопросам"
              />
            </div>
          </div>
        </section>

        {/* --- 3. РЕЗУЛЬТАТЫ --- */}
        <section id="results" className="py-32 px-4 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className={`${akony.className} text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter`}>
                Каких результатов <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">можно достичь</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Реальные показатели роста бизнеса моих клиентов
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ResultCard 
                metric="+250%"
                description="Рост онлайн-записей в среднем за 3 месяца"
                color="from-pink-500 to-purple-500"
              />
              <ResultCard 
                metric="+180%"
                description="Увеличение трафика на сайт"
                color="from-purple-500 to-cyan-500"
              />
              <ResultCard 
                metric="3x"
                description="Повышение узнаваемости бренда"
                color="from-cyan-500 to-green-500"
              />
              <ResultCard 
                metric="90%"
                description="Клиентов возвращаются повторно"
                color="from-green-500 to-pink-500"
              />
            </div>
          </div>
        </section>

        {/* --- 4. С КЕМ РАБОТАЮ --- */}
        <section id="clients" className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className={`${akony.className} text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter`}>
                С кем я <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">работаю</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Специализируюсь на локальных бизнесах в сфере услуг
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <ClientType icon={<Scissors size={40} />} title="Барбершопы" />
              <ClientType icon={<Star size={40} />} title="Салоны красоты" />
              <ClientType icon={<Coffee size={40} />} title="Кофейни" />
              <ClientType icon={<ShoppingBag size={40} />} title="Бутики" />
            </div>
          </div>
        </section>

        {/* --- 5. РЕШЕНИЕ И УТП --- */}
        <section className="py-32 px-4 bg-gradient-to-b from-transparent via-pink-900/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
              >
                <h2 className={`${akony.className} text-4xl md:text-5xl font-bold mb-6 uppercase tracking-tighter`}>
                  Мое <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">решение</span>
                </h2>
                <p className="text-white/70 text-lg mb-8 leading-relaxed">
                  Я не просто делаю сайты — я создаю полноценные системы привлечения клиентов. Каждый проект получает индивидуальный подход, современный дизайн и настроенную рекламную кампанию.
                </p>

                <div className="space-y-4">
                  <USPItem 
                    icon={<Zap />}
                    title="Быстрый запуск"
                    description="От идеи до первых клиентов за 2 недели"
                  />
                  <USPItem 
                    icon={<Award />}
                    title="Гарантия результата"
                    description="Работаю до достижения ваших целей"
                  />
                  <USPItem 
                    icon={<Users />}
                    title="Личный подход"
                    description="Общаемся напрямую, без менеджеров"
                  />
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                className="relative"
              >
                <div className="relative aspect-square">
                  <Image 
                    src="/solution-3d.png"
                    alt="Solution"
                    fill
                    className="object-contain"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- 6. ОТЗЫВЫ --- */}
        <section className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className={`${akony.className} text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter`}>
                Что говорят <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">клиенты</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <TestimonialCard 
                name="Алексей Петров"
                business="Барбершоп «CUTS»"
                text="За 2 месяца количество онлайн-записей выросло в 3 раза! Сайт просто огонь, все клиенты в восторге."
                rating={5}
              />
              <TestimonialCard 
                name="Мария Иванова"
                business="Салон «BEAUTY»"
                text="Профессиональный подход, быстрая работа и отличный результат. Рекомендую всем своим знакомым!"
                rating={5}
              />
              <TestimonialCard 
                name="Дмитрий Сидоров"
                business="Кофейня «BREW»"
                text="Стильный сайт и настроенная реклама принесли нам в 2 раза больше клиентов. Спасибо за работу!"
                rating={5}
              />
            </div>
          </div>
        </section>

        {/* --- 7. ФОРМАТ РАБОТЫ --- */}
        <section className="py-32 px-4 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className={`${akony.className} text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter`}>
                Как мы <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">работаем</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <WorkStep 
                number="01"
                title="Знакомство"
                description="Обсуждаем ваш бизнес, цели и пожелания"
              />
              <WorkStep 
                number="02"
                title="Разработка"
                description="Создаю дизайн и функционал под ключ"
              />
              <WorkStep 
                number="03"
                title="Запуск"
                description="Настраиваю рекламу и запускаем сайт"
              />
              <WorkStep 
                number="04"
                title="Поддержка"
                description="Анализируем результаты и оптимизируем"
              />
            </div>
          </div>
        </section>

        {/* --- 8. КЕЙСЫ --- */}
        <section id="cases" className="py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className={`${akony.className} text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter`}>
                Мои <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">кейсы</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Реальные проекты с впечатляющими результатами
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cases.map((caseItem, idx) => (
                <CaseCard key={idx} {...caseItem} />
              ))}
            </div>
          </div>
        </section>

        {/* --- 9. ТАРИФЫ --- */}
        <section id="pricing" className="py-32 px-4 bg-gradient-to-b from-transparent via-pink-900/10 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className={`${akony.className} text-4xl md:text-6xl font-bold mb-6 uppercase tracking-tighter`}>
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Тарифы</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Выберите подходящий пакет услуг для вашего бизнеса
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard 
                title="Start"
                price="4 900 ₽/мес "
                features={[
                  "Персональный мобильный мини-сайт",
                  "До 3 объектов размещения",
                  "Онлайн-календарь доступности",
                  "Базовый расчёт стоимости",
                  "Форма заявки",
                  "1 месяц поддержки",
                  "Добавление до 5 доп. услуг",
                  "Базовая аналитика",
                  "Техподдержка"
                ]}
                highlighted={false}
              />
              <PricingCard 
                title="Business"
                price="60 000₽"
                features={[
                  "Многостраничный сайт",
                  "Премиум дизайн",
                  "Продвинутое SEO",
                  "Система бронирования",
                  "Настройка рекламы",
                  "3 месяца поддержки"
                ]}
                highlighted={true}
              />
              <PricingCard 
                title="Premium"
                price="100 000₽"
                features={[
                  "Полноценный сайт + CRM",
                  "Уникальный дизайн",
                  "Комплексное SEO",
                  "Интеграции с сервисами",
                  "Ведение рекламы 3 месяца",
                  "6 месяцев поддержки",
                  "Аналитика и отчеты"
                ]}
                highlighted={false}
              />
            </div>
          </div>
        </section>

        {/* --- 10. ЗАЯВКА --- */}
        <section id="contact" className="py-32 px-4">
          <div className="max-w-3xl mx-auto">
            <GlassCard depth="elevated" className="rounded-3xl p-8 md:p-12">
              <motion.div 
                variants={fadeInUp}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className={`${akony.className} text-4xl md:text-5xl font-bold mb-6 uppercase tracking-tighter`}>
                  Готовы <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">начать?</span>
                </h2>
                <p className="text-white/70 mb-12 text-lg">
                  Оставьте заявку, и я свяжусь с вами в течение 1 часа
                </p>
                
                <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
                  <GlassCard depth="base" className="rounded-2xl overflow-hidden">
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      className="w-full bg-transparent border-none px-6 py-5 text-white placeholder-white/40 focus:ring-0 outline-none text-lg"
                    />
                  </GlassCard>
                  
                  <GlassCard depth="base" className="rounded-2xl overflow-hidden">
                    <input
                      type="tel"
                      placeholder="Telegram / Телефон"
                      className="w-full bg-transparent border-none px-6 py-5 text-white placeholder-white/40 focus:ring-0 outline-none text-lg"
                    />
                  </GlassCard>

                  <GlassCard depth="base" className="rounded-2xl overflow-hidden">
                    <textarea
                      placeholder="Расскажите о вашем проекте"
                      rows={4}
                      className="w-full bg-transparent border-none px-6 py-5 text-white placeholder-white/40 focus:ring-0 outline-none text-lg resize-none"
                    />
                  </GlassCard>

                  <button className="mt-4 px-8 py-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-pink-500/30 transition-all flex items-center justify-center gap-2">
                    Отправить заявку <ArrowRight size={20} />
                  </button>
                </form>
              </motion.div>
            </GlassCard>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-white/5 bg-black/20 backdrop-blur-lg pt-16 pb-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
              <div className="col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 relative overflow-hidden rounded-lg">
                    <Image 
                      src="/logo.jpg" 
                      alt="Logo" 
                      width={32} 
                      height={32}
                      className="w-full h-full object-cover brightness-[1.2] hue-rotate-[-30deg] saturate-[1.2]"
                    />
                  </div>
                  <span className={`${akony.className} font-bold text-xl tracking-tight text-white`}>LINKALINK</span>
                </div>
                <p className="text-white/40 text-sm">
                  Создаю цифровые решения для локального бизнеса
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-6">Услуги</h4>
                <ul className="space-y-4 text-sm text-white/60">
                  <li><button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">Разработка сайтов</button></li>
                  <li><button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">Настройка рекламы</button></li>
                  <li><button onClick={() => scrollTo('services')} className="hover:text-white transition-colors">SMM продвижение</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6">Информация</h4>
                <ul className="space-y-4 text-sm text-white/60">
                  <li><button onClick={() => scrollTo('cases')} className="hover:text-white transition-colors">Кейсы</button></li>
                  <li><button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">Тарифы</button></li>
                  <li><button onClick={() => scrollTo('contact')} className="hover:text-white transition-colors">Контакты</button></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-6">Контакты</h4>
                <ul className="space-y-4 text-sm text-white/60">
                  <li className="flex items-center gap-2">
                    <Mail size={16} />
                    <a href="mailto:hello@linkalink.com" className="hover:text-white transition-colors">hello@linkalink.com</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <Instagram size={16} />
                    <a href="#" className="hover:text-white transition-colors">@linkalink</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/30 text-sm">© 2025 Linkalink. Все права защищены.</p>
              <div className="flex gap-6">
                <a href="#" className="text-white/40 hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="#" className="text-white/40 hover:text-white transition-colors">
                  <Globe size={20} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

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

function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
    >
      <GlassCard depth="elevated" hoverEffect className="p-8 rounded-3xl h-full">
        <div className="text-pink-400 mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed">{description}</p>
      </GlassCard>
    </motion.div>
  );
}

function ResultCard({ metric, description, color }: { metric: string, description: string, color: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
    >
      <GlassCard depth="elevated" className="p-8 rounded-3xl text-center h-full">
        <div className={`text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {metric}
        </div>
        <p className="text-white/60 text-sm leading-relaxed">{description}</p>
      </GlassCard>
    </motion.div>
  );
}

function ClientType({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
    >
      <GlassCard depth="elevated" hoverEffect className="p-8 rounded-3xl text-center h-full flex flex-col items-center justify-center gap-4">
        <div className="text-purple-400">{icon}</div>
        <h3 className="font-bold text-lg">{title}</h3>
      </GlassCard>
    </motion.div>
  );
}

function USPItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center text-pink-400">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-lg mb-1">{title}</h4>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({ name, business, text, rating }: { name: string, business: string, text: string, rating: number }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
    >
      <GlassCard depth="elevated" className="p-8 rounded-3xl h-full flex flex-col">
        <div className="flex gap-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
          ))}
        </div>
        <p className="text-white/80 mb-6 flex-grow leading-relaxed">{text}</p>
        <div>
          <div className="font-bold">{name}</div>
          <div className="text-white/50 text-sm">{business}</div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function WorkStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="text-6xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
        {number}
      </div>
      <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

function CaseCard({ title, category, description, image, link, stats }: { 
  title: string, 
  category: string, 
  description: string, 
  image: string, 
  link: string,
  stats: { growth: string, metric: string }
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
    >
      <a href={link} target="_blank" rel="noopener noreferrer" className="block group">
        <GlassCard depth="elevated" className="rounded-3xl overflow-hidden h-full transition-all duration-500 group-hover:scale-[1.02]">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image 
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Stats Overlay */}
            <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp size={20} className="text-green-400" />
                <span className="font-bold text-lg">{stats.growth}</span>
                <span className="text-sm text-white/80">{stats.metric}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">{category}</span>
              <ExternalLink size={16} className="text-white/40 group-hover:text-pink-400 transition-colors" />
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-pink-400 transition-colors">{title}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          </div>
        </GlassCard>
      </a>
    </motion.div>
  );
}

function PricingCard({ title, price, features, highlighted }: { 
  title: string, 
  price: string, 
  features: string[], 
  highlighted: boolean 
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
    >
      <GlassCard 
        depth={highlighted ? "floating" : "elevated"} 
        className={`p-8 rounded-3xl h-full flex flex-col ${highlighted ? 'border-2 border-pink-500/50' : ''}`}
      >
        {highlighted && (
          <div className="mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold uppercase tracking-wider text-center">
            Популярный
          </div>
        )}
        
        <h3 className="text-2xl font-bold mb-2 uppercase tracking-tight">{title}</h3>
        <div className="text-4xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          {price}
        </div>
        
        <ul className="space-y-4 mb-8 flex-grow">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check size={20} className="text-green-400 shrink-0 mt-0.5" />
              <span className="text-white/70 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
        
        <button 
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className={`w-full py-4 rounded-2xl font-bold transition-all ${
            highlighted 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/30' 
              : 'border-2 border-white/20 text-white hover:bg-white/10'
          }`}
        >
          Выбрать тариф
        </button>
      </GlassCard>
    </motion.div>
  );
}

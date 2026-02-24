"use client";

import Link from "next/link";
import { useState } from "react";
import localFont from "next/font/local";
import Image from "next/image";
import { 
  ArrowRight, Menu, X, Check, Star, Coffee, Scissors, TrendingUp,
  Users, Target, Zap, Clock, BarChart, Palette, Code, Wrench, Camera, 
  Briefcase, Building, Globe, Loader2, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import React from "react";
import AnalyticsTracker from '@/components/AnalyticsTracker'

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
    base: 'bg-white/40 backdrop-blur-sm border border-gray-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
    elevated: 'bg-white/400 backdrop-blur-md border border-gray-200/70 shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
    floating: 'bg-white/60 backdrop-blur-lg border border-gray-200/80 shadow-[0_16px_48px_rgba(0,0,0,0.4)]',
    nav: 'bg-white/[0.03] backdrop-blur-xl border-b border-gray-200/60 shadow-lg',
  };

  const hoverStyles = hoverEffect
    ? 'hover:bg-white/60 hover:border-gray-300 hover:shadow-[0_16px_48px_rgba(0,0,0,0.4)] hover:-translate-y-1 cursor-pointer transition-all duration-500'
    : '';

  return (
    <div className={`relative overflow-hidden transition-all duration-300 ease-out ${depthStyles[depth]} ${hoverStyles} ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-30" />
      {children}
    </div>
  );
}

// --- КОМПОНЕНТЫ ---
function MobileMenuItem({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className="text-left px-6 py-4 text-gray-700 hover:text-gray-900 hover:bg-white/60 rounded-2xl transition-colors text-sm font-medium"
    >
      {text}
    </button>
  );
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  // Маска телефона
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, "");
    if (input.startsWith("7") || input.startsWith("8")) input = input.slice(1);
    if (input.length > 10) input = input.slice(0, 10);
    let f = "";
    if (input.length > 0) f = "+7";
    if (input.length > 0) f += " (" + input.slice(0, 3);
    if (input.length >= 4) f += ") " + input.slice(3, 6);
    if (input.length >= 7) f += "-" + input.slice(6, 8);
    if (input.length >= 9) f += "-" + input.slice(8, 10);
    setContactForm(prev => ({ ...prev, phone: f }));
  };

  const isPhoneValid = contactForm.phone.length === 18;

  // Отправка заявки в Telegram
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !isPhoneValid) return;

    setLoading(true);
    
    try {
      await fetch("/api/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: "linkalink-main",
          service: "Заявка с главной страницы",
          master: contactForm.message || "Сообщение не указано",
          date: new Date().toLocaleDateString('ru-RU'),
          time: new Date().toLocaleTimeString('ru-RU'),
          clientName: contactForm.name,
          clientPhone: contactForm.phone
        }),
      });

      setSuccess(true);
      setContactForm({ name: "", phone: "", message: "" });
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("Ошибка отправки заявки. Попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  // Данные для кейсов
  const cases = [
    {
      title: "Барбершоп «ELEGANT»",
      category: "Барбершоп",
      description: "Современный сайт с онлайн-записью и галереей работ",
      image: "/barb.jpg",
      link: "/elegant-barbershop",  
      stats: { growth: "+180%", metric: "записей онлайн" }
    },
    {
      title: "Глэмпинг «FOREST GLAMP»",
      category: "Отдых",
      description: "Стильный landing с бронированием и доставкой",
      image: "/glamp.jpg",
      link: "/forest-glamp",
      stats: { growth: "+250%", metric: "заказов в месяц" }
    }
  ];

  return (
      <div className="min-h-screen w-full relative text-gray-900 selection:bg-blue-500/20 overflow-x-hidden">
        <AnalyticsTracker page="landing" />
      
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 z-0 bg-white">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/15 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-teal-400/15 blur-[100px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[600px] h-[600px] rounded-full bg-purple-400/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-400/15 blur-[120px]" />

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
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 relative overflow-hidden rounded-lg">
                  <Image 
                    src="/logo.png" 
                    alt="Logo" 
                    width={40} 
                    height={40}
                    className="w-full h-full object-cover brightness-[1.2] hue-rotate-[-30deg] saturate-[1.2]"
                    unoptimized
                  />
                </div>
                <span className={`${akony.className} font-bold text-xl tracking-tight text-gray-900`}>LINKALINK</span>
              </div>
              
              <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
                <button onClick={() => scrollTo('services')} className="hover:text-gray-900 transition-colors">Услуги</button>
                <button onClick={() => scrollTo('results')} className="hover:text-gray-900 transition-colors">Результаты</button>
                <button onClick={() => scrollTo('cases')} className="hover:text-gray-900 transition-colors">Кейсы</button>
                <button onClick={() => scrollTo('pricing')} className="hover:text-gray-900 transition-colors">Тарифы</button>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => scrollTo('contact')}
                  className="hidden md:block bg-gradient-to-r from-blue-500 to-teal-600 text-gray-900 px-6 py-2 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                >
                  Оставить заявку
                </button>
                <button className="md:hidden text-gray-700 hover:text-gray-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </GlassCard>

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
                      className="mt-2 w-full py-4 bg-gradient-to-r from-blue-500 to-teal-600 text-gray-900 font-bold rounded-2xl uppercase tracking-widest text-xs"
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
        <section className="relative min-h-[100vh] flex items-center pt-20 pb-8 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            
            {/* Left Content */}
            <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left">
              <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${akony.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-3 leading-[0.95] uppercase tracking-tighter`}
              >
                Одна ссылка, которая<br />
                <motion.span 
                  className="bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 bg-clip-text text-transparent inline-block"
                  style={{ backgroundSize: '200% 200%' }}
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  решает все
                </motion.span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg lg:text-xl text-gray-600 mb-4 max-w-lg leading-relaxed"
              >
                Создаю стильные сайты для локального бизнеса с интегрированной системой онлайн-записи.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mb-6"
              >
                <motion.button 
                  onClick={() => scrollTo('contact')}
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-600 rounded-2xl font-bold text-gray-900 text-sm overflow-hidden shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Обсудить проект <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.button>
                <motion.button 
                  onClick={() => scrollTo('cases')}
                  className="px-6 py-3 rounded-2xl font-bold text-gray-900 text-sm border-2 border-gray-300 hover:bg-white/70 transition-all"
                  whileHover={{ scale: 1.05, borderColor: "rgba(255, 255, 255, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Смотреть кейсы
                </motion.button>
              </motion.div>

              {/* Stats - БЕЗ АНИМАЦИИ СЧЕТЧИКОВ */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-4 lg:gap-6 w-full max-w-md lg:max-w-none"
              >
                {[
                  { value: "+47%", label: "Конверсии", gradient: "from-blue-500 to-purple-500" },
                  { value: "2,5x", label: "Рост продаж", gradient: "from-purple-400 to-cyan-400" },
                  { value: "24/7", label: "Поддержка", gradient: "from-teal-500 to-blue-500" }
                ].map((item, i) => (
                  <div key={i} className="text-center lg:text-left">
                    <div className={`text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent mb-1`}>
                      {item.value}
                    </div>
                    <div className="text-gray-400 text-xs md:text-sm">
                      {item.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right - Phone Mockup С ПЛАВАЮЩЕЙ АНИМАЦИЕЙ */}
            <div className="relative hidden lg:flex justify-center lg:justify-end mt-8 lg:mt-0">
              <motion.div 
                className="relative w-full max-w-[280px] sm:max-w-xs lg:max-w-sm"
                initial={{ opacity: 0, y: 50, rotate: -10 }}  // Добавлен rotate: -5
                animate={{ 
                  opacity: 1, 
                  y: [0, -20, 0],
                  rotate: [-10, -7, -10]  // Добавлена анимация наклона
                }}
                transition={{ 
                  opacity: { duration: 1, delay: 0.3 },
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: {  // Добавлен transition для rotate
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div 
                  className="absolute -inset-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl scale-110"
                  animate={{
                    scale: [1.1, 1.25, 1.1],  // Увеличен scale до 1.25
                    opacity: [0.2, 0.4, 0.2]  // Уменьшена яркость
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className="absolute -inset-20 bg-gradient-to-b from-teal-500/15 to-transparent blur-3xl" />
                
                <motion.div 
                  className="relative z-10"
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <GlassCard depth="floating" className="rounded-[2.5rem] lg:rounded-[3rem] p-2 lg:p-3 shadow-2xl">
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden">
                      <div className="relative aspect-[9/19]">
                        <Image 
                          src="/mok.png"
                          alt="Phone mockup"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        
                        <div className="absolute inset-0 p-4 lg:p-8 flex flex-col justify-between">
                          <div className="flex justify-between items-center">
                            <div className="text-[10px] lg:text-xs text-gray-700">9:41</div>
                            <div className="flex gap-0.5 lg:gap-1">
                              <div className="w-0.5 h-0.5 lg:w-1 lg:h-1 rounded-full bg-white/80" />
                              <div className="w-0.5 h-0.5 lg:w-1 lg:h-1 rounded-full bg-white/80" />
                              <div className="w-0.5 h-0.5 lg:w-1 lg:h-1 rounded-full bg-white/80" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- 2. УСЛУГИ --- */}
        <section id="services" className="py-16 md:py-24 lg:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16 lg:mb-20"
            >
              <h2 className={`${akony.className} text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 uppercase tracking-tighter`}>
                Что я <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">предлагаю</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto px-4">
                Полный спектр услуг для вывода вашего бизнеса в онлайн
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              <ServiceCard 
                icon={<Code size={32} />}
                title="Создание цифровой бизнес-страницы"
                description="Современные адаптивный сайт с индивидуальным дизайном под ваш тип бизнеса с удобным управлением"
              />
              <ServiceCard 
                icon={<Target size={32} />}
                title="Интеграции"
                description="Подключение онлайн-записи, онлайн-оплаты, мессенджеров и др сервисов для автоматизации процессов"
              />
              <ServiceCard 
                icon={<Palette size={32} />}
                title="Брендинг и дизайн"
                description="Создание уникального визуального стиля, который выделит ваш бизнес среди конкурентов"
              />
              <ServiceCard 
                icon={<BarChart size={32} />}
                title="Аналитика"
                description="Анализ поведения клиентов, улучшение кликабельности, настройка структуры, стратегические консультации"
              />
              <ServiceCard 
                icon={<Zap size={32} />}
                title="Ежемесячное сопровождение"
                description="Обновление цен, услуг, акций, оптимизация структуры и конверсии"
              />
              <ServiceCard 
                icon={<Clock size={32} />}
                title="Техподдержка"
                description="Круглосуточная поддержка, обновления и консультации по всем вопросам"
              />
            </div>
          </div>
        </section>

        {/* --- 3. РЕЗУЛЬТАТЫ (БЕЗ АНИМАЦИИ СЧЕТЧИКОВ) --- */}
        <section id="results" className="py-16 md:py-24 lg:py-32 px-4 bg-gradient-to-b from-transparent via-blue-50 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16 lg:mb-20"
            >
              <h2 className={`${akony.className} text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 uppercase tracking-tighter`}>
                Каких результатов <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">можно достичь</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto px-4">
                Реальные показатели роста бизнеса моих клиентов
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              <ResultCard 
                metric="20-30%"
                description="Именно на столько в среднем увеличивается количество записей за первые 3 месяца"
                color="from-blue-500 to-purple-500"
              />
              <ResultCard 
                metric="до 28%"
                description="Экономия времени персонала благодаря автоматизации записи"
                color="from-purple-500 to-teal-500"
              />
              <ResultCard 
                metric="до 22%"
                description="Снижение потери клиентов из-за ожидания ответа"
                color="from-teal-500 to-green-500"
              />
              <ResultCard 
                metric="+8-15%"
                description="Повышение среднего чека за счет дополнительных услуг"
                color="from-green-500 to-blue-500"
              />
            </div>
          </div>
        </section>

        {/* --- 4. С КЕМ РАБОТАЮ --- */}
        <section id="clients" className="py-16 md:py-24 lg:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16 lg:mb-20"
            >
              <h2 className={`${akony.className} text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 uppercase tracking-tighter`}>
                С кем я <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">работаю</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto px-4">
                Специализируюсь на локальных бизнесах в сфере услуг
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <ClientType icon={<Scissors size={40} />} title="Барбершопы" />
              <ClientType icon={<Star size={40} />} title="Салоны красоты" />
              <ClientType icon={<Coffee size={40} />} title="Кофейни" />
              <ClientType icon={<Wrench size={40} />} title="Автосервисы" />
              <ClientType icon={<Camera size={40} />} title="Студии" />
              <ClientType icon={<Briefcase size={40} />} title="Эксперты" />
              <ClientType icon={<Building size={40} />} title="Мини-отели и глэмпинги" />
              <ClientType icon={<Globe size={40} />} title="Другие бизнесы" />
            </div>
          </div>
        </section>

        {/* --- 5. УТП --- */}
        <section className="py-16 md:py-24 lg:py-32 px-4 bg-gradient-to-b from-transparent via-purple-50 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
              <motion.div
                variants={fadeInUp}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
              >
                <h2 className={`${akony.className} text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 uppercase tracking-wide`}>
                  Linkalink - <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">не просто ссылка</span>
                </h2>
                <p className="text-gray-600 text-base md:text-lg mb-6 md:mb-8 leading-relaxed">
                  Это персональная цифровая точка входа, которая превращает посетителей в клиентов. Я создаю и сопровождаю бизнес-страницу, которая работает на вас 24/7.
                </p>

                <div className="space-y-4 md:space-y-6">
                  <USPItem 
                    icon={<Users size={24} />}
                    title="Привлекает больше клиентов"
                    description="Онлайн-запись работает круглосуточно, не теряя ни одной заявки"
                  />
                  <USPItem 
                    icon={<Clock size={24} />}
                    title="Экономит время"
                    description="Клиенты сами выбирают удобное время, освобождая администратора"
                  />
                  <USPItem 
                    icon={<TrendingUp size={24} />}
                    title="Увеличивает продажи"
                    description="Интеграция с CRM и аналитикой для роста среднего чека"
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
                <GlassCard depth="floating" className="p-6 md:p-8 lg:p-12 rounded-3xl">
                  <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center text-blue-500">
                        <Check size={24} />
                      </div>
                      <span className="text-base md:text-lg font-medium">Современный дизайн</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-teal-400/20 flex items-center justify-center text-purple-500">
                        <Check size={24} />
                      </div>
                      <span className="text-base md:text-lg font-medium">Адаптивная верстка</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-teal-400/20 to-green-400/20 flex items-center justify-center text-teal-500">
                        <Check size={24} />
                      </div>
                      <span className="text-base md:text-lg font-medium">Быстрая загрузка</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-blue-400/20 flex items-center justify-center text-green-500">
                        <Check size={24} />
                      </div>
                      <span className="text-base md:text-lg font-medium">SEO оптимизация</span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- 6. КЕЙСЫ --- */}
        <section id="cases" className="py-16 md:py-24 lg:py-32 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16 lg:mb-20"
            >
              <h2 className={`${akony.className} text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 uppercase tracking-tighter`}>
                Мои <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">работы</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto px-4">
                Примеры реализованных проектов для локальных бизнесов
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {cases.map((caseItem, index) => (
                <CaseCard key={index} {...caseItem} />
              ))}
            </div>
          </div>
        </section>

        {/* --- 7. ТАРИФЫ --- */}
        <section id="pricing" className="py-16 md:py-24 lg:py-32 px-4 bg-gradient-to-b from-transparent via-blue-50 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16 lg:mb-20"
            >
              <h2 className={`${akony.className} text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 uppercase tracking-tighter`}>
                Выберите свой <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">тариф</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto px-4">
                Прозрачные цены без скрытых платежей
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <PricingCard 
                title="Старт"
                price="2999₽/мес"
                setupPrice="4 000₽"
                features={[
                  "Создание персональной бизнес-страницы",
                  "Блок услуг и прайс",
                  "Переход в мессенджеры",
                  "До 3 правок в месяц",
                  "Техподдержка 5/2"
                ]}
                highlighted={false}
              />
              <PricingCard 
                title="Рост"
                price="4 499₽/мес"
                setupPrice="4 500₽"
                features={[
                  "Всё из тарифа «Старт»",
                  "Правки по индивидуальному дизайну",
                  "Блок акций и спецпредложений",
                  "Telegram-уведомления",
                  "Фото-галерея работ",
                  "До 7 правок в месяц",
                  "Приоритетная поддержка",
                  "Техподдержка 24/7"
                ]}
                highlighted={true}
              />
              <PricingCard 
                title="Партнер"
                price="6 499₽/мес"
                setupPrice="5 000₽"
                features={[
                  "Всё из тарифа «Рост»",
                  "Регулярная оптимизация",
                  "Telegram-бот для управления",
                  "Неограниченные правки",
                  "Приоритетная поддержка",
                ]}
                highlighted={false}
              />
            </div>
          </div>
        </section>

        {/* --- 8. ФОРМА КОНТАКТА --- */}
        <section id="contact" className="py-16 md:py-24 lg:py-32 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className={`${akony.className} text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 uppercase tracking-tighter`}>
                Оставьте <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">заявку</span>
              </h2>
              <p className="text-gray-500 text-base md:text-lg">
                Свяжусь с вами в течение часа и обсудим ваш проект
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
            >
              <GlassCard depth="elevated" className="p-6 md:p-8 lg:p-12 rounded-3xl">
                {success ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle size={80} className="text-green-500 mb-6" />
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">Заявка отправлена!</h3>
                    <p className="text-gray-500 text-sm md:text-base">
                      Спасибо за обращение. Свяжусь с вами в ближайшее время.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-4 md:space-y-6">
                    <div>
                      <input
                        type="text"
                        placeholder="Ваше имя"
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/40 border border-gray-200/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-colors text-sm md:text-base"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="+7 (___) ___-__-__"
                        value={contactForm.phone}
                        onChange={handlePhoneChange}
                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/40 border border-gray-200/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-colors text-sm md:text-base"
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Расскажите о вашем проекте (необязательно)"
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        rows={4}
                        className="w-full px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-white/40 border border-gray-200/80 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-pink-500/50 transition-colors resize-none text-sm md:text-base"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!contactForm.name || !isPhoneValid || loading}
                      className="w-full py-3 md:py-4 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-500 to-teal-600 text-gray-900 font-bold text-sm md:text-base uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Отправка...
                        </>
                      ) : (
                        'Отправить заявку'
                      )}
                    </button>
                    <p className="text-center text-gray-400 text-xs">
                      Нажимая на кнопку, вы соглашаетесь с условиями{' '}
                      <a href="#" className="underline hover:text-gray-600 transition-colors">
                        политики конфиденциальности
                      </a>
                    </p>
                  </form>
                )}
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="py-8 md:py-12 px-4 border-t border-white/5">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-900/40 text-xs md:text-sm">
              © 2024 Linkalink. Все права защищены.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
    >
      <GlassCard depth="elevated" hoverEffect className="p-6 md:p-8 rounded-2xl md:rounded-3xl h-full">
        <div className="text-purple-500 mb-4">
          {icon}
        </div>
        <h3 className="font-bold text-lg md:text-xl mb-3">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
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
      <GlassCard depth="elevated" className="p-6 md:p-8 rounded-2xl md:rounded-3xl text-center h-full flex flex-col justify-center">
        <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-3 md:mb-4`}>
          {metric}
        </div>
        <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
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
      <GlassCard depth="base" hoverEffect className="p-6 md:p-8 rounded-2xl md:rounded-3xl flex flex-col items-center text-center gap-3 md:gap-4 h-full">
        <div className="text-purple-500">
          {icon}
        </div>
        <h3 className="font-bold text-base md:text-lg">{title}</h3>
      </GlassCard>
    </motion.div>
  );
}

function USPItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex gap-3 md:gap-4 items-start">
      <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 flex items-center justify-center text-blue-500">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-base md:text-lg mb-1">{title}</h4>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
    </div>
  );
}

function CaseCard({ title, category, description, image, link }: { 
  title: string, 
  category: string, 
  description: string, 
  image: string, 
  link: string
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      whileHover={{ y: -10, scale: 1.02 }}
      viewport={{ once: true }}
    >
      <Link href={link} className="block group">
        <GlassCard depth="elevated" className="rounded-2xl md:rounded-3xl overflow-hidden h-full">
          <div className="relative aspect-[4/3] overflow-hidden">
            <motion.div
              whileHover={{ scale: 1.15 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <Image 
                src={image}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
            </motion.div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>

          <div className="p-4 md:p-6">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">{category}</span>
            <h3 className="text-lg md:text-xl font-bold mt-2 mb-2 group-hover:text-blue-500 transition-colors">{title}</h3>
            <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{description}</p>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  );
}

function PricingCard({ title, price, setupPrice, features, highlighted }: { 
  title: string, 
  price: string,
  setupPrice?: string,
  features: string[], 
  highlighted: boolean 
}) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      whileInView="whileInView"
      whileHover={highlighted ? { scale: 1.06, y: -10 } : { scale: 1.03, y: -6 }}
      transition={{ type: "spring", stiffness: 200 }}
      viewport={{ once: true }}
    >
      <GlassCard 
        depth={highlighted ? "floating" : "elevated"} 
        hoverEffect
        className={`p-6 md:p-8 rounded-2xl md:rounded-3xl h-full flex flex-col ${highlighted ? 'border-2 border-pink-500/50' : ''}`}
      >
        {highlighted && (
          <div className="mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-teal-600 text-gray-900 text-xs font-bold uppercase tracking-wider text-center">
            Популярный
          </div>
        )}
        
        <h3 className="text-xl md:text-2xl font-bold mb-2 uppercase tracking-tight">{title}</h3>
        <div className="mb-2">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            {price}
          </div>
          {setupPrice && (
            <div className="text-xs md:text-sm text-gray-400 mt-2">
              + {setupPrice} единоразовая настройка
            </div>
          )}
        </div>

        <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8 flex-grow">
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-2 md:gap-3"
            >
              <Check size={18} className="text-green-500 shrink-0 mt-0.5 md:w-5 md:h-5" />
              <span className="text-gray-600 text-xs md:text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>
        
        <button 
          onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-sm md:text-base transition-all ${
            highlighted 
              ? 'bg-gradient-to-r from-blue-500 to-teal-600 text-gray-900 hover:shadow-lg hover:shadow-blue-500/20' 
              : 'border-2 border-gray-300 text-gray-900 hover:bg-white/70'
          }`}
        >
          Выбрать тариф
        </button>
      </GlassCard>
    </motion.div>
  );
}
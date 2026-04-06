import { Link } from "react-router-dom";
import { LogoIcon } from "@/components";
import { motion } from "motion/react";
import { SHOP } from "@/constants/shopConstants";
import type { IconType } from "react-icons";

interface FeatureItem {
  icon: IconType;
  title: string;
  desc: string;
}

interface AuthLayoutProps {
  children: React.ReactNode;
  /** All gradient classes for the left hero panel (light + dark), e.g. "from-purple-700 via-purple-600 to-blue-600 dark:from-purple-950 dark:via-slate-900 dark:to-blue-950" */
  heroGradient: string;
  /** Accent blob color class, e.g. "bg-blue-400/10" */
  accentBlobClass?: string;
  /** Title displayed on the left panel */
  heroTitle: React.ReactNode;
  /** Subtitle displayed on the left panel */
  heroSubtitle: string;
  /** Feature/tip items for the left panel */
  features: FeatureItem[];
  /** Gradient for mobile logo button, e.g. "from-purple-600 to-blue-600" */
  mobileLogoGradient: string;
  /** Shadow color for mobile logo, e.g. "shadow-purple-500/30" */
  mobileLogoShadow?: string;
}

export default function AuthLayout({
  children,
  heroGradient,
  accentBlobClass = "bg-blue-400/10",
  heroTitle,
  heroSubtitle,
  features,
  mobileLogoGradient,
  mobileLogoShadow = "shadow-purple-500/30",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-3 sm:p-4">
      <div className="w-full max-w-[1400px] lg:grid lg:grid-cols-2 lg:gap-4">
        {/*  Left Hero Panel  */}
        <div
          className={`hidden lg:block relative bg-gradient-to-br ${heroGradient} text-white rounded-[3rem] overflow-hidden shadow-2xl`}
        >
          <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-white/5 rounded-full blur-3xl" />
          <div
            className={`absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] ${accentBlobClass} rounded-full blur-3xl`}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-purple-400/10 rounded-full blur-3xl" />

          <div className="relative z-10 h-full flex flex-col justify-center p-16 xl:p-20">
            {/* Logo */}
            <div className="mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-4 hover:scale-105 transition-transform"
              >
                <LogoIcon
                  size="md"
                  containerClassName="bg-white/20 backdrop-blur-sm shadow-none"
                />
                <span className="text-3xl font-bold">{SHOP.name}</span>
              </Link>
            </div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl xl:text-6xl font-bold leading-tight mb-6"
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-white/80 mb-10 leading-relaxed"
            >
              {heroSubtitle}
            </motion.p>

            {/* Features */}
            <div className="space-y-6">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-5"
                >
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shrink-0">
                    <f.icon className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{f.title}</h3>
                    <p className="text-white/70 text-sm mt-1">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/*  Right Form Panel  */}
        <div className="flex items-center justify-center lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-[680px] bg-white dark:bg-slate-800 p-6 sm:p-10 lg:p-16 rounded-[1.75rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-center gap-6 sm:gap-10 h-full"
          >
            {/* Mobile Logo */}
            <div className="text-center lg:hidden mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-3 justify-center hover:scale-105 transition-transform"
              >
                <LogoIcon
                  size="lg"
                  containerClassName={`bg-gradient-to-br ${mobileLogoGradient} ${mobileLogoShadow}`}
                />
              </Link>
            </div>

            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

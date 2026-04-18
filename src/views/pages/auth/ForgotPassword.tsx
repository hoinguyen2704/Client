import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiArrowRight, FiCheckCircle, FiShield, FiLock, FiKey } from 'react-icons/fi';
import { motion } from 'motion/react';
import { Trans, useTranslation } from 'react-i18next';
import AuthLayout from './AuthLayout';

export default function ForgotPassword() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const tips = [
    { icon: FiShield, title: t('forgotPassword.tips.spam.title'), desc: t('forgotPassword.tips.spam.desc') },
    { icon: FiLock, title: t('forgotPassword.tips.strongPassword.title'), desc: t('forgotPassword.tips.strongPassword.desc') },
    { icon: FiKey, title: t('forgotPassword.tips.privatePassword.title'), desc: t('forgotPassword.tips.privatePassword.desc') },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <AuthLayout
      heroGradient="from-emerald-700 via-teal-600 to-blue-600 dark:from-emerald-950 dark:via-slate-900 dark:to-blue-950"
      accentBlobClass="bg-teal-400/10"
      heroTitle={(
        <Trans
          ns="auth"
          i18nKey="forgotPassword.heroTitle"
          components={{
            highlight: <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-emerald-300" />,
          }}
        />
      )}
      heroSubtitle={t('forgotPassword.heroSubtitle')}
      features={tips}
      mobileLogoGradient="from-emerald-600 to-teal-600"
      mobileLogoShadow="shadow-emerald-500/30"
    >
      <div className="text-center lg:text-left">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
          {t('forgotPassword.title')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">
          {t('forgotPassword.subtitle')}
        </p>
      </div>

      {!isSubmitted ? (
        <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
          <div>
            <label className="block text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 mb-2 sm:mb-3 ml-2">
              {t('forgotPassword.identifierLabel')}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FiMail className="text-slate-400 group-focus-within:text-purple-500 transition-colors text-xl sm:text-2xl" />
              </div>
              <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 text-base sm:text-xl border border-slate-200/80 dark:border-slate-600/80 rounded-2xl bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                placeholder={t('forgotPassword.identifierPlaceholder')} />
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
            className="group relative w-full flex justify-center items-center py-4 sm:py-5 px-6 sm:px-8 text-lg sm:text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 mt-6"
          >
            {t('forgotPassword.submit')} <FiArrowRight className="ml-3 h-6 w-6 sm:h-7 sm:w-7 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </form>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10">
          <div className="mx-auto flex items-center justify-center h-28 w-28 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-8">
            <FiCheckCircle className="h-14 w-14 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {t('forgotPassword.successTitle')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg mb-10">
            <Trans
              ns="auth"
              i18nKey="forgotPassword.successDescription"
              values={{ email }}
              components={{
                highlight: <span className="font-semibold text-slate-700 dark:text-slate-300" />,
              }}
            />
          </p>
          <button onClick={() => setIsSubmitted(false)} className="text-base sm:text-lg font-semibold text-purple-600 hover:text-purple-500 transition-colors">
            {t('forgotPassword.retry')}
          </button>
        </motion.div>
      )}

      <div className="text-center pt-4">
        <Link to="/login" className="inline-flex items-center text-base sm:text-lg font-semibold text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          <FiArrowLeft className="mr-3 h-5 w-5 sm:h-6 sm:w-6" /> {t('forgotPassword.backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  );
}

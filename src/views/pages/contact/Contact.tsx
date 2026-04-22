import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button, FormInput, FormTextarea } from '@/components';
import { toast } from 'sonner';
import ticketService from '@/apis/services/ticketService';
import { getApiErrorMessage } from '@/utils/error';
import { SHOP } from '@/constants/shopConstants';

export default function Contact() {
  const { t } = useTranslation(['about', 'common']);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const translate = (key: string, options?: Record<string, unknown>) =>
    String(t(key, options as never));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await ticketService.submitContact(formData);
      toast.success(t('contactPage.toasts.success', { ns: 'about' }));
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, translate, 'common:errors.contactSubmitFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 py-8 sm:py-10 md:py-12">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            {t('contactPage.title', { ns: 'about' })}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
          >
            {t('contactPage.description', { ns: 'about', shopName: SHOP.name })}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-xl font-bold mb-6">{t('contactPage.contactInfoTitle', { ns: 'about' })}</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <FiMapPin className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{t('contactPage.addressLabel', { ns: 'about' })}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-md">{SHOP.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <FiPhone className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{t('contactPage.phoneLabel', { ns: 'about' })}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-md">{SHOP.hotline} ({t('contactPage.support247', { ns: 'about' })})</p>
                    <p className="text-slate-500 dark:text-slate-400 text-md">{SHOP.hotline} ({t('contactPage.messagingApps', { ns: 'about' })})</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <FiMail className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{t('contactPage.emailLabel', { ns: 'about' })}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-md">{SHOP.email}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-md">{SHOP.supportEmail}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 flex-shrink-0">
                    <FiClock className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{t('contactPage.hoursLabel', { ns: 'about' })}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-md">{t('contactPage.weekdayHours', { ns: 'about' })}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-md">{t('contactPage.weekendHours', { ns: 'about' })}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <h3 className="text-2xl font-bold mb-6">{t('contactPage.formTitle', { ns: 'about' })}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label={t('contactPage.form.nameLabel', { ns: 'about' })}
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    inputClassName="h-12"
                    placeholder={t('contactPage.form.namePlaceholder', { ns: 'about' })}
                  />
                  <FormInput
                    label={t('contactPage.form.emailLabel', { ns: 'about' })}
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    inputClassName="h-12"
                    placeholder={t('contactPage.form.emailPlaceholder', { ns: 'about' })}
                  />

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput
                    label={t('contactPage.form.phoneLabel', { ns: 'about' })}
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    inputClassName="h-12"
                    placeholder={t('contactPage.form.phonePlaceholder', { ns: 'about' })}
                  />
                  <FormInput
                    label={t('contactPage.form.subjectLabel', { ns: 'about' })}
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    inputClassName="h-12"
                    placeholder={t('contactPage.form.subjectPlaceholder', { ns: 'about' })}
                  />

                </div>

                <FormTextarea
                  label={t('contactPage.form.messageLabel', { ns: 'about' })}
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder={t('contactPage.form.messagePlaceholder', { ns: 'about' })}
                />

                <Button
                  type="submit"
                  size="lg"
                  icon={<FiSend />}
                  className="w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? t('contactPage.form.sending', { ns: 'about' }) : t('contactPage.form.submit', { ns: 'about' })}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

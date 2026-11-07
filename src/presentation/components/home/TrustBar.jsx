import { useMemo } from 'react';
import { HiOutlineShieldCheck, HiOutlineTruck, HiOutlineSparkles, HiOutlineCheckBadge } from 'react-icons/hi2';
import { useLanguage } from '@/presentation/context/LanguageContext.jsx';

export default function TrustBar() {
    const { t } = useLanguage();

    const items = useMemo(
        () => [
            {
                icon: HiOutlineCheckBadge,
                title: t('trustBar.t1_title'),
                text: t('trustBar.t1_desc'),
            },
            {
                icon: HiOutlineTruck,
                title: t('trustBar.t2_title'),
                text: t('trustBar.t2_desc'),
            },
            {
                icon: HiOutlineSparkles,
                title: t('trustBar.t3_title'),
                text: t('trustBar.t3_desc'),
            },
            {
                icon: HiOutlineShieldCheck,
                title: t('trustBar.t4_title'),
                text: t('trustBar.t4_desc'),
            },
        ],
        [t],
    );

    return (
        <section className="border-b border-cream bg-white">
            <ul className="container-luxe grid grid-cols-2 gap-3 py-6 sm:py-8 lg:grid-cols-4 lg:gap-6">
                {items.map(({ icon: Icon, title, text }) => (
                    <li
                        key={title}
                        className="group flex items-center gap-3.5 rounded-xl p-2.5 transition-all duration-300 hover:bg-cream-light/70 hover:-translate-y-1 hover:shadow-sm"
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-wine/10 transition-all duration-300 group-hover:bg-brand-wine group-hover:scale-110">
                            <Icon className="h-6 w-6 text-brand-wine transition-colors duration-300 group-hover:text-white" />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink transition-colors duration-300 group-hover:text-brand-wine">
                                {title}
                            </p>
                            <p className="text-xs text-taupe">{text}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

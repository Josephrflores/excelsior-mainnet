'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Coins, ArrowRight, FileText } from 'lucide-react';
// @ts-ignore
import TokenomicsChart from '@/components/TokenomicsChart';
import { LiveStats } from '@/components/LiveStats';

import { Hero } from '@/components/Hero';

export default function HomePage() {
  const t = useTranslations('HomePage');

  // Data matching the pie charts in the screenshot
  const excelsiorData = [
    { name: 'Central Vault', value: 60, color: '#6366f1' },
    { name: 'Holding', value: 20, color: '#f59e0b' },
    { name: 'Operations', value: 10, color: '#10b981' },
    { name: 'Founder Lock', value: 9, color: '#3b82f6' },
    { name: 'Personal', value: 1, color: '#14b8a6' },
  ];

  const luxorData = [
    { name: 'Public Liquidity', value: 60, color: '#8b5cf6' },
    { name: 'Holding', value: 20, color: '#f59e0b' },
    { name: 'Operations', value: 10, color: '#10b981' },
    { name: 'Founder Lock', value: 9, color: '#3b82f6' },
    { name: 'Personal', value: 1, color: '#14b8a6' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#020617]">
      <Hero
        eyebrow="ESTUDIA | VIAJA | DISFRUTA"
        title={t('title')}
        subtitle={t.rich('subtitle', {
          strong: (chunks) => chunks
        }) as string}
        ctaText={t('cta_main')}
        ctaLink="/luxor"
      />

      {/* 3 Main Features Cards */}
      <section className="py-10 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<ShieldCheck className="text-blue-500" size={32} />}
            title={t('features.reserve.title')}
            description={t('features.reserve.description')}
          />
          <FeatureCard
            icon={<Coins className="text-emerald-500" size={32} />}
            title={t('features.liquidity.title')}
            description={t('features.liquidity.description')}
          />
          <FeatureCard
            icon={<Zap className="text-yellow-500" size={32} />}
            title={t('features.speed.title')}
            description={t('features.speed.description')}
          />
        </div>
      </section>

      {/* Allocation / Tokenomics Section */}
      <section className="py-24 px-4 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text Content */}
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('allocation.title')}
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                {t('allocation.description')}
              </p>

              <div className="space-y-4">
                <AllocationRow
                  label={t('allocation.charts.founder')}
                  sub={t('allocation.charts.founder_sub')}
                  percent="9%"
                  color="bg-blue-500"
                />
                <AllocationRow
                  label={t('allocation.charts.operations')}
                  sub={t('allocation.charts.operations_sub')}
                  percent="10%"
                  color="bg-emerald-500"
                />
                <AllocationRow
                  label={t('allocation.charts.holding')}
                  sub={t('allocation.charts.holding_sub')}
                  percent="20%"
                  color="bg-amber-500"
                />
                <AllocationRow
                  label={t('allocation.charts.reserve')}
                  sub={t('allocation.charts.reserve_sub')}
                  percent="60%"
                  color="bg-indigo-500"
                />
                <AllocationRow
                  label="Personal / Float"
                  sub="Direct liquidity"
                  percent="1%"
                  color="bg-teal-500"
                />
              </div>
            </div>

            {/* Charts Column */}
            <div className="flex flex-col gap-8">
              <TokenomicsChart
                title={t('allocation.charts.excelsior_title')}
                data={excelsiorData}
              />
              <TokenomicsChart
                title={t('allocation.charts.luxor_title')}
                data={luxorData}
              />
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
      <div className="mb-6 p-3 rounded-lg bg-slate-800/50 w-fit">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function AllocationRow({ label, sub, percent, color }: { label: string, sub: string, percent: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-slate-800">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <div>
          <div className="text-white font-medium">{label}</div>
          <div className="text-slate-500 text-sm">{sub}</div>
        </div>
      </div>
      <div className="text-blue-400 font-bold font-mono">{percent}</div>
    </div>
  );
}

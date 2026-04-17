import Image from 'next/image';

import { BrandMark } from './brand-mark';

interface AuthHeroProps {
  image: string;
  title: string;
  subtitle: string;
  eyebrow?: string;
}

export function AuthHero({ image, title, subtitle, eyebrow }: AuthHeroProps) {
  return (
    <section className="relative hidden min-h-screen overflow-hidden lg:flex lg:flex-col lg:justify-between">
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-dark/60 via-ink-dark/20 to-ink-dark/70" />

      <header className="relative z-10 flex items-center justify-center p-8">
        <BrandMark monochrome />
      </header>

      <footer className="relative z-10 p-10">
        <div className="flex w-fit items-center gap-3 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white/90 shadow-lg ring-1 ring-white/20 backdrop-blur">
          <BrandMark size="sm" monochrome />
          {eyebrow ?? 'Trusted by budget travellers across India'}
        </div>
        <h1 className="mt-6 max-w-lg font-display text-5xl font-semibold leading-[1.05] text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-md text-base text-white/85">{subtitle}</p>
      </footer>
    </section>
  );
}

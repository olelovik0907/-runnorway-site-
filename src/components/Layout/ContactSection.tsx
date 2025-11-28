import React from 'react';

export function ContactSection() {
  return (
    <section id="kontakt" className="bg-slate-50 dark:bg-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold relative inline-block pb-1"
          style={{ color: 'var(--brand)' }}
        >
          Kontakt oss
          <span
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-14 h-0.5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        </h2>
        <p className="mt-6 text-slate-700 dark:text-slate-300">
          Spørsmål om løp, samarbeid eller presse? Send oss e-post.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 justify-center">
          <a
            className="btn-brand rounded-full px-6 py-3 font-semibold"
            href="mailto:post@runnorway.no"
          >
            post@runnorway.no
          </a>
        </div>
      </div>
    </section>
  );
}

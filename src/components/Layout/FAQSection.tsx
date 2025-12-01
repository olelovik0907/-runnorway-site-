import React from 'react';

export function FAQSection() {
  return (
    <section id="faq" className="bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-6 text-center relative inline-block pb-1"
          style={{ color: 'var(--brand)' }}
        >
          Ofte stilte spørsmål
          <span
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-14 h-0.5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        </h2>

        <details className="card p-4 mb-3">
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">
            Hvordan melder jeg meg på et løp?
          </summary>
          <p className="mt-2 text-slate-700 dark:text-slate-400">
            Trykk inn på løpet du vil delta på og velg «Delta». Derfra sendes du videre til arrangørens egen påmelding
            eller tidtakerfirma. Du kan også markere deg som interessert eller bekreftet deltaker i din profil.
          </p>
        </details>

        <details className="card p-4 mb-3">
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">
            Er alle løp i Norge med i kalenderen?
          </summary>
          <p className="mt-2 text-slate-700 dark:text-slate-400">
            Ikke ennå. Vi starter med løp som ligger hos utvalgte tidtaker- og påmeldingssystemer, og bygger gradvis ut med flere
            arrangører. Mangler ditt løp, kan du bruke «Registrer løp» eller sende oss en e-post.
          </p>
        </details>

        <details className="card p-4 mb-3">
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">
            Koster det noe å bruke RunNorway?
          </summary>
          <p className="mt-2 text-slate-700 dark:text-slate-400">
            For løpere er RunNorway gratis å bruke. På sikt kan vi tilby ekstra synlighet og funksjoner for arrangører som
            ønsker premium-plassering, men grunnkalenderen vil fortsatt være gratis å søke i.
          </p>
        </details>

        <details className="card p-4 mb-3">
          <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white">
            Hvor lagres profil og løpshistorikk?
          </summary>
          <p className="mt-2 text-slate-700 dark:text-slate-400">
            Alle data lagres trygt i Supabase database med sikker autentisering. Det betyr at du kan logge inn fra flere
            enheter og dine favoritter og påmeldinger synkroniseres automatisk. Vi følger GDPR-regler og tar personvern på alvor.
          </p>
        </details>
      </div>
    </section>
  );
}

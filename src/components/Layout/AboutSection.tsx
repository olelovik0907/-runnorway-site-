import React from 'react';

export function AboutSection() {
  return (
    <section id="om-runnorway" className="bg-white dark:bg-slate-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h2
          className="text-3xl sm:text-4xl font-bold mb-4 relative inline-block pb-1"
          style={{ color: 'var(--brand)' }}
        >
          Om RunNorway
          <span
            className="absolute left-0 bottom-0 w-14 h-0.5 rounded-full"
            style={{ background: 'var(--accent)' }}
          />
        </h2>
        <p className="text-slate-700 dark:text-slate-300 mt-4">
          RunNorway er en uavhengig løpskalender som har som mål å gjøre det enkelt å finne og sammenligne løp i hele Norge,
          uansett nivå. Her skal både mosjonister, klubber og arrangører finne det de trenger på ett sted.
        </p>
        <p className="text-slate-700 dark:text-slate-300 mt-3">
          I første versjon henter vi løp fra utvalgte tidtaker- og påmeldingssystemer, blant annet EQ Timing. Etter hvert vil vi
          koble på flere kilder og gi bedre oversikt over lokale løp, mindre arrangementer og nye konsepter.
        </p>
        <p className="text-slate-700 dark:text-slate-300 mt-3">
          Med Supabase database lagres nå profil, favoritter og påmeldinger trygt i skyen. Det betyr at du kan logge inn
          fra flere enheter og dine data synkroniseres automatisk. Vi er tydelige på hvordan vi håndterer persondata
          og følger GDPR-regler.
        </p>
        <div className="grid sm:grid-cols-3 gap-6 mt-8">
          <div className="card p-6">
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">For løpere</h3>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Finn nye løp, lag favoritter og hold oversikt over hva du er påmeldt. Marker deg som interessert eller
              bekreftet deltaker.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">For arrangører</h3>
            <p className="text-sm text-slate-700 dark:text-slate-400 mt-2">
              Arrangerer du løp i Norge? Legg løpet ditt inn i RunNorway så gjør vi det enklere for løpere å finne dere.
              Tjenesten er gratis i grunnversjonen og vi godkjenner løp fortløpende.
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-400 mt-2">
              Når du registrerer løpet ditt trenger vi navn på løpet, arrangør, dato, sted, distanser, lenke til påmelding
              eller nettside og en kontaktperson.
            </p>
            <p className="mt-4">
              <a
                href="https://docs.google.com/forms/d/15LLdyYqV2__Jyeu-LVcHNlQFMKChW0GLc755VMy0UOc/viewform"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-full border px-4 py-2 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                style={{ color: 'var(--brand)', borderColor: '#e5e7eb' }}
              >
                Registrer løp
              </a>
            </p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">Videreutvikling</h3>
            <p className="text-sm text-slate-700 dark:text-slate-400">
              Planer fremover inkluderer flere datakilder, bedre kartvisning, personlige anbefalinger og integrasjon
              mot treningsapper.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

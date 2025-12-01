"use client";

import { Header } from "../components/Header";

export default function FAQ() {
    return (
        <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
            <Header />
            <main className="max-w-4xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">Domande Frequenti (FAQ)</h1>

                <div className="space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-2">Come funziona il voto?</h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Il sistema di voto è basato su Smart Contract Ethereum. Solo gli
                            studenti autorizzati (whitelisted) possono votare. Ogni studente ha
                            diritto a un voto per proposta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Chi può creare proposte?
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Solo i Rappresentanti del Comitato possono creare nuove proposte.
                            Gli studenti possono visualizzare e votare le proposte attive.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            Come vengono gestiti i fondi?
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Il contratto può ricevere donazioni in ETH. I fondi possono essere
                            trasferiti solo tramite una proposta di trasferimento fondi, che
                            deve essere approvata dalla maggioranza degli studenti, al termine della 
                            quale la proposta apparirà nella sezione richieste di trasferimento fondi
                            e uno studentre potrà cliccare sul pulsante "Esegui Trasferimento Fondi" per eseguire il trasferimento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">
                            È necessario pagare le gas fee?
                        </h2>
                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Sì, ogni interazione con la blockchain (voto, creazione proposta,
                            ecc.) richiede il pagamento di una piccola commissione (gas) in
                            ETH.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}

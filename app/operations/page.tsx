"use client";

import { useCallback, useEffect, useState } from "react";
import { BrowserProvider, Contract, formatEther } from "ethers";
import { Header } from "../components/Header";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../../lib/contract";

interface EventData {
    name: string;
    blockNumber: number;
    transactionHash: string;
    args: any;
    timestamp?: number;
    costEth?: string;
    costEur?: string;
}

export default function Operations() {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(false);
    const [ethPriceEur, setEthPriceEur] = useState<number | null>(null);

    const connect = useCallback(async () => {
        if (typeof window !== "undefined" && (window as any).ethereum) {
            try {
                const prov = new BrowserProvider((window as any).ethereum);
                const accounts = await prov.send("eth_requestAccounts", []);
                setProvider(prov);
                setAccount(accounts[0]);
                localStorage.setItem("walletConnected", "true");
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const disconnect = useCallback(async () => {
        if ((window as any).ethereum) {
            try {
                await (window as any).ethereum.request({
                    method: "wallet_revokePermissions",
                    params: [{ eth_accounts: {} }]
                });
            } catch (e) {
                console.error("Revoke permissions failed", e);
            }
        }
        setAccount(null);
        setProvider(null);
        setEvents([]);
        localStorage.removeItem("walletConnected");
    }, []);

    useEffect(() => {
        if (localStorage.getItem("walletConnected") === "true") {
            connect();
        }
    }, [connect]);

    useEffect(() => {
        // Fetch ETH price with caching (10 minutes)
        const CACHE_KEY = "eth_price_eur";
        const CACHE_TIME_KEY = "eth_price_timestamp";
        const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

        const fetchPrice = async () => {
            try {
                // Check cache first
                const cachedPrice = localStorage.getItem(CACHE_KEY);
                const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

                if (cachedPrice && cachedTime) {
                    const now = Date.now();
                    if (now - parseInt(cachedTime) < CACHE_DURATION) {
                        setEthPriceEur(parseFloat(cachedPrice));
                        return;
                    }
                }

                const res = await fetch(
                    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur"
                );

                if (!res.ok) {
                    throw new Error(`Price fetch failed: ${res.status}`);
                }

                const data = await res.json();
                if (data?.ethereum?.eur) {
                    const price = data.ethereum.eur;
                    setEthPriceEur(price);
                    localStorage.setItem(CACHE_KEY, price.toString());
                    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
                }
            } catch (err) {
                console.warn("Failed to fetch ETH price, using cache if available", err);
                // Fallback to cache even if expired if fetch fails
                const cachedPrice = localStorage.getItem(CACHE_KEY);
                if (cachedPrice) {
                    setEthPriceEur(parseFloat(cachedPrice));
                }
            }
        };

        fetchPrice();
    }, [connect]);

    useEffect(() => {
        if (!provider) return;

        const fetchEvents = async () => {
            setLoading(true);
            try {
                const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

                // Fetch all events from genesis
                const fromBlock = 0;

                // Query all events
                const fetchedEvents = await contract.queryFilter(
                    "*",
                    fromBlock,
                    "latest"
                );

                // Sort by block number descending
                const sortedEvents = fetchedEvents.sort(
                    (a, b) => b.blockNumber - a.blockNumber
                );

                // Initial mapping without cost
                const initialEvents: EventData[] = sortedEvents.map((e: any) => ({
                    name: e.eventName || e.fragment?.name || "Unknown Event",
                    blockNumber: e.blockNumber,
                    transactionHash: e.transactionHash,
                    args: e.args
                        ? Object.fromEntries(
                            Object.entries(e.args).filter(([k]) => isNaN(Number(k)))
                        )
                        : {},
                }));

                setEvents(initialEvents);
                setLoading(false); // Show events first, then load costs

                // Fetch costs in background
                const eventsWithCost = [...initialEvents];
                // Process in chunks to avoid rate limits or UI freeze
                for (let i = 0; i < eventsWithCost.length; i++) {
                    const ev = eventsWithCost[i];
                    try {
                        const receipt = await provider.getTransactionReceipt(
                            ev.transactionHash
                        );
                        if (receipt) {
                            const gasUsed = receipt.gasUsed;
                            const gasPrice = receipt.gasPrice || BigInt(0);
                            const costWei = gasUsed * gasPrice;
                            const costEth = formatEther(costWei);
                            ev.costEth = costEth;

                            // We can update state incrementally or at the end
                            // Updating every item causes too many renders, let's do it in batches or just at the end if list is small.
                            // For better UX, let's update every 5 items or so.
                            if (i % 5 === 0 || i === eventsWithCost.length - 1) {
                                setEvents([...eventsWithCost]);
                            }
                        }
                    } catch (err) {
                        console.error("Error fetching receipt for tx", ev.transactionHash, err);
                    }
                }
                // Final update
                setEvents([...eventsWithCost]);

            } catch (e) {
                console.error("Error fetching events:", e);
                setLoading(false);
            }
        };

        fetchEvents();
    }, [provider]);

    // Update EUR cost when price or events change
    useEffect(() => {
        if (ethPriceEur && events.some(e => e.costEth && !e.costEur)) {
            setEvents(prev => prev.map(e => {
                if (e.costEth && !e.costEur) {
                    const cost = parseFloat(e.costEth) * ethPriceEur;
                    return { ...e, costEur: cost.toFixed(4) };
                }
                return e;
            }));
        }
    }, [ethPriceEur, events]);


    return (
        <div className="min-h-screen bg-linear-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900 text-zinc-900 dark:text-zinc-100">
            <Header account={account} connect={connect} disconnect={disconnect} />
            <main className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-2">Operazioni</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8">
                    Cronologia degli eventi del contratto.
                    {ethPriceEur && (
                        <span className="ml-2 text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                            1 ETH ≈ {ethPriceEur} EUR
                        </span>
                    )}
                </p>

                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-zinc-500">
                            Caricamento dell'intera cronologia eventi (potrebbe richiedere tempo)...
                        </p>
                    </div>
                )}

                {!loading && events.length === 0 && (
                    <div className="text-center py-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl">
                        <p className="text-zinc-500">
                            Nessun evento trovato o wallet non connesso.
                        </p>
                        {!account && (
                            <button
                                onClick={connect}
                                className="mt-4 rounded-lg bg-indigo-500 text-white px-4 py-2 text-sm hover:bg-indigo-600"
                            >
                                Collega Wallet per vedere gli eventi
                            </button>
                        )}
                    </div>
                )}

                <div className="relative pl-8 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-8">
                    {events.map((event, idx) => (
                        <EventNode key={`${event.transactionHash}-${idx}`} event={event} />
                    ))}
                </div>
            </main>
        </div>
    );
}

function EventNode({ event }: { event: EventData }) {
    const getColor = (name: string) => {
        if (name.includes("Vote")) return "bg-blue-500";
        if (name.includes("Proposal")) return "bg-amber-500";
        if (name.includes("Fund")) return "bg-emerald-500";
        if (name.includes("Representative")) return "bg-purple-500";
        return "bg-zinc-500";
    };

    const colorClass = getColor(event.name);

    return (
        <div className="relative">
            {/* Dot on the timeline */}
            <div
                className={`absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white dark:border-black ${colorClass}`}
            />

            <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${colorClass}`}
                        >
                            {event.name}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">
                            Block #{event.blockNumber}
                        </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <a
                            href={`https://etherscan.io/tx/${event.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-indigo-500 hover:underline truncate max-w-[200px]"
                        >
                            {event.transactionHash}
                        </a>
                        {event.costEth && (
                            <div className="text-xs text-zinc-500 text-right">
                                <div>Costo: {parseFloat(event.costEth).toFixed(6)} ETH</div>
                                {event.costEur && <div className="font-semibold text-zinc-700 dark:text-zinc-300">≈ € {event.costEur}</div>}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                    {Object.entries(event.args).length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                            {Object.entries(event.args).map(([key, value]: [string, any]) => (
                                <div key={key} className="flex gap-2">
                                    <span className="text-zinc-500">{key}:</span>
                                    <span className="text-zinc-800 dark:text-zinc-200 break-all">
                                        {value.toString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className="text-zinc-400 italic">Nessun argomento</span>
                    )}
                </div>
            </div>
        </div>
    );
}

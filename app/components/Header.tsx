"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AddressAvatar } from "./AddressAvatar";
import { useCallback, useState } from "react";

interface HeaderProps {
    account?: string | null;
    connect?: () => void;
    disconnect?: () => void;
    chainId?: string | null;
    isMainnet?: boolean;
}

export function Header({
    account,
    connect,
    disconnect,
    chainId,
    isMainnet,
}: HeaderProps) {
    const pathname = usePathname();
    const [copied, setCopied] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const copyAddress = useCallback(async () => {
        if (!account) return;
        try {
            await navigator.clipboard.writeText(account);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            console.error(e);
        }
    }, [account]);

    const isActive = (path: string) => pathname === path;

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black relative z-50">
            <div className="flex items-center justify-between px-6 py-4">
                <Link href="/" className="text-xl font-semibold hover:opacity-80">
                    Comitato Studentesco
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm">
                    <Link
                        href="/"
                        className={`${isActive("/")
                            ? "text-zinc-900 dark:text-zinc-100 font-medium"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            }`}
                    >
                        Votazioni
                    </Link>
                    <Link
                        href="/operations"
                        className={`${isActive("/operations")
                            ? "text-zinc-900 dark:text-zinc-100 font-medium"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            }`}
                    >
                        Operazioni
                    </Link>
                    <Link
                        href="/faq"
                        className={`${isActive("/faq")
                            ? "text-zinc-900 dark:text-zinc-100 font-medium"
                            : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                            }`}
                    >
                        FAQ
                    </Link>
                </nav>

                {/* Desktop Wallet Controls */}
                <div className="hidden md:flex items-center gap-3">
                    {connect && disconnect ? (
                        <>
                            {account ? (
                                <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 pl-2 pr-3 py-1 text-sm">
                                        <AddressAvatar address={account} size={18} />
                                        <button
                                            onClick={copyAddress}
                                            className="font-mono hover:underline"
                                            title={copied ? "Copiato!" : "Copia"}
                                        >
                                            {account.slice(0, 6)}…{account.slice(-4)}
                                        </button>
                                    </span>
                                    <button
                                        onClick={disconnect}
                                        className="rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 px-2 py-1 text-xs hover:bg-zinc-300 dark:hover:bg-zinc-600"
                                    >
                                        Disconnetti
                                    </button>
                                    {copied && <span className="ui-badge">Copiato</span>}
                                </div>
                            ) : (
                                <button
                                    onClick={connect}
                                    className="rounded-lg bg-black text-white px-4 py-2 text-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                >
                                    Collega Wallet
                                </button>
                            )}
                        </>
                    ) : null}
                    {chainId && (
                        <span className="text-xs text-zinc-500">
                            {isMainnet ? "Mainnet" : chainId}
                        </span>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-6 py-4 space-y-4 shadow-lg absolute w-full left-0">
                    <nav className="flex flex-col gap-3 text-sm">
                        <Link
                            href="/"
                            onClick={() => setIsMenuOpen(false)}
                            className={`py-2 ${isActive("/")
                                ? "text-zinc-900 dark:text-zinc-100 font-medium"
                                : "text-zinc-500"
                                }`}
                        >
                            Votazioni
                        </Link>
                        <Link
                            href="/operations"
                            onClick={() => setIsMenuOpen(false)}
                            className={`py-2 ${isActive("/operations")
                                ? "text-zinc-900 dark:text-zinc-100 font-medium"
                                : "text-zinc-500"
                                }`}
                        >
                            Operazioni
                        </Link>
                        <Link
                            href="/faq"
                            onClick={() => setIsMenuOpen(false)}
                            className={`py-2 ${isActive("/faq")
                                ? "text-zinc-900 dark:text-zinc-100 font-medium"
                                : "text-zinc-500"
                                }`}
                        >
                            FAQ
                        </Link>
                    </nav>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        {connect && disconnect ? (
                            <>
                                {account ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-2">
                                            <AddressAvatar address={account} size={24} />
                                            <span className="font-mono text-sm">
                                                {account.slice(0, 6)}…{account.slice(-4)}
                                            </span>
                                            <button
                                                onClick={copyAddress}
                                                className="text-xs text-indigo-500 hover:underline"
                                            >
                                                {copied ? "Copiato" : "Copia"}
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => {
                                                disconnect();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 px-4 py-2 text-sm"
                                        >
                                            Disconnetti
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            connect();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full rounded-lg bg-black text-white px-4 py-2 text-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                                    >
                                        Collega Wallet
                                    </button>
                                )}
                            </>
                        ) : null}
                        {chainId && (
                            <p className="mt-3 text-xs text-zinc-500 text-center">
                                Rete: {isMainnet ? "Ethereum Mainnet" : chainId}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

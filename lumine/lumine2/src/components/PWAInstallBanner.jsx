import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

const PWAInstallBanner = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already in standalone / installed mode
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Don't show if user dismissed recently
            const dismissed = localStorage.getItem('lumine_pwa_dismissed');
            if (!dismissed) {
                setShowBanner(true);
            }
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowBanner(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Show manual banner for iOS / browsers if not installed
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        if (isIOS && !window.navigator.standalone) {
            const dismissed = localStorage.getItem('lumine_pwa_dismissed');
            if (!dismissed) {
                setShowBanner(true);
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // iOS or browser without automated prompt
            alert('To install Lumine App:\n1. Tap the Share button in your browser\n2. Select "Add to Home Screen"');
            return;
        }

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsInstalled(true);
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('lumine_pwa_dismissed', 'true');
    };

    if (isInstalled || !showBanner) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 bg-navy-900 text-white p-4 rounded-2xl shadow-2xl border border-orange-500/30 z-50 animate-bounce-short flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Smartphone className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-sm leading-tight text-white">Install Lumine App</h4>
                    <p className="text-[11px] text-gray-300">Quick access from home screen</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                </button>
                <button
                    onClick={handleDismiss}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    aria-label="Close banner"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PWAInstallBanner;

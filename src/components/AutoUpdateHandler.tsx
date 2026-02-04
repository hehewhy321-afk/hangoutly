import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Version {
    version: string;
    timestamp: string;
}

export const AutoUpdateHandler = () => {
    const [lastVersion, setLastVersion] = useState<string | null>(null);

    useEffect(() => {
        const checkVersion = async () => {
            try {
                // Determine current base path for fetching version.json
                const basePath = window.location.origin;
                // Add timestamp to prevent caching of the version file itself
                const response = await fetch(`${basePath}/version.json?t=${new Date().getTime()}`);

                if (!response.ok) return;

                const data: Version = await response.json();

                if (lastVersion && lastVersion !== data.version) {
                    console.log(`New version detected: ${data.version} (current: ${lastVersion})`);
                    // Dismiss all existing toasts to reduce clutter
                    toast.dismiss();

                    toast.info("Update Available", {
                        description: "A new version of Hangoutly is available!",
                        action: {
                            label: "Update Now",
                            onClick: () => {
                                // Hard reload to clear cache and get fresh assets
                                window.location.reload();
                            }
                        },
                        duration: Infinity, // Keep it visible until action
                        position: 'bottom-right'
                    });
                }

                setLastVersion(data.version);
            } catch (error) {
                console.error("Failed to check for updates:", error);
            }
        };

        // Check immediately on mount
        checkVersion();

        // Then check every minute
        const intervalId = setInterval(checkVersion, 60 * 1000);

        return () => clearInterval(intervalId);
    }, [lastVersion]);

    return null;
};

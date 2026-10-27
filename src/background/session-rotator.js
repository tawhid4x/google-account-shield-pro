import { AsyncMutex } from '../shared/mutex.js';
import { CookieVault } from './cookie-vault.js';
import { GOOGLE_DOMAINS } from '../shared/constants.js';

const mutex = new AsyncMutex();

export class SessionRotator {
    static async hotSwap(targetEmail, currentActiveEmail = null) {
        return mutex.runExclusive(async () => {
            if (currentActiveEmail) {
                await CookieVault.snapshotCurrentSession(currentActiveEmail);
            }

            // Remove existing cookies
            for (const domain of GOOGLE_DOMAINS) {
                const domainCookies = await new Promise(resolve => {
                    chrome.cookies.getAll({ domain }, (results) => resolve(results || []));
                });

                for (const cookie of domainCookies) {
                    const protocol = cookie.secure ? 'https://' : 'http://';
                    const url = `${protocol}${cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain}${cookie.path}`;
                    await new Promise(resolve => chrome.cookies.remove({ url, name: cookie.name }, resolve));
                }
            }

            // Restore from vault
            const vault = await CookieVault.getVault();
            if (vault[targetEmail] && vault[targetEmail].cookies) {
                for (const cookie of vault[targetEmail].cookies) {
                    const protocol = cookie.secure ? 'https://' : 'http://';
                    const url = `${protocol}${cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain}${cookie.path}`;
                    const details = {
                        url,
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                        path: cookie.path,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        storeId: cookie.storeId,
                    };
                    if (!cookie.session && cookie.expirationDate) {
                        details.expirationDate = cookie.expirationDate;
                    }
                    if (cookie.sameSite) {
                        details.sameSite = cookie.sameSite;
                    }

                    // Handle Host prefix requirement
                    if (cookie.name.startsWith('__Host-')) {
                        delete details.domain;
                    }

                    await new Promise(resolve => chrome.cookies.set(details, resolve));
                }
            }
        });
    }
}

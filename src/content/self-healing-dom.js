export class SelfHealingDOM {
    static findSignOutButton(rootNode = document) {
        // 1. URL & Link Topology Analysis
        const links = rootNode.querySelectorAll('a, [role="link"], [role="menuitem"]');
        for (const link of links) {
            const href = link.getAttribute('href') || '';
            const action = link.getAttribute('data-et') || link.getAttribute('jsaction') || '';

            if (href.includes('/Logout') || href.includes('SignOutOptions') || action.includes('Logout')) {
                // Ensure it's not the main profile button (which opens the menu)
                if (!link.getAttribute('aria-label')?.includes('Google Account:')) {
                    return link;
                }
            }
        }

        // 2. SVG Path Vector Fingerprinting
        const svgs = rootNode.querySelectorAll('svg path');
        for (const path of svgs) {
            const d = path.getAttribute('d') || '';
            // Signature for "Sign out" exit door icon
            if (d.includes('M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5z')) {
                let current = path.parentElement;
                while (current && current !== rootNode) {
                    if (current.tagName === 'A' || current.tagName === 'BUTTON' || current.getAttribute('role') === 'button' || current.getAttribute('role') === 'menuitem') {
                        return current;
                    }
                    current = current.parentElement;
                }
            }
        }

        // 3. Text heuristic as fallback
        const elements = rootNode.querySelectorAll('a, button, [role="button"], [role="menuitem"], [role="listitem"]');
        const signoutKeywords = ['sign out of all accounts', 'sign out', 'log out', 'sign out of all'];

        for (const el of elements) {
            const text = (el.textContent || '').trim().toLowerCase();
            const ariaLabel = (el.getAttribute('aria-label') || '').trim().toLowerCase();

            if (signoutKeywords.some(kw => text === kw || ariaLabel === kw)) {
                if (!ariaLabel.includes('google account:')) {
                    return el;
                }
            }
        }

        return null;
    }

    static findAddAccountButton(rootNode = document) {
        const links = rootNode.querySelectorAll('a, [role="link"], [role="menuitem"]');
        for (const link of links) {
            const href = link.getAttribute('href') || '';
            if (href.includes('AddSession') || href.includes('AccountChooser')) {
                return link;
            }
        }

        // Text heuristic
        const elements = rootNode.querySelectorAll('a, button, [role="button"], [role="menuitem"], [role="listitem"]');
        for (const el of elements) {
            const text = (el.textContent || '').trim().toLowerCase();
            if (text.includes('add another account') || text.includes('add account')) {
                return el;
            }
        }
        return null;
    }
}

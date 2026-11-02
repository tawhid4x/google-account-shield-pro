export class WorkspaceProfiles {
    static async getWorkspaces() {
        const result = await chrome.storage.local.get('gmas_workspaces');
        return result.gmas_workspaces || ['All Accounts', 'Personal', 'Work & Clients', 'Gaming & YouTube', 'Development'];
    }

    static async addWorkspace(name) {
        const workspaces = await this.getWorkspaces();
        if (!workspaces.includes(name)) {
            workspaces.push(name);
            await chrome.storage.local.set({ gmas_workspaces: workspaces });
        }
    }

    static autoGroupAccount(email, name) {
        const str = `${email} ${name}`.toLowerCase();
        if (str.includes('gamer') || str.includes('gaming') || str.includes('yt') || str.includes('youtube')) {
            return 'Gaming & YouTube';
        }
        if (str.includes('dev') || str.includes('cloud') || str.includes('admin') || str.includes('test')) {
            return 'Development';
        }
        if (str.includes('work') || str.includes('official') || str.includes('client')) {
            return 'Work & Clients';
        }
        return 'Personal';
    }
}

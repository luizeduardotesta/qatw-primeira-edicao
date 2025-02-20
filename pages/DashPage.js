export class DashPage {
    constructor(page) {
        this.page = page;
    }

    async obtainBalance() {
        return this.page.locator('#account-balance')
    }
}
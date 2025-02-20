import { test, expect } from '@playwright/test';
import { obtainCode2FA } from '../support/db';
import { LoginPage } from '../pages/LoginPage';
import { DashPage } from '../pages/DashPage';
import { getJob, cleanJobs } from '../support/redis';

const testData = {
  validUser: {
    cpf: '00000014141',
    password: '147258'
  },
  invalidUser: {
    cpf: '00000014140',
    password: '147259',
    code: '123456'
  }
};


test.describe('Login Tests', () => {
  test('Não deve permitir login com Código de verificação inválido', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.accessPage();
    await loginPage.fillCPFAndContinue(testData.validUser.cpf);
    await loginPage.fillPassword(testData.validUser.password);
    await loginPage.fillCode(testData.invalidUser.code);

    await expect(page.locator('span')).toContainText('Código inválido. Por favor, tente novamente.');
  });

  test('Não deve permitir login com CPF inválido', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.accessPage();
    await loginPage.fillCPFAndContinue(testData.invalidUser.cpf);

    await expect(page.locator('span')).toContainText('CPF inválido. Por favor, verifique.');
  });

  test('Não deve permitir login com password inválida', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.accessPage();
    await loginPage.fillCPFAndContinue(testData.validUser.cpf);
    await loginPage.fillPassword(testData.invalidUser.password);

    await expect(page.locator('span')).toContainText('Acesso negado. Por favor, tente novamente.');
  });

  test('Deve permitir login do usuário', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashPage = new DashPage(page);

    await cleanJobs();

    await loginPage.accessPage();
    await loginPage.fillCPFAndContinue(testData.validUser.cpf);
    await loginPage.fillPassword(testData.validUser.password);

    await page.getByRole('heading', { name: 'Verificação em duas etapas' }).waitFor({ timeout: 3000 });

    //Busca o código no Redis
    // const code = await getJob();
    // await loginPage.fillCode(code);

    //Busca o código no banco de dados
    const validCode = await obtainCode2FA(testData.validUser.cpf);
    await loginPage.fillCode(validCode);

    await expect(await dashPage.obtainBalance()).toHaveText('R$ 5.000,00');
  });
});

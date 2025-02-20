import pgPromise from "pg-promise";

const pgp = pgPromise();
const db = pgp('postgres://dba:dba@paybank-db:5432/UserDB');

export async function obtainCode2FA(cpf) {
    const query = `
        SELECT t.code
        FROM public."TwoFactorCode" t
        JOIN public."User" u ON u."id" = t."userId"
        WHERE u."cpf" = '${cpf}'
        ORDER BY t.id DESC
        LIMIT 1;
    `

    try {
        const result = await db.oneOrNone(query);
        if (result && result.code) {
            return result.code;
        } else {
            throw new Error("Nenhum código 2FA encontrado");
        }
    } catch (error) {
        console.error("Erro ao obter código 2FA:", error);
        throw error;
    }
}

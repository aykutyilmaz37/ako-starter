// drizzle-kit'in ürettiği `drizzle/migrations.js` türsüzdür; useMigrations'ın beklediği biçim:
declare module '~/drizzle/migrations' {
  const migrations: {
    journal: { entries: { idx: number; when: number; tag: string; breakpoints: boolean }[] };
    migrations: Record<string, string>;
  };
  export default migrations;
}

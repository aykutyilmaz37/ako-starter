import { execFileSync } from 'node:child_process';

const sh = (cwd, cmd, args) => execFileSync(cmd, args, { cwd, stdio: 'inherit' });
const has = (cwd, cmd) => {
  try {
    execFileSync(cmd, ['--version'], { cwd, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

/**
 * Üretimden sonraki adımlar. Sıra önemli:
 *   install → generate (özellik kapalıysa api-client yeniden üretilir) → format → git init + ilk commit
 * ilk commit en sonda olmalı ki `generate:check` ve `format:check` baştan temiz çıksın.
 */
export function finalize({ target, plan, install, git = true, log = console.log }) {
  if (install) {
    sh(target, 'pnpm', ['install', '--no-frozen-lockfile']);
    if (plan.disabled.size > 0) {
      // API değişti: openapi.json ve Orval çıktısı şablondakinden farklı.
      sh(target, 'pnpm', ['generate']);
    }
    sh(target, 'pnpm', ['format']);
  }
  if (git && has(target, 'git')) {
    sh(target, 'git', ['init', '-q']);
    sh(target, 'git', ['add', '-A']);
    try {
      execFileSync('git', ['commit', '-q', '-m', 'Initial commit (create-ako-app)'], {
        cwd: target,
        stdio: 'ignore',
      });
    } catch {
      log('git commit atlandı (user.name/user.email ayarlı mı?); dosyalar eklendi, commit sizde.');
    }
  }
}

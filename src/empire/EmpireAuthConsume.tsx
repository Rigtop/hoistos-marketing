/**
 * Compat shim. Phase-2 scaffold landed this file at src/empire/.
 * Phase 3 (S197) moved the real implementation to src/empire/auth/.
 *
 * AppRouter.tsx now imports from './auth/EmpireAuthConsume' directly. This
 * shim stays so any other consumer keeps building. New code: import from
 * './auth/EmpireAuthConsume'.
 */

export { EmpireAuthConsume, default } from './auth/EmpireAuthConsume'

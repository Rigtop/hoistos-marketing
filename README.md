# Moved to HoistOS monorepo

This repository is archived as of 2026-05-21 (S254 Mission Control migration).

Active development lives at https://github.com/Rigtop/HoistOS/tree/main/apps/marketing

Vercel project `hoist-os/hoistos-marketing` (serving hoistos.com) is now connected to the HoistOS monorepo. Root `vercel.json` builds `apps/marketing/` from monorepo source. Any push to this hoistos-marketing repo will NOT trigger a deploy because Vercel is no longer connected.

Local clone at `~/Desktop/Mission Control/hoistos/` is preserved for git stash reference. Stash@{0} carries the in-progress course feature scaffold and David Franco hero copy from before the migration. The David Franco subtitle was already extracted from stash@{0} and committed to the monorepo at 4b92e3f as part of Phase 2. Course feature stays in the stash for separate later landing via:

```bash
cd ~/Desktop/Mission Control/hoistos
git stash show -p stash@{0} | git apply --directory=$HOME/Desktop/Outputs/AI\ Authority/HoistOS/repo/apps/marketing/
```

Original README content moved to the monorepo as the canonical source-of-truth.

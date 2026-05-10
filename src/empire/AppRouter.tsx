/**
 * AppRouter. The top-level Routes config.
 *
 * S198 V6 reset: hoistos.com/ serves a HoistOS-branded splash (HoistOSHome)
 * with two CTAs into the live product surfaces. Scrolophyte stays at the
 * canonical /empireworksreconstruction path.
 *
 * Routes:
 *   "/"                                   -> HoistOSHome (brand splash + CTAs)
 *   "/empireworksreconstruction" + nested -> Scrolophyte (canonical)
 *   "/empire" + nested                    -> Scrolophyte (legacy alias)
 *
 * Theme: HoistOS LIGHT (paper bg + ink text + signal accent) on every route.
 * Set globally on mount via ThemeRouteSync (no per-route detection needed).
 *
 * Hard Rule #11: no em dashes.
 */

import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { HoistOSHome } from '../HoistOSHome'
import { EmpireLayout } from './layouts/EmpireLayout'
import { EmpireLanding } from './EmpireLanding'
import { EmpireTimelinePage } from './EmpireTimelinePage'
import { EmpirePackDetail } from './EmpirePackDetail'
import { EmpireBonusExtras } from './EmpireBonusExtras'

function ThemeRouteSync() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'hoistos-light')
  }, [])
  return null
}

export function AppRouter() {
  return (
    <>
      <ThemeRouteSync />
      <Routes>
        <Route path="/" element={<HoistOSHome />} />

        {/* Canonical: scrolophyte at /empireworksreconstruction */}
        <Route path="/empireworksreconstruction" element={<EmpireLayout />}>
          <Route index element={<EmpireLanding />} />
          <Route path="timeline" element={<EmpireTimelinePage />} />
          <Route path="bonus-extras" element={<EmpireBonusExtras />} />
          <Route path="pack/:packId" element={<EmpirePackDetail />} />
        </Route>

        {/* Legacy alias: /empire */}
        <Route path="/empire" element={<EmpireLayout />}>
          <Route index element={<EmpireLanding />} />
          <Route path="timeline" element={<EmpireTimelinePage />} />
          <Route path="bonus-extras" element={<EmpireBonusExtras />} />
          <Route path="pack/:packId" element={<EmpirePackDetail />} />
        </Route>
      </Routes>
    </>
  )
}

export default AppRouter

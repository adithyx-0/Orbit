import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DesktopSidebar, MobileSidebar } from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import { pageTransition } from '../lib/motion.js'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-surface-0">
      {/* Desktop: always visible */}
      <DesktopSidebar />

      {/* Mobile: AnimatePresence overlay */}
      <MobileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-5 md:p-8 overflow-auto">
          <motion.div
            className="mx-auto max-w-7xl"
            variants={pageTransition}
            initial="hidden"
            animate="visible"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}

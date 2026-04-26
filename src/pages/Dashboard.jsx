import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardView from '../views/DashboardView';
import UploadView from '../views/UploadView';
import FilesView from '../views/FilesView';
import ShareView from '../views/ShareView';
import AccessView from '../views/AccessView';
import LogsView from '../views/LogsView';
import SettingsView from '../views/SettingsView';
import AdminView from '../views/AdminView';

export default function Dashboard() {
  const [activeView, setActiveView] = useState('dash');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function renderView() {
    switch (activeView) {
      case 'dash':     return <DashboardView onViewChange={setActiveView} />;
      case 'upload':   return <UploadView />;
      case 'files':    return <FilesView onViewChange={setActiveView} />;
      case 'share':    return <ShareView />;
      case 'access':   return <AccessView />;
      case 'logs':     return <LogsView />;
      case 'settings': return <SettingsView />;
      case 'admin':    return <AdminView />;
      default:         return <DashboardView onViewChange={setActiveView} />;
    }
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Topbar
        activeView={activeView}
        onViewChange={setActiveView}
        onMenuOpen={() => setSidebarOpen(true)}
      />

      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}

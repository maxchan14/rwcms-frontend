import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import SiteContent from './pages/SiteContent';
import Workflow from './pages/Workflow';
import SystemPermissions from './pages/SystemPermissions';
import PageTemplates from './pages/PageTemplates';

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<SiteContent />} /> {/* Default to Site Content */}
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/system-permissions" element={<SystemPermissions />} />
        <Route path="/page-templates" element={<PageTemplates />} />
      </Routes>
    </AppProvider>
  );
}

export default App;
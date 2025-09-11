import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import MoodTracker from './pages/MoodTracker';
import Goals from './pages/Goals';
import Community from './pages/Community';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AIInsights from './pages/AIInsights';
import Games from './pages/Games';
import Resources from './pages/Resources';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Main app routes (with layout) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="emergency" element={<Emergency />} />
            <Route path="mood" element={<MoodTracker />} />
            <Route path="goals" element={<Goals />} />
            <Route path="community" element={<Community />} />
            <Route path="insights" element={<AIInsights />} />
            <Route path="games" element={<Games />} />
            <Route path="resources" element={<Resources />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

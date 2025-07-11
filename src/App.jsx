import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import DoctorAudioUpload from './components/DoctorAudioUpload'
import AuthPages from './components/AuthPages'
import DoctorRegistration from './components/DoctorRegistration'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import { Provider } from 'react-redux'
import appStore from './utils/appStore'
import { AuthProvider } from './context/AuthContext'

function App() {
  useEffect(() => {
    // Smooth scrolling for navigation links
    const handleNavClick = (e) => {
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    // Header scroll effect
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(102, 126, 234, 0.95)';
          header.style.backdropFilter = 'blur(10px)';
        } else {
          header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
      }
    };

    // Fade in animation on scroll
    const handleFadeIn = () => {
      const fadeElements = document.querySelectorAll('.fade-in');
      fadeElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('visible');
        }
      });
    };

    document.addEventListener('click', handleNavClick);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', handleFadeIn);

    // Initial check for fade-in elements
    handleFadeIn();

    return () => {
      document.removeEventListener('click', handleNavClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleFadeIn);
    };
  }, []);

  return (
    <div>
      <Provider store={appStore}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/builder" 
              element={
                <ProtectedRoute>
                  <DoctorAudioUpload />
                </ProtectedRoute>
              } 
            />
            <Route path="/auth" element={<AuthPages />} />
            <Route path="/register" element={<DoctorRegistration />} />
          </Routes>
        </AuthProvider>
      </Provider>
    </div>
  )
}

export default App

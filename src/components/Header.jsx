import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeUser } from "../utils/userSlice";
import { setPage } from "../utils/logSlice";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, LogOut, Settings, Stethoscope } from "lucide-react";

const Header = () => {
  const [showMenu, setshowMenu] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated, logout, getUserDisplayName, getUserEmail, getUserSpecialty } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    dispatch(removeUser());
    setshowMenu(false);
  };
  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo">
          <Stethoscope className="w-6 h-6 inline mr-2" />
          DoctorSite Builder
        </Link>
        <ul className="nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#how-it-works">How It Works</a>
          </li>
          <li>
            <a href="#pricing">Pricing</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </ul>
        {!isAuthenticated ? (
          <div className="auth-buttons">
            <Link
              to="/auth"
              className="cta-button"
              onClick={() => dispatch(setPage("signin"))}
            >
              Sign In
            </Link>
            <Link to="/register" className="cta-button">
              Register
            </Link>
          </div>
        ) : (
          <div className="relative">
            <div
              className="UserMenu cursor-pointer flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              onClick={() => setshowMenu(!showMenu)}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">{getUserDisplayName()}</p>
                <p className="text-xs text-gray-600">{getUserSpecialty()}</p>
              </div>
            </div>
            
            {showMenu && (
              <div className="UserMenu-content absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{getUserDisplayName()}</p>
                      <p className="text-sm text-gray-600">{getUserEmail()}</p>
                      {getUserSpecialty() && (
                        <p className="text-xs text-blue-600 font-medium">{getUserSpecialty()}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <Link
                    to="/builder"
                    className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    onClick={() => setshowMenu(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Website Builder</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

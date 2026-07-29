import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Hero from "./components/landingPage/Hero";
import Shorten from "./components/shortenLink/Shorten";
import QRPage from "./components/qrPage/QRPage";
import QRPagePaid from "./components/qrPaid/QRPage";
import Signin from "./components/auth/Signin";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import { Provider } from "react-redux";
import store from "./redux/store";
import NoHeaderFooterLayout from "./components/layout/NoHeaderFooterLayout";
import MainLayout from "./components/layout/HeaderFooterLayout"; // Import MainLayout here
import bg from "./assets/bg.jpg";
import LinkShort from "./components/LinkShortPaid/LinkShort";
import Analytics from "./components/analytics/Analytics";
import ProtectedLink from "./components/protectedLinks/ProtectedLink";
import SavedLinks from "./components/savedLinks/SavedLinks";
import Profile from "./components/profile/Profile";

// ScrollToTop Component
const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top when the location changes
  }, [location]);

  return null;
};

const App: React.FC = () => {
  // Higher-order function to wrap components with MainLayout
  const AddComp = ({ component: Component }: { component: React.ComponentType }) => {
    return (
      <MainLayout>
        <Component />
      </MainLayout>
    );
  };

  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <div
          className="min-h-screen bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <Routes>
            {/* Routes for Pages with Header and Footer */}
            <Route path="/" element={<AddComp component={Hero} />} />
            <Route path="/shortenlink" element={<AddComp component={Shorten} />} />
            <Route path="/generateqr" element={<AddComp component={QRPage} />} />
            <Route path="/signin" element={<AddComp component={Signin} />} />
            <Route path="/signup" element={<AddComp component={Signup} />} />

            {/* Route for Dashboard (without Header and Footer) */}
            <Route
              path="/dashboard"
              element={
                <NoHeaderFooterLayout>
                  <Dashboard />
                </NoHeaderFooterLayout>
              }
            />
            <Route
              path="/dashboard/qr"
              element={
                <NoHeaderFooterLayout>
                  <QRPagePaid />
                </NoHeaderFooterLayout>
              }
            />
            <Route
              path="/dashboard/shortlink"
              element={
                <NoHeaderFooterLayout>
                  <LinkShort />
                </NoHeaderFooterLayout>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <NoHeaderFooterLayout>
                  <Analytics />
                </NoHeaderFooterLayout>
              }
            />
            <Route
              path="/dashboard/protectedlinks"
              element={
                <NoHeaderFooterLayout>
                  <ProtectedLink />
                </NoHeaderFooterLayout>
              }
            />
            <Route
              path="/dashboard/savedlinks"
              element={
                <NoHeaderFooterLayout>
                  <SavedLinks />
                </NoHeaderFooterLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <NoHeaderFooterLayout>
                  <Profile />
                </NoHeaderFooterLayout>
              }
            />

          </Routes>
        </div>
      </Router>
    </Provider>
  );
};

export default App;

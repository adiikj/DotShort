import React, { ReactNode } from "react";
import Header from "../landingPage/Header";
import Footer from "../landingPage/Footer";

interface MainLayoutProps {
  children: ReactNode; // Children prop will be the content of the route
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main> {/* This renders the content of the route */}
      <Footer />
    </>
  );
};

export default MainLayout;

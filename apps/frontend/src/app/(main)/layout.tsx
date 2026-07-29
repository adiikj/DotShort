import type { ReactNode } from "react";
import Header from "../../components/landingPage/Header";
import Footer from "../../components/landingPage/Footer";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

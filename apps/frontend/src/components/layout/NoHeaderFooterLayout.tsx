import React, { ReactNode } from "react";

interface NoHeaderFooterLayoutProps {
  children: ReactNode;
}

const NoHeaderFooterLayout: React.FC<NoHeaderFooterLayoutProps> = ({ children }) => {
  return <main>{children}</main>;
};

export default NoHeaderFooterLayout;

import { Props } from "@/types/type";
import { FC } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Header />

      <div className="h-[1000px]">{children}</div>

      <Footer />
    </>
  );
};

export default Layout;

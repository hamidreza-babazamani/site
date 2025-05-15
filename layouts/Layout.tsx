import { Props } from "@/types/type";
import { FC } from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <header>
        <Header />
      </header>

      <main className="h-[1000px]">{children}</main>

      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default Layout;

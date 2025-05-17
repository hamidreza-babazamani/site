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

      <main className="h-fit">{children}</main>

      <footer>
        <Footer />
      </footer>
    </>
  );
};

export default Layout;

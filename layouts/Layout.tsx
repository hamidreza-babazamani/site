import { Props } from "@/types/type";
import { FC } from "react";
import Header from "./Header";
import Footer from "./Footer";
import ContactButton from "@/components/ContactButton";

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
      <div>
        <ContactButton />
      </div>
    </>
  );
};

export default Layout;

import WorkComponent from "@/components/Contact";
import { getPublicPortfolio } from "@/lib/services/public-portfolio";

async function Contact() {
  const { contactMethods } = await getPublicPortfolio();
  return (
    <>
      <WorkComponent initialContactMethods={contactMethods} />
    </>
  );
}

export default Contact;

import WorkePage from "@/components/WorkePage";
import { getPublicPortfolio } from "@/lib/services/public-portfolio";

async function Work() {
  const { projects } = await getPublicPortfolio();
  return <WorkePage initialProjects={projects} />;
}

export default Work;

import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { RiTwitterXLine } from "react-icons/ri";

interface SochialProps {
  containerStyle?: string;
  iconStyle?: string;
}

const Sochial = ({ containerStyle, iconStyle }: SochialProps) => {
  const git: string = "https://github.com/Kamyarkamali";
  const linkdin: string =
    "https://www.linkedin.com/in/kamyar-kamali-671a5822b/";
  const X: string = "https://x.com/KamyarKamali021";

  const sochial = [
    {
      icon: <FaGithub />,
      path: git,
    },
    {
      icon: <FaLinkedinIn />,
      path: linkdin,
    },
    {
      icon: <RiTwitterXLine />,
      path: X,
    },
  ];
  return (
    <div className={containerStyle}>
      {sochial.map((item, index) => {
        return (
          <Link key={index} href={item.path} className={iconStyle}>
            {item.icon}
          </Link>
        );
      })}
    </div>
  );
};

export default Sochial;

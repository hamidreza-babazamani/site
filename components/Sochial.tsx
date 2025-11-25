import Link from "next/link";
import { FaGithub, FaLinkedinIn } from "react-icons/fa";
import { RiTwitterXLine } from "react-icons/ri";

interface SocialProps {
  containerStyle?: string;
  iconStyle?: string;
}

const Social = ({ containerStyle, iconStyle }: SocialProps) => {
  const socialLinks = [
    {
      icon: <FaGithub />,
      path: "https://github.com/Kamyarkamali",
      name: "GitHub",
    },
    {
      icon: <FaLinkedinIn />,
      path: "https://www.linkedin.com/in/kamyar-kamali-671a5822b/",
      name: "LinkedIn",
    },
    {
      icon: <RiTwitterXLine />,
      path: "https://x.com/KamyarKamali021",
      name: "X/Twitter",
    },
  ];

  return (
    <div className={containerStyle}>
      {socialLinks.map((item, index) => (
        <Link
          key={index}
          href={item.path}
          className={iconStyle}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit my ${item.name} profile`}
        >
          {item.icon}
        </Link>
      ))}
    </div>
  );
};

export default Social;

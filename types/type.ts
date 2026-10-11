export type Props = {
  children: React.ReactNode;
};

export type Mode = "light" | "dark" | "system";

export type HeroImageProps = {
  src?: string;
  alt: string;
};

export type LocalizedText = { fa?: string; en?: string };
export type HeroImage = {
  url: string;
  key?: string;
  fileId?: string;
  alt?: LocalizedText;
};
export type Hero = {
  image?: HeroImage | null;
  isVisible?: boolean;
};

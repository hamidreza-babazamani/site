import Image from "next/image";

function Photo() {
  return (
    <div className="relative w-[298px] h-[298px] xl:w-[498px] xl:h-[498px]">
      <Image
        src="/images/kamyar.jpg"
        priority
        quality={80}
        fill
        alt="Portrait of Kamyar Kamali, Front-end Developer"
        className="object-cover rounded-full"
      />

      <div className="absolute top-0 left-0 w-full h-full bg-black/30 z-10 rounded-full" />
    </div>
  );
}

export default Photo;

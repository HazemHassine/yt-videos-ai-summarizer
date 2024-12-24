import Image from "next/image";

export default function SignInLaout({ children }) {
  return (
    <div className="flex w-screen h-screen" >
      <div className="h-full w-1/5 bg-[url(/SignInSideBanner.jpeg)] bg-cover"/>
      {children}
      <Image className="absolute top-0 right-64" src="/VectorTop.png" width={700} height={400} alt="Vector"/>
      <Image className="absolute bottom-0 right-0" src="/VectorCross.png" width={700} height={400} alt="Vector"/>
    </div>
  );
}

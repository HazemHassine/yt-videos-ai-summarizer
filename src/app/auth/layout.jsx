export default function SignInLaout({ children }) {
  return (
    <div className="flex w-screen h-screen" >
      <div className="h-full w-1/5 bg-[url(/SignInSideBanner.jpeg)] bg-cover"/>
      {children}
    </div>
  );
}

import Image from "next/image";

const WelcomeScreen = () => {
  return (
    <div className="hidden md:flex flex-col items-center justify-between bg-[#001e06]  w-1/2">
      {/* Logo positioned at the top left */}
      <div className="w-24 h-24 absolute top-8 left-8">
        {" "}
        {/* absolute positioning */}
        <Image
          src="/assets/sink.png"
          alt="sink-logo"
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Welcome image remains centered */}
      <div className="flex-1 flex items-center justify-center">
        <Image
          src="assets/auth/welcome.png"
          alt="welcome"
          className="max-w-full max-h-[70vh] object-contain"
          priority
        />
      </div>
    </div>
  );
};

export default WelcomeScreen;

import { Spinner } from "@/components/app/Spinner";

const Loading = () => {
  return (
    <div className="w-full flex items-center justify-center min-h-[60vh]">
      <Spinner size="large" className="text-primary-green-300" />
    </div>
  );
};

export default Loading;

import Spinner from "@/app/_components/Spinner"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-2"> 
      <Spinner />
      <p className="text-xl text-primary-200">Carregando..</p>
    </div>
  );

}
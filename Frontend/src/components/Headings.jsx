import TextPressure from "@/components/TextPressure";

function Headings() {
  return (
    <div className=" relative w-full h-[100px] sm:h-[130px] md:h-[160px] lg:h-[180px] bg-black flex items-center justify-center overflow-hidden ">
      <div className="w-full px-4">
        <TextPressure text="Genie Studio...!" width weight italic alpha={false} stroke={false} textColor="#ffffff" minFontSize={20} />
      </div>
    </div>

  );
}

export default Headings;

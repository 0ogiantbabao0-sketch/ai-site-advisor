import ResearchApp from "@/components/research-app";
export default function ExamplePage() {
  return (
    <ResearchApp
      example
      initialInput={{
        area: "京都駅",
        radius: 20,
        targetDate: "",
        machines: ["マイジャグラーV"],
        preferredSites: [],
        notes: "駅から行きやすい店舗を優先",
      }}
    />
  );
}

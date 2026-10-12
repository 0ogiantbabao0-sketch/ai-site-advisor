import ResearchApp from "@/components/research-app";
import { todayJST } from "@/lib/dates";
export const dynamic = "force-dynamic";
export default function ExamplePage() {
  return (
    <ResearchApp
      example
      initialInput={{
        area: "京都駅",
        radius: 20,
        targetDate: todayJST(),
        machines: ["マイジャグラーV"],
        preferredSites: [],
        notes: "駅から行きやすい店舗を優先",
      }}
    />
  );
}

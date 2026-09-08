import type { Metadata } from "next";
import {
  Building2,
  Camera,
  MapPin,
  Mic2,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Shirt,
  Sparkles,
  Star,
} from "lucide-react";

import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "资源库" };

export default function ResourcesPage() {
  const resources = [
    {
      name: "衡山路礼堂",
      type: "婚宴酒店",
      contact: "周经理 · 138 **** 2156",
      address: "徐汇区衡山路",
      icon: Building2,
      rating: "4.9",
      note: "梧桐厅已留档期",
      tone: "coral",
    },
    {
      name: "白屿婚礼",
      type: "婚礼策划",
      contact: "Ella · 186 **** 7712",
      address: "静安区巨鹿路",
      icon: Sparkles,
      rating: "4.8",
      note: "已完成二次沟通",
      tone: "lavender",
    },
    {
      name: "东奇摄影工作室",
      type: "摄影",
      contact: "东奇 · 135 **** 0942",
      address: "徐汇区安福路",
      icon: Camera,
      rating: "4.9",
      note: "当前方案已选择",
      tone: "peach",
    },
    {
      name: "言川主持",
      type: "主持人",
      contact: "言川 · 137 **** 6321",
      address: "上海 · 可出差",
      icon: Mic2,
      rating: "4.7",
      note: "档期已确认",
      tone: "blue",
    },
    {
      name: "MUSE BRIDAL",
      type: "婚纱礼服",
      contact: "Nina · 189 **** 3187",
      address: "徐汇区武康路",
      icon: Shirt,
      rating: "4.8",
      note: "09.15 二次试纱",
      tone: "rose",
    },
    {
      name: "之间影像",
      type: "摄影",
      contact: "Linn · 133 **** 4270",
      address: "长宁区愚园路",
      icon: Camera,
      rating: "4.8",
      note: "报价待确认",
      tone: "lavender",
    },
  ];

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow="Our little black book · 18 contacts"
        title="遇见过的好选择，都放在这里。"
        description="商家、场地和独立服务者只记录一次，在不同候选方案里自由引用。"
        action={
          <Button size="lg">
            <Plus />
            添加新资源
          </Button>
        }
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="bg-card border-border/70 flex max-w-md flex-1 items-center gap-2 rounded-full border px-4 py-3">
          <Search className="text-muted-foreground size-4" />
          <input
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            placeholder="搜索名称、联系人或地址"
          />
        </div>
        <div className="flex scrollbar-none gap-2 overflow-x-auto">
          {["全部 18", "婚宴 3", "策划 4", "影像 5", "造型 3"].map(
            (item, index) => (
              <button
                key={item}
                className={`shrink-0 rounded-full px-4 py-2 text-[11px] transition-colors ${index === 0 ? "bg-primary text-primary-foreground" : "bg-card border-border/70 hover:bg-muted border"}`}
              >
                {item}
              </button>
            ),
          )}
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <article
              key={resource.name}
              className="bg-card border-border/70 group rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(155,138,251,.12)] sm:p-6"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`grid size-11 place-items-center rounded-2xl ${resource.tone === "coral" ? "bg-primary/8 text-primary" : resource.tone === "lavender" ? "bg-[#9B8AFB]/10 text-[#7566D8]" : resource.tone === "peach" ? "bg-[#FFB07C]/15 text-[#C56C39]" : resource.tone === "blue" ? "bg-[#9B8AFB]/10 text-[#7566D8]" : "bg-primary/8 text-primary"}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Star className="size-3 fill-[#FFB07C] text-[#FFB07C]" />
                    {resource.rating}
                  </span>
                  <MoreHorizontal className="text-muted-foreground size-4" />
                </div>
              </div>
              <p className="text-muted-foreground mt-6 text-[9px] tracking-[0.16em] uppercase">
                {resource.type}
              </p>
              <h2 className="font-editorial mt-1.5 text-xl">{resource.name}</h2>
              <div className="text-muted-foreground mt-5 space-y-2.5 text-[11px]">
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5" />
                  {resource.contact}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-3.5" />
                  {resource.address}
                </p>
              </div>
              <div className="bg-muted/60 mt-5 rounded-2xl px-3.5 py-3 text-[10px]">
                {resource.note}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

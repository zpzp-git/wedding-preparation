type ModulePlaceholderProps = {
  title: string;
};

export function ModulePlaceholder({ title }: ModulePlaceholderProps) {
  return (
    <section aria-labelledby="module-title" className="max-w-5xl">
      <p className="text-muted-foreground text-sm">备婚规划</p>
      <h1 id="module-title" className="mt-1 text-2xl font-semibold sm:text-3xl">
        {title}
      </h1>
      <div className="text-muted-foreground mt-8 border-t pt-6 text-sm">
        模块骨架已就绪
      </div>
    </section>
  );
}

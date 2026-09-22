import type { ReactNode } from "react";

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: PageHeadingProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-primary/75 mb-2 text-xs font-medium tracking-[0.06em]">
          {eyebrow}
        </p>
        <h1 className="font-editorial text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground mt-2 max-w-2xl text-base leading-7">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

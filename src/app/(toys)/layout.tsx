function ToysLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col gap-2">
      {/* TODO: 表示崩れするので prose-pre:whitespace-pre-wrap を指定している */}
      <article className="prose prose-blockquote:font-normal prose-pre:whitespace-pre-wrap max-w-2xl">
        {children}
      </article>
    </div>
  );
}

export default ToysLayout;

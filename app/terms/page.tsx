import fs from "fs";
import path from "path";
import Markdown from "react-markdown";

export default function Terms() {
  const terms = fs.readFileSync(
    path.join(process.cwd(), "content", "legal", "terms.md"),
    "utf8"
  );

  return (
    <main className="container mx-auto p-4 md:p-12 xl:p-24">
      <article className="prose prose-lg dark:prose-invert">
        <Markdown>{terms}</Markdown>
      </article>
    </main>
  );
}

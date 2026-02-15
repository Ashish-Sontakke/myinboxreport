import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/config";

const contentDir = path.join(process.cwd(), "content");

function getPage(slug: string) {
  const filePath = path.join(contentDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content) as string;

  return { frontmatter: data, html };
}

export function generateStaticParams() {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));
  return files.map((f) => ({ slug: f.replace(/\.md$/, "") }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return {};

  return {
    title: `${page.frontmatter.title} - ${siteConfig.name}`,
    description: page.frontmatter.description,
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();

  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        {page.frontmatter.title}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Last updated: {page.frontmatter.lastUpdated}
      </p>
      <div
        className="prose dark:prose-invert mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: page.html }}
      />
    </div>
  );
}

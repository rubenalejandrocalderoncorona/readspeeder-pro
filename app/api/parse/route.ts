import { NextRequest, NextResponse } from "next/server";
import { cleanText, countWords } from "@/lib/parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    if (ext === "pdf") {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      const cleaned = cleanText(result.text);
      const title = cleaned.split("\n")[0].trim().slice(0, 80) || "Untitled PDF";
      return NextResponse.json({ title, content: cleaned, wordCount: countWords(cleaned) });
    }

    if (ext === "epub") {
      const ePub = (await import("epubjs")).default;
      const book = ePub(buffer.buffer as ArrayBuffer);
      await book.ready;

      let title = "Untitled EPUB";
      try {
        const meta = (book as any).packaging?.metadata;
        if (meta?.title) title = meta.title;
      } catch (_) {}

      const spine = (book.spine as unknown) as { items: Array<{ href: string }> };
      let fullText = "";
      for (const item of spine.items.slice(0, 50)) {
        try {
          const section = book.spine.get(item.href);
          if (!section) continue;
          const doc = await section.load(book.load.bind(book));
          const el = doc as unknown as Document;
          fullText += " " + (el?.body?.textContent ?? "");
        } catch (_) { continue; }
      }

      const cleaned = cleanText(fullText);
      return NextResponse.json({ title, content: cleaned, wordCount: countWords(cleaned) });
    }

    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Parse failed" },
      { status: 500 }
    );
  }
}

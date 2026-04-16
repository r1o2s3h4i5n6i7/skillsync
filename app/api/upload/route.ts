import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "misc"; // assignments, courses, avatars

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueFileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
    
    // Normalize path: store courses in /images to match existing files, others in /uploads
    const targetFolder = (folder === "courses") ? "images" : `uploads/${folder}`;
    const publicDir = join(process.cwd(), "public", targetFolder);
    
    // Ensure dir exists
    try {
      await mkdir(publicDir, { recursive: true });
    } catch {}

    const filePath = join(publicDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = (folder === "courses") ? `/images/${uniqueFileName}` : `/uploads/${folder}/${uniqueFileName}`;

    // Save FileMeta to DB
    const fileMeta = await prisma.fileMeta.create({
      data: {
        fileName: file.name,
        filePath: publicUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploaderId: user.id
      }
    });

    return NextResponse.json({ url: publicUrl, fileMeta });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

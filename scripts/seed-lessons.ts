import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mockParagraphs = [
  "In this module, we will deeply explore the foundational concepts that govern the entire framework. Understanding these core principles is essential not only for mastering this technology but also for establishing a solid base upon which scalable systems can be built. As we move through the material, you'll encounter several real-world scenarios illustrating why these concepts are critical.",
  
  "Let's break down the architecture. At the heart of the system lies a robust processing engine designed to handle concurrent operations seamlessly. This mechanism differs fundamentally from traditional sequential execution models, offering performance boosts that become incredibly evident when scaling horizontally. We'll examine the specific algorithms that make this possible.",
  
  "It is highly recommended that you take notes during this section, as the complexity ramps up significantly. We'll be bridging the theory with practical implementation. Remember that trial and error is part of the learning curve; do not be discouraged by initial roadblocks."
];

async function main() {
  console.log("Seeding lessons...");

  const courses = await prisma.course.findMany({ select: { id: true, title: true } });
  
  for (const course of courses) {
    const lessonCount = await prisma.lesson.count({ where: { courseId: course.id } });
    
    // Only seed if empty or less than 5
    if (lessonCount < 5) {
      console.log(`Seeding lessons for course: ${course.title}`);
      const toAdd = 5 + Math.floor(Math.random() * 5); // 5 to 9 lessons
      
      for (let i = 0; i < toAdd; i++) {
        await prisma.lesson.create({
          data: {
            courseId: course.id,
            title: `Module ${i + 1}: Core Concepts of ${course.title.split(" ")[0]}`,
            duration: `${15 + Math.floor(Math.random() * 30)}m`,
            type: "INTERACTIVE",
            xpReward: 50 + Math.floor(Math.random() * 50),
            orderIndex: i + lessonCount + 1,
            content: {
              text: [
                { content: mockParagraphs[0] },
                { content: mockParagraphs[1] },
              ],
              youtubeLinks: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
              referenceLinks: ["https://developer.mozilla.org/en-US/"]
            }
          }
        });
      }
      console.log(`Added ${toAdd} lessons to ${course.title}.`);
    } else {
      console.log(`Skipped ${course.title} (already has ${lessonCount} lessons).`);
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

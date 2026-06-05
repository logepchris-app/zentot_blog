import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// Ορίζουμε τον τύπο για να έχουμε καθαρό TypeScript
export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  coverImage: string | null;
  date: string;
};

export async function getPosts(): Promise<BlogPost[]> {
  const databaseId = process.env.NOTION_DATABASE_ID!;

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Published",
      checkbox: { equals: true },
    },
    sorts: [{ property: "Date", direction: "descending" }],
  });

  // Εδώ "καθαρίζουμε" το JSON του Notion
  const posts = response.results.map((post: any) => {
    return {
      id: post.id,
      title: post.properties.Name.title[0]?.plain_text || "Χωρίς Τίτλο",
      slug: post.properties.Slug.rich_text[0]?.plain_text || "",
      // Μαζεύουμε όλα τα tags (π.χ. destinations, airplane tips)
      tags: post.properties.Tags.multi_select.map((tag: any) => tag.name),
      // To Notion έχει δύο τύπους εικόνων: ανέβασμα ή εξωτερικό link
      coverImage: post.cover?.external?.url || post.cover?.file?.url || null,
      date: post.properties.Date?.date?.start || "",
    };
  });

  return posts;
}
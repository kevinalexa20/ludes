import { chatCompletion } from "../lib/llm-client.js";
import { calculatePricing, AIListingResult, FoodCategory } from "@ludes/shared";

const SYSTEM_PROMPT = `Kamu adalah ahli makanan Indonesia. Analisis foto makanan ini dan berikan informasi dalam format JSON berikut:

{
  "name": "Nama makanan dalam bahasa Indonesia (singkat, jelas, menggugah selera)",
  "description": "Deskripsi 1-2 kalimat yang menggugah selera dalam bahasa Indonesia",
  "category": "nasi | mie | lauk | kue | minuman | snack | lainnya",
  "marketing_caption": "Caption pemasaran singkat dan menarik untuk dibagikan di WhatsApp dalam bahasa Indonesia"
}

Aturan:
- Nama harus spesifik (bukan "makanan" atau "hidangan")
- Deskripsi harus menggugah selera dan informatif
- Kategori harus akurat berdasarkan jenis makanan dan HARUS salah satu dari nilai yang ditentukan di atas
- Jawab HANYA JSON, tanpa teks tambahan, markdown, atau pembungkus code blocks seperti \`\`\`json`;

export async function generateListingFromPhoto(
  imageBase64: string,
  originalPrice: number
): Promise<AIListingResult> {
  // Ensure imageBase64 has the correct format for the API (must be a valid data URL or base64 string)
  let imageUrl = imageBase64;
  if (!imageUrl.startsWith("data:")) {
    imageUrl = `data:image/jpeg;base64,${imageUrl}`;
  }

  let attempt = 0;
  const maxAttempts = 2;
  let lastError: Error | null = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await chatCompletion([
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analisis foto makanan ini dan berikan output JSON sesuai format.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ]);

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("Response content from AI is empty.");
      }

      // Clean the content in case the LLM returned markdown code blocks
      let cleanedContent = content;
      if (cleanedContent.startsWith("```json")) {
        cleanedContent = cleanedContent.substring(7);
      } else if (cleanedContent.startsWith("```")) {
        cleanedContent = cleanedContent.substring(3);
      }
      if (cleanedContent.endsWith("```")) {
        cleanedContent = cleanedContent.substring(0, cleanedContent.length - 3);
      }
      cleanedContent = cleanedContent.trim();

      const parsed = JSON.parse(cleanedContent);

      // Validate parsed content
      const rawName = parsed.name || "Makanan Hemat";
      const rawDescription = parsed.description || "Makanan lezat dan hemat.";
      let rawCategory = (parsed.category || "lainnya").toLowerCase().trim() as FoodCategory;
      const validCategories: FoodCategory[] = ["nasi", "mie", "lauk", "kue", "minuman", "snack", "lainnya"];
      if (!validCategories.includes(rawCategory)) {
        rawCategory = "lainnya";
      }

      const marketingCaption = parsed.marketing_caption || `Yuk beli ${rawName} di Ludes! Hanya dengan harga bersahabat.`;

      // Calculate pricing suggest using @ludes/shared calculatePricing
      const pricingResult = calculatePricing(originalPrice, rawCategory, 2); // Default 2 hours before close

      const pricing = {
        suggested_min: pricingResult.suggestedMin,
        suggested_max: pricingResult.suggestedMax,
        suggested_discount_pct: pricingResult.discountPct,
        reason: `Rekomendasi harga Rp ${pricingResult.suggestedMin.toLocaleString("id-ID")} - Rp ${pricingResult.suggestedMax.toLocaleString("id-ID")} (Diskon ${pricingResult.discountPct}%) karena kategori ${rawCategory} memiliki limitasi harga lantai demi melindungi keuntungan warung kamu.`,
        floor_price: pricingResult.floorPrice,
      };

      return {
        name: rawName,
        description: rawDescription,
        category: rawCategory,
        pricing,
        marketing_caption: marketingCaption,
      };
    } catch (error: any) {
      lastError = error;
      console.warn(`Attempt ${attempt} to generate listing failed: ${error.message}`);
    }
  }

  throw new Error(`Gagal memproses foto makanan dengan AI: ${lastError?.message || "Kesalahan tidak diketahui"}`);
}

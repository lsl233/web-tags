export async function recommendTags(title: string, description: string, existingTags: string[]) {
  const prompt = `Based on the following text, recommend the most relevant tags from the list: ${existingTags.join(', ')}. Return only the tag names that exist in the list, as a comma-separated list, for example: AI, Machine Learning, Data Science.\n\nText: ${title}. ${description}`;
  const response = await fetch(
    "https://api.deepseek.com/v1/chat/completions",
    {
      method: "POST",
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 50,
        temperature: 0.5
      }),
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const data = await response.json()
  return data.choices[0].message.content.trim().split(", ");
}
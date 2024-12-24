const Groq = require('groq-sdk');

export async function POST(req) {
    try {
        const groq = new Groq({ apiKey: process.env.GROQ_API });
        // console.log("Got Groq instance:", groq);

        const { transcript, llm } = await req.json();
        // console.log("Received transcript (first 50 chars):", transcript.slice(0, 50));
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: 
                        "Create a detailed and well-structured markdown article based on the following transcript. " +
                        "Ensure that the article has clear, appropriate header structures. Use `#` for the main title, `##` for section headings, and `###` for sub-sections. " +
                        "Incorporate various markdown formatting styles where needed. These include **bold text**, *italic text*, lists (both ordered and unordered), blockquotes, " +
                        "code formatting using backticks, and hyperlinks (e.g., [text](url)) when appropriate. " +
                        "Focus on the key points, breaking down complex ideas and clarifying difficult sections. " +
                        "Maintain a smooth narrative flow and a proper journalistic tone, like a blog article. MOST importantly, never you mention that it's a vidoe. ABSOLUTELY DON'T EVER reference or mention that the content comes from a YouTube video—keep it neutral and in the style of an article, as if part of a written publication." + transcript
                }
            ],
            model: llm,
            temperature: 1,
            max_tokens: 1024,
            top_p: 1,
            stream: true,
        });
                

        // console.log("chatCompletion initialized successfully.");

        let result = ''; // Initialize an empty string to accumulate the content

        for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || ''; // Safely extract content
            result += content; // Append the content to the result
        }

        // Ensure the result has content
        if (!result.trim()) {
            // console.warn("Result is empty or whitespace!");
            return new Response(
                JSON.stringify({ article: "No content generated." }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // // console.log("Sending article in response:", result);
        const jsonResponse = JSON.stringify({ article: result });
        // // console.log("Serialized JSON response:", jsonResponse);

        return new Response(jsonResponse, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        // console.error("Error occurred during transcript to article conversion:", error);
        return new Response(
            JSON.stringify({
                source: "transcriptToArticle threw an error", 
                error: error.message,
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}

import { YoutubeTranscript } from 'youtube-transcript';
// import { v4 as uuidv4 } from 'uuid';
import User from "../../models/User";
import mongoose from 'mongoose';

function concatenateText(data) {
    return data.map(item => item.text).join(' ');
}

export async function POST(req) {
    try {
        const { video, email, llm } = await req.json();
        console.log(`Received request to summarize video: ${video} email: ${email}`);

        // Fetch YouTube transcript and concatenate text
        const responseRaw = await YoutubeTranscript.fetchTranscript(video, { lang: "en" });
        const text = concatenateText(responseRaw);

        // Extract cookies from the original request
        const authToken = req.cookies.get('authToken')?.value;

        if (!authToken) {
            throw new Error('Authentication token not found in request cookies.');
        }

        // Forward the request to /api/transcriptToArticle with cookies
        const response = await fetch('/api/transcriptToArticle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Pass the authToken in the cookie header
                Cookie: `authToken=${authToken}`,
            },
            body: JSON.stringify({ transcript: text, llm: llm }),
        });

        if (!response.ok) {
            throw new Error("Failed to fetch article");
        }

        const articleData = await response.json();
        const { article } = articleData;

        // Fetch YouTube video details
        const video_info = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${process.env.GOOGLE_API}&id=${video}&part=snippet`)
            .then(res => res.json());
        const videoTitle = video_info.items[0].snippet.title;
        const video_thumbnail = video_info.items[0].snippet.thumbnails.medium;

        const articleId = new mongoose.Types.ObjectId(); // Generate a Mongoose ObjectId
        const createdAtDate = new Date();

        // Connect to MongoDB if not already connected
        if (mongoose.connection.readyState !== 1) {
            console.log("MongoDB not connected, connecting...");
            await mongoose.connect(process.env.MONGODB_URI
                //     {
                //     useUnifiedTopology: true,
                // }
            );
            console.log("MongoDB connected.");
        } else {
            console.log("MongoDB is already connected.");
        }

        // Find user by email and save the article
        const user = await User.findOne({ email });

        if (user) {
            const newArticle = {
                _id: articleId,
                videoTitle,
                video_thumbnail,
                videoUrl: `https://www.youtube.com/watch?v=${video}`,
                content: article,
                favorite: false,
                createdAt: createdAtDate,
            };

            user.articles.push(newArticle);
            user.videosSummarized += 1;
            await user.save();

            console.log("Saved article:", newArticle); // Log the saved article for debugging
        } else {
            throw new Error("User not found. Please register first.");
        }

        return new Response(
            JSON.stringify({
                article: {
                    _id: articleId.toString(), // Convert ObjectId to string
                    videoTitle: videoTitle,
                    video_thumbnail: video_thumbnail,
                    videoUrl: `https://www.youtube.com/watch?v=${video}`,
                    content: article,
                    favorite: false,
                    createdAt: createdAtDate,
                },
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error("Error:", error);
        return new Response(
            JSON.stringify({
                source: "summarizeProcess threw an error",
                error: error.message,
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}

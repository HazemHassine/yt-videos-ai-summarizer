import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '../../models/User';

export async function GET(req) {

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken');
    // console.log("token", token);
    if (!token) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const decoded = verify(token.value, process.env.JWT_SECRET);
    console.log("decoded:", decoded);
    // MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.log("MongoDB not connected, connecting...");
      await mongoose.connect(process.env.MONGODB_URI,
        //   {
        //   useUnifiedTopology: true,
        // }
      );
      console.log("MongoDB connected.");
    }
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stats = {
      videosSummarized: user.videosSummarized || 0,
      articlesSaved: user.articles.length || 0,
      favoriteArticles: user.articles.filter(article => article.favorite).length || 0,
      email: decoded.email,
      displayName: decoded.displayName
    };

    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


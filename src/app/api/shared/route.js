import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../models/User';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shareToken = searchParams.get('shareToken');

  // Debug: Log the received shareToken
  console.log('Received shareToken:', shareToken);

  if (!shareToken) {
    return NextResponse.json({ error: 'Share token is required' }, { status: 400 });
  }

  try {
    // Debug: Check if MongoDB is connected
    console.log('MongoDB connection state:', mongoose.connection.readyState);

    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected.');
    }

    const user = await User.findOne({ 'articles.shareToken': shareToken });

    // Debug: Log the retrieved user object
    console.log('User found:', user);

    if (!user) {
      console.log('User not found');
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const article = user.articles.find((a) => a.shareToken === shareToken);

    // Debug: Log the retrieved article
    console.log('Article found:', article);

    if (!article) {
      console.log('Article not found');
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Return only necessary fields
    const sharedArticle = {
      _id: article._id,
      videoTitle: article.videoTitle,
      video_thumbnail: article.video_thumbnail,
      videoUrl: article.videoUrl,
      content: article.content,
      createdAt: article.createdAt,
    };

    console.log('Returning shared article:', sharedArticle);

    return NextResponse.json({ article: sharedArticle });
  } catch (error) {
    console.error('Error fetching shared article:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

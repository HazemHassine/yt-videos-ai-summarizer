import SharedArticle from '../../../components/SharedArticle';

export default async function SharedArticlePage({ params }) {
    // Await the params if needed
    const parameters = await params;
    const shareToken = parameters.shareToken;
      return (
        <div className="relative min-h-screen bg-gray-100">
          <SharedArticle shareToken={shareToken} />
        </div>
      );
    }
    
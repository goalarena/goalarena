const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
}

// In-memory cache
const cache = new Map<string, { data: YouTubeVideo[]; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const cached = cache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache HIT] ${query}`);
    return cached.data;
  }

  console.log(`[Cache MISS] Fetching: ${query}`);
  
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=CAISAhAB`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  if (!response.ok) {
    console.error(`YouTube fetch failed: ${response.status}`);
    return [];
  }

  const html = await response.text();
  
  // Extract video data from ytInitialData
  const dataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s);
  if (!dataMatch) {
    console.error('Could not find ytInitialData');
    return [];
  }

  try {
    const data = JSON.parse(dataMatch[1]);
    const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
    
    if (!contents) return [];

    const videos: YouTubeVideo[] = [];
    
    for (const section of contents) {
      const items = section?.itemSectionRenderer?.contents;
      if (!items) continue;
      
      for (const item of items) {
        const renderer = item?.videoRenderer;
        if (!renderer) continue;
        
        const videoId = renderer.videoId;
        const title = renderer?.title?.runs?.[0]?.text || '';
        const channel = renderer?.ownerText?.runs?.[0]?.text || '';
        const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        // Filter: only football/highlights content
        const titleLower = title.toLowerCase();
        const isRelevant = titleLower.includes('highlight') || 
                          titleLower.includes('goal') || 
                          titleLower.includes('vs') ||
                          titleLower.includes('match') ||
                          titleLower.includes('resume') ||
                          titleLower.includes('ملخص') ||
                          titleLower.includes('özet');
        
        if (videoId && isRelevant) {
          videos.push({ id: videoId, title, thumbnail, channel });
        }
        
        if (videos.length >= 12) break;
      }
      if (videos.length >= 12) break;
    }

    // If strict filter returned too few, take any video results
    if (videos.length < 3) {
      for (const section of contents) {
        const items = section?.itemSectionRenderer?.contents;
        if (!items) continue;
        for (const item of items) {
          const renderer = item?.videoRenderer;
          if (!renderer) continue;
          const videoId = renderer.videoId;
          if (videoId && !videos.find(v => v.id === videoId)) {
            videos.push({
              id: videoId,
              title: renderer?.title?.runs?.[0]?.text || '',
              thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              channel: renderer?.ownerText?.runs?.[0]?.text || '',
            });
          }
          if (videos.length >= 12) break;
        }
        if (videos.length >= 12) break;
      }
    }

    cache.set(query, { data: videos, timestamp: Date.now() });
    return videos;
  } catch (e) {
    console.error('Parse error:', e);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { queries } = await req.json() as { queries?: string[] };
    
    const defaultQueries = [
      'football highlights today goals',
      'Premier League highlights goals',
      'Champions League highlights',
      'La Liga highlights goals today',
      'Serie A Bundesliga highlights',
    ];

    const searchQueries = queries?.length ? queries : defaultQueries;
    
    const allVideos: YouTubeVideo[] = [];
    const seenIds = new Set<string>();

    for (const q of searchQueries) {
      const results = await searchYouTube(q);
      for (const v of results) {
        if (!seenIds.has(v.id)) {
          seenIds.add(v.id);
          allVideos.push(v);
        }
      }
      if (allVideos.length >= 30) break;
    }

    return new Response(JSON.stringify({ success: true, videos: allVideos.slice(0, 30) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('youtube-search error:', error);
    return new Response(JSON.stringify({ success: false, videos: [], error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

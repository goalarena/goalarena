import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Football news templates for generating realistic content
const NEWS_TEMPLATES = [
  // Latest News
  { category: 'Latest News', titleTemplate: '{team1} secure dramatic {score} victory over {team2} in {league}', teams: ['Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Arsenal', 'Bayern Munich', 'PSG', 'Juventus', 'AC Milan', 'Chelsea', 'Manchester United', 'Atletico Madrid', 'Borussia Dortmund', 'Inter Milan', 'Napoli'] },
  { category: 'Latest News', titleTemplate: '{player} scores stunning hat-trick as {team1} dominate {team2}', players: ['Haaland', 'Mbappé', 'Vinicius Jr', 'Salah', 'Bellingham', 'Saka', 'Yamal', 'Pedri'] },
  { category: 'Latest News', titleTemplate: '{league} title race heats up as {team1} close gap on leaders', leagues: ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'] },
  
  // Transfer News
  { category: 'Transfer News', titleTemplate: '{team1} agree €{fee}M deal for {player} from {team2}', fees: ['45', '60', '75', '90', '120'] },
  { category: 'Transfer News', titleTemplate: 'BREAKING: {player} set to join {team1} in blockbuster summer move', },
  { category: 'Transfer News', titleTemplate: '{team1} eye {player} as potential replacement for departing star', },
  { category: 'Transfer News', titleTemplate: 'Transfer deadline day: {team1} and {team2} battle for {player} signature', },
  
  // Player News
  { category: 'Player News', titleTemplate: '{player} signs new long-term contract extension with {team1}', },
  { category: 'Player News', titleTemplate: '{player} ruled out for {weeks} weeks with knee injury', weeks: ['4', '6', '8', '10', '12'] },
  { category: 'Player News', titleTemplate: '{player} wins {award} after outstanding season', awards: ['Ballon d\'Or', 'FIFA Best Player', 'Golden Boot', 'Player of the Month', 'Young Player of the Year'] },
  { category: 'Player News', titleTemplate: '{player} breaks {record} record in historic performance', records: ['goal-scoring', 'assist', 'appearance', 'Champions League'] },
  
  // Match News
  { category: 'Match News', titleTemplate: '{team1} vs {team2}: Tactical breakdown of the {league} clash', },
  { category: 'Match News', titleTemplate: 'Five things we learned from {team1}\'s victory over {team2}', },
  { category: 'Match News', titleTemplate: '{team1} {score} {team2}: Match report and player ratings', scores: ['3-1', '2-0', '4-2', '1-0', '2-1', '3-0'] },
  
  // League News
  { category: 'League News', titleTemplate: '{league} standings update: Who is leading the title race?', },
  { category: 'League News', titleTemplate: 'Champions League draw: {team1} face {team2} in quarter-finals', },
  { category: 'League News', titleTemplate: '{league} relegation battle: Three teams fighting for survival', },
  
  // Champions League
  { category: 'Champions League', titleTemplate: 'Champions League: {team1} stun {team2} with late comeback', },
  { category: 'Champions League', titleTemplate: '{player} shines as {team1} advance to Champions League semi-finals', },
];

const TEAMS = ['Real Madrid', 'Barcelona', 'Manchester City', 'Liverpool', 'Arsenal', 'Bayern Munich', 'PSG', 'Juventus', 'AC Milan', 'Chelsea', 'Manchester United', 'Atletico Madrid', 'Borussia Dortmund', 'Inter Milan', 'Napoli', 'Tottenham', 'Newcastle', 'Aston Villa', 'Roma', 'Bayer Leverkusen'];
const PLAYERS = ['Erling Haaland', 'Kylian Mbappé', 'Vinicius Jr', 'Mohamed Salah', 'Jude Bellingham', 'Bukayo Saka', 'Lamine Yamal', 'Pedri', 'Florian Wirtz', 'Cole Palmer', 'Phil Foden', 'Rodri', 'Robert Lewandowski', 'Harry Kane', 'Kevin De Bruyne', 'Martin Ødegaard', 'Jamal Musiala'];
const LEAGUES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League', 'Ligue 1'];
const IMAGES = [
  'https://images.unsplash.com/photo-1508098682722-e99c643e7f0d?w=800&q=80',
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80',
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80',
  'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80',
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80',
  'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80',
  'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80',
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800&q=80',
  'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80',
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickTwo<T>(arr: T[]): [T, T] {
  const a = pick(arr);
  let b = pick(arr);
  while (b === a) b = pick(arr);
  return [a, b];
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);
}

function generateArticle(template: typeof NEWS_TEMPLATES[0], index: number) {
  const [team1, team2] = pickTwo(TEAMS);
  const player = pick(PLAYERS);
  const league = pick(LEAGUES);
  const score = pick(template.scores || ['2-1', '3-0', '1-0']);
  const fee = pick(template.fees || ['50', '70', '85']);
  const weeks = pick(template.weeks || ['6']);
  const award = pick(template.awards || ['Player of the Month']);
  const record = pick(template.records || ['goal-scoring']);

  let title = template.titleTemplate
    .replace('{team1}', team1)
    .replace('{team2}', team2)
    .replace('{player}', player)
    .replace('{league}', league)
    .replace('{score}', score)
    .replace('{fee}', fee)
    .replace('{weeks}', weeks)
    .replace('{award}', award)
    .replace('{record}', record);

  const summary = `${title}. Get the full story with analysis, reactions, and what this means for the rest of the season.`;

  const content = `<p>${summary}</p>
<h2>Full Story</h2>
<p>In a thrilling development for football fans worldwide, ${title.toLowerCase()}. The football world has been buzzing with reactions from pundits, fans, and fellow professionals alike.</p>
<p>This comes at a crucial point in the season, with implications for ${league} standings and upcoming fixtures. Fans and analysts have been quick to share their thoughts on social media.</p>
<h2>Expert Analysis</h2>
<p>Leading football analysts have weighed in on the situation. Former players and current pundits have offered diverse perspectives on what this means for the clubs and players involved.</p>
<p>The tactical implications are significant, with potential changes to team formations and strategies in upcoming matches.</p>
<h2>What's Next?</h2>
<p>All eyes will be on the next round of fixtures as teams look to capitalize on this development. Stay tuned for more updates and in-depth analysis.</p>`;

  // Stagger dates over the last 7 days
  const daysAgo = Math.floor(index / 4);
  const hoursAgo = (index % 4) * 6;
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);

  return {
    title,
    summary,
    content,
    image_url: pick(IMAGES),
    category: template.category,
    slug: slugify(title) + '-' + Date.now().toString(36) + index,
    author: pick(['Sports Desk', 'Football Insider', 'Match Reporter', 'Transfer Expert', 'Tactical Analyst']),
    created_at: date.toISOString(),
  };
}

// Transfer templates
const TRANSFER_TEMPLATES = [
  { player: 'Victor Osimhen', from: 'Napoli', to: 'Chelsea', fee: '€75M', status: 'official' },
  { player: 'Florian Wirtz', from: 'Bayer Leverkusen', to: 'Real Madrid', fee: '€130M', status: 'rumor' },
  { player: 'Alexander Isak', from: 'Newcastle', to: 'Barcelona', fee: '€90M', status: 'rumor' },
  { player: 'Khvicha Kvaratskhelia', from: 'PSG', to: 'Manchester City', fee: '€80M', status: 'rumor' },
  { player: 'Jamal Musiala', from: 'Bayern Munich', to: 'Manchester City', fee: '€120M', status: 'rumor' },
  { player: 'Lamine Yamal', from: 'Barcelona', to: 'Barcelona', fee: 'Contract Extension', status: 'official' },
  { player: 'Cole Palmer', from: 'Chelsea', to: 'Chelsea', fee: 'Contract Extension', status: 'completed' },
  { player: 'Aurélien Tchouaméni', from: 'Real Madrid', to: 'Liverpool', fee: '€70M', status: 'rumor' },
  { player: 'Rasmus Højlund', from: 'Manchester United', to: 'AC Milan', fee: '€45M', status: 'rumor' },
  { player: 'Nico Williams', from: 'Athletic Bilbao', to: 'Arsenal', fee: '€58M', status: 'rumor' },
  { player: 'Jonathan David', from: 'Lille', to: 'Tottenham', fee: 'Free Transfer', status: 'completed' },
  { player: 'Xavi Simons', from: 'PSG', to: 'Bayern Munich', fee: '€90M', status: 'official' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let body: { action?: string } = {};
    try { body = await req.json(); } catch {}

    const action = body.action || 'seed';

    if (action === 'seed') {
      // Check existing count
      const { count } = await supabase.from('news_items').select('*', { count: 'exact', head: true });
      
      if ((count || 0) >= 20) {
        return new Response(JSON.stringify({ message: 'News already seeded', count }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate 30 news articles
      const articles = [];
      const usedTemplates = [...NEWS_TEMPLATES];
      for (let i = 0; i < 30; i++) {
        const template = usedTemplates[i % usedTemplates.length];
        articles.push(generateArticle(template, i));
      }

      const { error: newsError } = await supabase.from('news_items').insert(articles);
      if (newsError) {
        console.error('News insert error:', newsError);
        return new Response(JSON.stringify({ error: newsError.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Seed transfers too
      const { count: transferCount } = await supabase.from('transfers').select('*', { count: 'exact', head: true });
      if ((transferCount || 0) < 5) {
        const transfers = TRANSFER_TEMPLATES.map((t, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            player_name: t.player,
            from_club: t.from,
            to_club: t.to,
            fee: t.fee,
            status: t.status,
            created_at: date.toISOString(),
          };
        });

        const { error: transferError } = await supabase.from('transfers').insert(transfers);
        if (transferError) console.error('Transfer insert error:', transferError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        newsGenerated: articles.length,
        message: 'Content seeded successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

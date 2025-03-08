import { createClient } from '@supabase/supabase-js';
import { Game } from './types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export const fetchGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase
    .from('Games')
    .select(`
      id,
      Game_Title,
      Platform,
      Genre,
      Sub_Genre,
      Age_Rating,
      Max_Offline_Players,
      Game_Modes,
      Developer,
      Release_Year,
      Price_to_Sell_For,
      Metacritic_Score,
      User_Score,
      Short_Description,
      Key_Features,
      Unique_Selling_Point,
      image_url_medium,
      Youtube_link
    `);

  if (error) {
    console.error('Supabase error:', error);
    return [];
  }

  return data as Game[];
};

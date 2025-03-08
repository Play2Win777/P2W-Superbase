export interface Game {
  id: string;
  Game_Title: string;
  Platform: string;
  Genre: string;
  Sub_Genre: string | null;
  Age_Rating: string;
  Max_Offline_Players: string;
  Game_Modes: string[];
  Developer: string;
  Release_Year: number;
  Price_to_Sell_For: number;
  Metacritic_Score: number | null;
  User_Score: number | null;
  Short_Description: string;
  Key_Features: string;
  Unique_Selling_Point: string | null;
  image_url_medium: string;
  Youtube_link: string | null;
}

export interface CartItem {
  id: string;
  Game_Title: string;
  Price_to_Sell_For: number;
  quantity: number;
  isFlashSaleEligible?: boolean; // Add this line
}

export interface FilterState {
  platform: string;
  genre: string;
  subGenre: string;
  gameModes: string[];
  priceRange: { min: number; max: number };
}

/**
 * Our Little Universe 💗 - Couple Quiz Question Bank
 * Exactly 200 Unique Two-Player Questions across 10 Thoughtful Categories.
 * Mandatory: Every question features options + "Other" for custom answers.
 */

(function() {
  'use strict';

  const QUIZ_CATEGORIES = {
  "favourite_things": {
    "name": "Favourite Things",
    "icon": "🍦",
    "count": 25,
    "isSensitive": false
  },
  "personality_habits": {
    "name": "Personality & Daily Habits",
    "icon": "☕",
    "count": 20,
    "isSensitive": false
  },
  "interests_dreams": {
    "name": "Interests & Dreams",
    "icon": "✨",
    "count": 20,
    "isSensitive": false
  },
  "feelings_needs": {
    "name": "Feelings & Emotional Needs",
    "icon": "🫂",
    "count": 25,
    "isSensitive": false
  },
  "insecurities_fears": {
    "name": "Insecurities & Fears",
    "icon": "🌱",
    "count": 15,
    "isSensitive": true
  },
  "love_language": {
    "name": "Love Language & Affection",
    "icon": "💖",
    "count": 20,
    "isSensitive": false
  },
  "relationship_prefs": {
    "name": "Relationship Preferences",
    "icon": "💑",
    "count": 25,
    "isSensitive": false
  },
  "fun_random": {
    "name": "Fun & Random",
    "icon": "🎲",
    "count": 20,
    "isSensitive": false
  },
  "future_together": {
    "name": "Future Together",
    "icon": "🏡",
    "count": 15,
    "isSensitive": false
  },
  "deep_connection": {
    "name": "Deep Connection",
    "icon": "🌌",
    "count": 15,
    "isSensitive": true
  }
};

  const COUPLE_QUIZ_QUESTIONS = [
  {
    "id": "fav_01",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their absolute favourite comfort food when they've had a long day?",
    "options": [
      "Warm pizza or pasta",
      "Hot noodle soup / ramen",
      "Fresh dessert / ice cream",
      "Home-cooked traditional meal",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_02",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their go-to warm or cold drink order?",
    "options": [
      "Iced caramel latte / coffee",
      "Chai or herbal tea",
      "Fresh fruit smoothie / boba",
      "Hot cocoa with marshmallows",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_03",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite colour palette or aesthetic?",
    "options": [
      "Soft pastels (pink, cream, lavender)",
      "Earthy tones (sage, beige, terracotta)",
      "Deep moody hues (navy, emerald, burgundy)",
      "Bright cheerful colors (yellow, sky blue)",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_04",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "Which dessert can they never say no to?",
    "options": [
      "Rich chocolate brownie or cake",
      "Creamy cheesecake",
      "Fresh fruit tart or strawberry shortcake",
      "Warm cookies or waffles with ice cream",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_05",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite movie genre to watch on a cozy evening?",
    "options": [
      "Feel-good romantic comedy",
      "Thrilling mystery or sci-fi",
      "Animated Disney / Ghibli movie",
      "Heartwarming drama or documentary",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_06",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite season of the year?",
    "options": [
      "Spring with blooming flowers & mild breezes",
      "Sunny summer with beach days & long evenings",
      "Golden autumn with cozy sweaters & falling leaves",
      "Chilly winter with blankets & festive lights",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_07",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What kind of music do they listen to when they are alone?",
    "options": [
      "Acoustic, indie & gentle lo-fi",
      "Upbeat pop & dance hits",
      "R&B, soul & romantic classics",
      "Rock, alternative or soundtrack scores",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_08",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite way to spend a lazy Sunday morning?",
    "options": [
      "Sleeping in and cuddling in bed",
      "Making a slow, delicious breakfast together",
      "Reading a book or listening to music",
      "Going out for a gentle walk or coffee run",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_09",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite animal or spirit creature?",
    "options": [
      "Playful puppy or dog",
      "Gentle, independent cat",
      "Cute bear or panda",
      "Graceful dolphin or ocean creature",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_10",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "Which type of snack do they crave during a movie night?",
    "options": [
      "Buttery / caramel popcorn",
      "Crispy potato chips & dip",
      "Gummy candy & chocolate bites",
      "Nachos with warm cheese & salsa",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_11",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite type of vacation destination?",
    "options": [
      "Tropical beach with turquoise water",
      "Quiet mountain cabin in the woods",
      "Historic cultural city with museums & cafes",
      "Scenic countryside road trip",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_12",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite scent or candle fragrance?",
    "options": [
      "Sweet vanilla & baked treats",
      "Fresh floral (jasmine, lavender, rose)",
      "Crisp rain & ocean breeze",
      "Warm sandalwood & cedarwood",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_13",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite article of clothing that makes them feel most confident?",
    "options": [
      "An oversized cozy hoodie or sweater",
      "A stylish dress or sharp fitted shirt",
      "Comfortable matching loungewear",
      "Their favourite jacket or denim coat",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_14",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite book or storytelling genre?",
    "options": [
      "Heartfelt romance & fiction",
      "Fantasy worlds & epic adventures",
      "Mystery, detective & thriller",
      "Inspirational self-growth & memoirs",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_15",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite board game, card game, or video game vibe?",
    "options": [
      "Cozy simulation games (Animal Crossing, Stardew)",
      "Fun party games & trivia with laughs",
      "Strategic card games or Uno",
      "Story-driven adventure or puzzle games",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_16",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite childhood memory topic they smile about?",
    "options": [
      "Family holidays and summer vacations",
      "Funny mischief with childhood friends",
      "A beloved pet they grew up with",
      "Playing outside until the streetlights came on",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_17",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite breakfast or brunch plate?",
    "options": [
      "Fluffy pancakes or French toast with syrup",
      "Avocado toast with poached eggs",
      "Full savory breakfast platter",
      "Fresh pastries and coffee",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_18",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite time of day when they feel most alive?",
    "options": [
      "Early sunrise with crisp quiet air",
      "Warm sunny afternoon",
      "Golden hour sunset with painted skies",
      "Peaceful late night when the world is asleep",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_19",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite TV show or series they can rewatch forever?",
    "options": [
      "A comfort sitcom (Friends, Brooklyn 99, The Office)",
      "An emotional K-drama or romantic series",
      "A thrilling fantasy or drama series",
      "A cozy anime or animation",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_20",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite flower or botanical plant?",
    "options": [
      "Romantic red or pink roses",
      "Bright, joyful sunflowers",
      "Delicate cherry blossoms or peonies",
      "Cozy indoor succulents and leafy plants",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_21",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite sweet flavouring?",
    "options": [
      "Rich chocolate or hazelnut",
      "Sweet strawberry or berries",
      "Salted caramel or honey",
      "Matcha green tea or pistachio",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_22",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite physical accessory to wear?",
    "options": [
      "A meaningful necklace or pendant",
      "A delicate ring or bracelet",
      "A stylish watch or earrings",
      "A cute beanie, hat, or hair accessory",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_23",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite way to stay refreshed on a hot summer day?",
    "options": [
      "Sipping an ice-cold lemonade or iced tea",
      "Taking a dip in a cool pool or ocean",
      "Eating frozen fruit pops or watermelon",
      "Relaxing indoors in cool air conditioning",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_24",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite type of cuisine when eating out?",
    "options": [
      "Italian (pasta, pizza, risotto)",
      "Asian (Japanese, Thai, Chinese, Indian)",
      "Mexican (tacos, quesadillas, burritos)",
      "American classic comfort diner",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fav_25",
    "category": "favourite_things",
    "categoryName": "Favourite Things",
    "categoryIcon": "🍦",
    "isSensitive": false,
    "question": "What is their favourite little sound that brings them instant peace?",
    "options": [
      "Gentle rain tapping against the window",
      "Crackling firewood in a fireplace",
      "Ocean waves crashing on the shore",
      "Birds chirping on a quiet morning",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_01",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "Are they naturally an early morning bird or a late night owl?",
    "options": [
      "Morning bird — energetic at dawn",
      "Night owl — most creative after dark",
      "A bit of both depending on the day",
      "Always sleepy regardless of the hour",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_02",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "What is the very first thing they usually do after waking up?",
    "options": [
      "Check phone notifications and messages",
      "Reach out for a morning stretch or cuddle",
      "Drink a glass of water or brew coffee",
      "Lie in bed contemplating life for 10 minutes",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_03",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "How do they typically recharge their energy when drained?",
    "options": [
      "Quiet solo time in a cozy room",
      "Spending gentle one-on-one time with partner",
      "Going for a walk outdoors in nature",
      "Watching a comfort show or taking a long nap",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_04",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "When getting ready to go out, how punctual are they usually?",
    "options": [
      "Ready 10 minutes ahead of time",
      "Right on the exact minute",
      "Running 5 to 10 minutes behind with a smile",
      "Always double-checking everything before leaving",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_05",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "How do they prefer to organize their personal space or room?",
    "options": [
      "Neat, organized and minimalist",
      "Cozy organized chaos with everything in reach",
      "Cleans in sudden spontaneous bursts of energy",
      "Keeps common spaces tidy, personal desk creative",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_06",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "When making a decision, do they rely more on logic or intuition?",
    "options": [
      "Heart & gut feeling first",
      "Thoughtful logic and pros/cons lists",
      "A balanced mixture of both",
      "Asks their partner or best friend for reassurance",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_07",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "What is their typical grocery shopping habit?",
    "options": [
      "Strict list and sticks exactly to it",
      "Starts with a list but buys fun snack surprises",
      "Browses every aisle impulsively",
      "Wants to get in and get out as fast as possible",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_08",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "How do they handle background noise when trying to focus?",
    "options": [
      "Needs complete, peaceful silence",
      "Listens to music or instrumental lo-fi beats",
      "Likes ambient cafe or background chatter",
      "Can focus through almost any noise",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_09",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "What is their bedtime phone habit?",
    "options": [
      "Puts phone down 30 minutes before sleep",
      "Scrolls social media or videos until eyes close",
      "Texts or calls partner until drifting off",
      "Checks tomorrow's alarm three times to be safe",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_10",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "How do they react to unexpected changes in weekend plans?",
    "options": [
      "Rolls with it smoothly and finds the fun",
      "Takes a moment to adjust before moving forward",
      "Prefers sticking to the original plan if possible",
      "Actually enjoys spontaneous surprises more",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_11",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "What is their texting personality with their partner?",
    "options": [
      "Quick replies with lots of hearts & cute emojis",
      "Sends funny reels, memes, and photos throughout the day",
      "Prefers longer thoughtful paragraphs",
      "Better on voice notes or direct phone calls",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_12",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "How do they approach their to-do list?",
    "options": [
      "Tackles the hardest task first",
      "Knocks out small easy tasks to build momentum",
      "Procrastinates a little, then rushes with superpower focus",
      "Keeps mental notes rather than written lists",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_13",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "In social gatherings, where are they most likely found?",
    "options": [
      "Chatting warmly in a small circle of close friends",
      "Befriending the host's pet in the corner",
      "Mingling and laughing with everyone in the room",
      "Right next to their partner sharing sweet glances",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_14",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "What is their natural response when someone gives them a genuine compliment?",
    "options": [
      "Blushes and smiles shyly",
      "Accepts it with a warm, confident thank you",
      "Playfully deflects or compliments the person right back",
      "Gets adorably flustered",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_15",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "How do they take care of themselves when catching a cold?",
    "options": [
      "Wants cozy cuddles, soup, and gentle pampering",
      "Prefers resting quietly in bed with lots of sleep",
      "Tries to power through it like nothing is wrong",
      "Takes every vitamin and herbal tea immediately",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_16",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "What is their relationship with daily hydration?",
    "options": [
      "Carries a water bottle everywhere like a best friend",
      "Needs gentle reminders from partner to drink water",
      "Drinks mostly coffee, tea, or juice instead",
      "Only drinks when genuinely parched",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_17",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "How do they handle packing for a weekend trip?",
    "options": [
      "Packs days in advance with neatly folded outfits",
      "Packs the night before or hours before leaving",
      "Overpacks 'just in case' options for every scenario",
      "Packs light and minimalist in one backpack",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_18",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "What is their quirk when eating their favourite meal?",
    "options": [
      "Saves the very best bite for last",
      "Eats their favorite part first",
      "Mixes all the ingredients together",
      "Offers their partner a bite before taking their own",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_19",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "How do they feel about cooking together?",
    "options": [
      "Loves it — considers it an intimate romantic date",
      "Happy to be the sous-chef or taste tester",
      "Prefers doing the dishes while partner cooks",
      "Loves baking sweet things together rather than dinner",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "hab_20",
    "category": "personality_habits",
    "categoryName": "Personality & Daily Habits",
    "categoryIcon": "☕",
    "isSensitive": false,
    "question": "What is their go-to stress relief habit at the end of the week?",
    "options": [
      "A long warm bath or hot shower",
      "Curling up in blankets with a favorite snack & movie",
      "Going for a relaxing drive or nature walk",
      "Having deep, unhurried conversations with partner",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_01",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is a creative skill or hobby they have always wanted to master?",
    "options": [
      "Playing a musical instrument (piano, guitar)",
      "Painting, pottery, or digital art",
      "Cooking gourmet meals or pastry baking",
      "Photography or videography",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_02",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "If they could take a dream bucket-list trip tomorrow, where would it be?",
    "options": [
      "Northern Lights in Iceland or Norway",
      "Historic romantic cities of Italy & France",
      "Cherry blossom season & temples in Japan",
      "Tropical overwater villa in the Maldives",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_03",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What would their absolute dream home look like?",
    "options": [
      "A bright modern home with floor-to-ceiling windows",
      "A cozy cottage with a lush flower garden & porch",
      "A stylish city penthouse with skyline views",
      "A warm wooden cabin nestled near mountains or lake",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_04",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "If money were no object, what dream project would they pursue?",
    "options": [
      "Opening an animal rescue shelter or sanctuary",
      "Running a cozy bookshop-café with warm pastries",
      "Travelling the world documenting different cultures",
      "Building an eco-friendly community or charity",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_05",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is an adventurous activity on their bucket list?",
    "options": [
      "Hot air balloon ride at sunrise",
      "Scuba diving among coral reefs",
      "Stargazing at an international dark sky park",
      "Scenic coastal road trip in a camper van",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_06",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "Which language would they love to speak fluently overnight?",
    "options": [
      "French or Italian for romance & travel",
      "Japanese or Korean for culture & media",
      "Spanish for worldwide warmth & music",
      "Any language that lets them connect with people",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_07",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What kind of museum or exhibition would they genuinely enjoy visiting?",
    "options": [
      "Modern art & interactive light installations",
      "Natural history & planetarium star shows",
      "Classical art & sculpture galleries",
      "Science, technology & innovation discovery centers",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_08",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is an area of study or topic they secretly find fascinating?",
    "options": [
      "Space exploration, astronomy & the cosmos",
      "Human psychology & how emotions work",
      "Ancient mythology, folklore & history",
      "Architecture, interior design & aesthetic spaces",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_09",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What kind of pet would be part of their dream future?",
    "options": [
      "A cuddly golden retriever or rescue pup",
      "One or two sweet, affectionate indoor cats",
      "A pair of bunnies or cute smaller animals",
      "A whole loving menagerie of rescued animals",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_10",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "If they could attend any live event, what would make their heart race?",
    "options": [
      "Front-row concert of their all-time favourite artist",
      "An enchanting classical orchestra or Broadway musical",
      "A lively outdoor music festival with fairy lights",
      "An exciting sports championship or theatre premiere",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_11",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is a childhood dream career they once had?",
    "options": [
      "Astronaut or explorer",
      "Artist, author or musician",
      "Veterinarian or wildlife doctor",
      "Teacher, scientist or architect",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_12",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What kind of garden would they love to cultivate?",
    "options": [
      "A vibrant English flower garden with sweet scents",
      "A fresh herb & organic vegetable garden",
      "A cozy balcony garden with hanging plants & lights",
      "A minimalist Japanese Zen garden with trickling water",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_13",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is their idea of a perfect weekend getaway?",
    "options": [
      "Renting an Airbnb cabin with a fireplace & hot tub",
      "A luxury seaside resort with spa treatments",
      "Camping under the stars with campfires & s'mores",
      "A lively boutique hotel in a vibrant new city",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_14",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "If they wrote a book, what genre would it most likely be?",
    "options": [
      "A deeply romantic love story based on true feelings",
      "An inspiring guide to finding happiness & purpose",
      "A whimsical fantasy novel with magical creatures",
      "A witty collection of life essays and humor",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_15",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is a practical life skill they take quiet pride in?",
    "options": [
      "Budgeting and smart financial planning",
      "Fixing, assembling, or repairing things by hand",
      "Navigating roads without getting lost",
      "Organizing spaces into clean, aesthetic havens",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_16",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is a dream festival or celebration they want to experience together?",
    "options": [
      "Lantern Festival with glowing lanterns filling the night",
      "New Year's Eve in a magical city square with fireworks",
      "A cozy Christmas market in Europe with mulled cider",
      "Holi or Carnival with vibrant colors and joyful dancing",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_17",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "How do they feel about learning a new shared hobby together?",
    "options": [
      "Excited — wants to take dance or cooking classes",
      "Loves the idea of a shared outdoor sport (tennis, hiking)",
      "Prefers creative indoor crafts (pottery, painting)",
      "Enjoys cozy gaming or reading together",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_18",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is a legacy or impact they want to leave on the world?",
    "options": [
      "Making people feel deeply loved and valued",
      "Creating art, beauty, or stories that outlast them",
      "Helping vulnerable animals or protecting nature",
      "Building a warm, loving, and supportive family",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_19",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "What is their dream way to celebrate a major milestone anniversary?",
    "options": [
      "Returning to the place where they first fell in love",
      "An intimate private dinner with candlelight and letters",
      "A breathtaking international trip just for the two of them",
      "A sweet surprise party surrounded by dearest loved ones",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "int_20",
    "category": "interests_dreams",
    "categoryName": "Interests & Dreams",
    "categoryIcon": "✨",
    "isSensitive": false,
    "question": "If they could master any culinary dish to perfection, what would it be?",
    "options": [
      "Authentic handmade pasta and secret sauce",
      "A signature bakery dessert that brings tears of joy",
      "Perfect grilled steak or gourmet seafood",
      "A traditional family recipe passed down with love",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_01",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "When they are feeling overwhelmed, what helps them feel safest?",
    "options": [
      "A warm, silent, holding embrace from their partner",
      "Having someone listen without trying to fix everything",
      "Quiet space to breathe and process their thoughts first",
      "Gentle words reminding them that everything will be okay",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_02",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What is their natural emotional response when they feel hurt?",
    "options": [
      "Becomes quiet and retreats into their shell",
      "Wants to talk it through immediately to clear the air",
      "Needs a few minutes to calm down before finding words",
      "Feels emotional and needs gentle physical comfort",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_03",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "How do they prefer to receive comfort after a tough workday?",
    "options": [
      "A warm meal, their favourite drink, and no pressure to talk",
      "A caring debrief where they can vent freely",
      "A soothing massage or back rub while watching TV",
      "A quiet cuddle session without discussing the stress",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_04",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What makes them feel most deeply understood by their partner?",
    "options": [
      "When their partner remembers small details they mentioned once",
      "When their partner senses their mood without them having to explain",
      "When their partner validates their emotions without judgment",
      "When their partner makes space for them to be 100% authentic",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_05",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "How do they express that they need a little extra reassurance?",
    "options": [
      "Asks directly for a cuddle, hug, or reassurance",
      "Becomes extra affectionate or seeks proximity",
      "Grows a bit quieter than usual",
      "Drops subtle hints or asks 'Are we okay?'",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_06",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What is their biggest source of daily emotional strength?",
    "options": [
      "The love and steady support of their partner",
      "Their inner resilience and personal principles",
      "Their family, close friendships, and loved ones",
      "Their faith, hope, and optimism for the future",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_07",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "When they make a mistake, how do they treat themselves?",
    "options": [
      "Can be overly self-critical and needs gentle reminders of grace",
      "Reflects quietly and tries hard to make things right",
      "Talks it through with partner to regain perspective",
      "Accepts it quickly as a learning experience",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_08",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What is the fastest way to turn their bad day into a brighter one?",
    "options": [
      "Surprising them with their favourite treat or snack",
      "Making them genuinely laugh with silly inside jokes",
      "Taking care of a chore or task so they can rest",
      "Wrapping them in a soft blanket with gentle hugs",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_09",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "How do they handle receiving constructive advice from their partner?",
    "options": [
      "Appreciates it when delivered with tenderness and love",
      "Listens thoughtfully, even if it takes a moment to absorb",
      "Prefers it in private, gentle one-on-one moments",
      "Responds best when positive appreciation is mentioned first",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_10",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What kind of environment makes them feel most relaxed at home?",
    "options": [
      "Soft lighting, clean surfaces, and calming music",
      "Cozy blankets, warm aromas, and fairy lights",
      "Fresh open air, daylight, and peaceful quiet",
      "A lively, warm, and lived-in comfortable atmosphere",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_11",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "When their partner is feeling sad, what is their instinctive impulse?",
    "options": [
      "To immediately hold them close and wipe away tears",
      "To offer practical solutions and take care of everything",
      "To stay by their side silently so they aren't alone",
      "To distract them with gentle humor, tea, and comfort",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_12",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What does an ideal sincere apology look like to them?",
    "options": [
      "Acknowledging the hurt feelings + a genuine 'I am sorry'",
      "Understanding why it hurt + a promise of changed action",
      "A gentle hug and a heart-to-heart reconnection",
      "Giving them time to breathe without rushing forgiveness",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_13",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "How do they feel about crying or showing vulnerability in front of their partner?",
    "options": [
      "Feels completely safe and embraced crying in partner's arms",
      "Takes a little vulnerability to open up, but values it deeply",
      "Tries to stay strong initially before letting tears flow",
      "Expresses vulnerability more through written words than tears",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_14",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What makes them feel proudest of themselves in their relationship?",
    "options": [
      "How deeply and loyally they care for their partner",
      "How much they have grown emotionally alongside their partner",
      "How well they navigate difficult days together as a team",
      "How they can make their partner smile even on hard days",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_15",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "When they feel lonely, what is the best remedy?",
    "options": [
      "A heartfelt phone or voice call hearing partner's voice",
      "Re-reading sweet past messages and looking at photos",
      "Planning the next time they will see each other in person",
      "A warm video call where they just share quiet presence",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_16",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What emotional habit do they appreciate most in their partner?",
    "options": [
      "Patience — never rushing them when they are emotional",
      "Emotional consistency — being a reliable, safe harbor",
      "Playfulness — keeping life lighthearted and joyful",
      "Gentleness — always choosing kindness even during disagreements",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_17",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "How do they process big life decisions?",
    "options": [
      "Sleeps on it for a few days to let feelings settle",
      "Discusses every detail back-and-forth with partner",
      "Researches options deeply and weighs outcomes",
      "Follows their initial gut instinct once verified",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_18",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What makes them feel like a top priority in their partner's life?",
    "options": [
      "Partner initiating spontaneous check-in texts and calls",
      "Partner actively carving out uninterrupted quality time",
      "Partner defending, championing, and supporting their dreams",
      "Partner remembering little things that matter to them",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_19",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "When they feel misunderstood, what is the best way to reconnect?",
    "options": [
      "Taking a gentle pause and restarting the conversation softly",
      "Partner asking: 'Help me understand what you are feeling'",
      "A warm embrace that reminds them love comes before debate",
      "Writing down feelings in a gentle text or letter",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_20",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "How do they feel about sharing their deepest secrets?",
    "options": [
      "Shares openly with complete trust in their partner",
      "Reveals layer by layer as emotional safety deepens",
      "Keeps only a few deeply private childhood thoughts to themselves",
      "Values an environment where judgment is completely absent",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_21",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What is their favourite emotional compliment to receive?",
    "options": [
      "'You make me feel safe, happy, and so loved'",
      "'I admire your kindness, wisdom, and strong heart'",
      "'You are the most beautiful person inside and out'",
      "'I am so proud of you and who you are becoming'",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_22",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "How do they react to unexpected romantic gestures?",
    "options": [
      "Melted with joy — remembers it forever with a full heart",
      "Gets adorably shy and flustered",
      "Wants to immediately give an equally sweet gesture back",
      "Takes a photo or keeps a memento to cherish",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_23",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What helps them fall asleep peacefully at night?",
    "options": [
      "Knowing their partner is safe, happy, and loves them",
      "A quiet room with a cool breeze and soft pillows",
      "Listening to soft rain sounds or gentle audio",
      "A sweet goodnight message or goodnight kiss",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_24",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What boundary helps them maintain emotional wellness?",
    "options": [
      "Having healthy solo downtime without guilt",
      "Keeping conflicts respectful without raised voices",
      "Honesty — even when the truth is slightly uncomfortable",
      "Protecting couple time from excessive work intrusion",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "emo_25",
    "category": "feelings_needs",
    "categoryName": "Feelings & Emotional Needs",
    "categoryIcon": "🫂",
    "isSensitive": false,
    "question": "What does unconditional love mean to them in one sentence?",
    "options": [
      "Choosing each other every single day, through every season",
      "Being loved for who you are, flaws and all, without masks",
      "A safe shelter where both partners can grow and thrive",
      "Standing together as teammates against the world",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_01",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "What is a gentle worry they sometimes have about the future?",
    "options": [
      "Not having enough time to achieve all their shared dreams",
      "The uncertainty of health, work, or life changes",
      "Losing loved ones or growing older too quickly",
      "Worries about being good enough for the people they love",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_02",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "When they feel slightly self-conscious about their appearance, what helps?",
    "options": [
      "Partner looking into their eyes and telling them they are beautiful",
      "A warm cuddle and gentle kisses on their forehead",
      "Reminding them of the things you love beyond physical appearance",
      "Giving them time and space without making a big deal of it",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_03",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "What is a common fear they have experienced regarding failure?",
    "options": [
      "Disappointing people who believe in them",
      "Putting their whole heart into something and not succeeding",
      "Letting their partner down in times of need",
      "Feeling stuck or not progressing in personal goals",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_04",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "How do they handle fear of rejection or awkwardness?",
    "options": [
      "Can be slightly guarded until they know they are welcomed",
      "Uses gentle humor and laughter to break the ice",
      "Prefers familiar spaces with people they already trust",
      "Faces it bravely even if their heart is racing inside",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_05",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "When they need emotional reassurance, what words mean the most?",
    "options": [
      "'I am not going anywhere. I love you and I am by your side.'",
      "'You are doing amazing, and I believe in you completely.'",
      "'You do not have to carry everything alone. Let's do it together.'",
      "'You are more than enough exactly as you are.'",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_06",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "What is a situation where they might feel slightly anxious?",
    "options": [
      "Walking into a large room where they know almost no one",
      "Having difficult conversations with authority figures",
      "Driving in heavy traffic or intense bad weather",
      "Public speaking or being put unexpectedly on the spot",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_07",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "How do they feel about their personal pace in life?",
    "options": [
      "Sometimes compares themselves to others and needs gentle grounding",
      "Confident that everything unfolds in its own right timing",
      "Wishes they were further along, but learning to celebrate small wins",
      "Focuses on their partner and personal joy rather than competition",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_08",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "What helps soothe their worries when feeling uncertain?",
    "options": [
      "Physical touch — holding hands, hugs, feeling partner's heartbeat",
      "Talking through the worst-case scenario and realizing it's okay",
      "Focusing on what can be controlled today and letting go of the rest",
      "A peaceful distraction like a comedy, walk, or delicious meal",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_09",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "What is a vulnerability they only reveal to their closest person?",
    "options": [
      "Their tender inner child that just wants to be cherished",
      "Their secret doubts about their talents or intelligence",
      "Their deepest fears about things outside their control",
      "How deeply emotional and sentimental they actually are",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_10",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "How do they react if they feel someone took advantage of their kindness?",
    "options": [
      "Feels deeply hurt, but quietly sets a firm boundary",
      "Gives the benefit of the doubt before addressing it",
      "Vents to their partner to release the frustration",
      "Forgives quickly to protect their own inner peace",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_11",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "What is a childhood worry they have successfully outgrown?",
    "options": [
      "Fear of the dark or spooky monsters under the bed",
      "Fear of making mistakes in front of the classroom",
      "Worrying too much about what strangers think of them",
      "Fear of trying new foods or new experiences",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_12",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "When they feel emotionally drained, what is their biggest worry?",
    "options": [
      "That they aren't giving enough energy to their partner",
      "That they won't recover their stamina for the week ahead",
      "That they are being boring or uninspired company",
      "That they need to apologize for needing rest (even though rest is healthy!)",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_13",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "What reassuring gesture from their partner instantly calms their heart?",
    "options": [
      "A gentle hand rested softly on their back or shoulder",
      "Partner making gentle eye contact with a sweet, knowing smile",
      "Partner softly stroking their hair or holding their hand tight",
      "Partner making them a warm cup of tea without being asked",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_14",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "How do they view their own sensitivity?",
    "options": [
      "As a superpower of empathy that sometimes needs gentle boundaries",
      "As something they treasure because it lets them love deeply",
      "Occasionally wishes they were a bit tougher, but accepts their soft heart",
      "A beautiful trait their partner cherishes and protects",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "ins_15",
    "category": "insecurities_fears",
    "categoryName": "Insecurities & Fears",
    "categoryIcon": "🌱",
    "isSensitive": true,
    "question": "What reminder helps them feel truly secure in this relationship?",
    "options": [
      "Remembering that love is a daily choice they both joyfully make",
      "Looking at photos of all the memories they have built together",
      "Hearing their partner speak fondly of their shared future",
      "The daily laughter, honest communication, and sweet hugs",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_01",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "Which primary love language makes them feel most deeply adored?",
    "options": [
      "Words of Affirmation (tender compliments & love letters)",
      "Quality Time (undivided attention & shared moments)",
      "Physical Touch (hugs, holding hands & cuddles)",
      "Acts of Service & Thoughtful Gifts",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_02",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "How do they naturally show love to their partner without thinking?",
    "options": [
      "Showering them with hugs, kisses, and sweet touches",
      "Doing practical things to make their partner's life easier",
      "Giving thoughtful little gifts and sweet treats",
      "Saying 'I love you' often and leaving sweet notes",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_03",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What kind of physical affection do they secretly crave most?",
    "options": [
      "Gentle forehead and cheek kisses",
      "Long, warm cuddles in bed on cold mornings",
      "Holding hands while walking together in public",
      "Playing with their hair or back scratches",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_04",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What kind of verbal praise means the world to them?",
    "options": [
      "Hearing that they are deeply loved and cherished",
      "Hearing that their partner is genuinely proud of them",
      "Hearing appreciation for small daily things they do",
      "Playful, romantic flirting that makes their cheeks pink",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_05",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What is their favourite kind of gift to receive from their partner?",
    "options": [
      "A handwritten letter or handmade sentimental memento",
      "Something they casually mentioned wanting weeks ago",
      "An experiential gift (concert, weekend trip, couple date)",
      "A cute, cozy surprise (plushie, hoodie, favorite sweet)",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_06",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What does high-quality quality time look like to them?",
    "options": [
      "Cooking or having dinner with phones completely put away",
      "Going on an adventurous walk or date exploring a new place",
      "Lying side by side in bed talking about everything and nothing",
      "Watching a movie together wrapped tightly in one big blanket",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_07",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "Which act of service melts their heart the fastest?",
    "options": [
      "Bringing them breakfast in bed or coffee in the morning",
      "Taking care of a tedious chore they were dreading",
      "Running an errand so they can rest their feet",
      "Packing a cute snack or lunch with a love note",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_08",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "How do they feel about public displays of affection (PDA)?",
    "options": [
      "Loves sweet hand-holding, gentle hugs, and soft cheek kisses",
      "Prefers keeping romance mostly private between the two of them",
      "Enjoys natural casual touch like hands around the waist",
      "Comfortable with whatever makes both partners feel sweet",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_09",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What spontaneous romantic gesture would make them gasp with happiness?",
    "options": [
      "Showing up unexpectedly with their favourite flowers & dessert",
      "Planning an entire surprise date night where they don't have to think",
      "Leaving tiny love notes hidden in their coat pocket or wallet",
      "Creating a romantic playlist filled with songs that tell their story",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_10",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What is their favourite pet name or term of endearment?",
    "options": [
      "Classic sweet terms (Baby, Honey, Sweetheart, Love)",
      "Cute whimsical nicknames (Bubu, Angel, Sunshine)",
      "A private inside-joke nickname only the two of them use",
      "Their actual name whispered softly with tender warmth",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_11",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "How do they like to say goodbye when leaving each other for the day?",
    "options": [
      "A long, warm embrace and a lingering kiss",
      "Multiple cute kisses and a 'Text me when you arrive safely!'",
      "A playful wink and a loving wave",
      "A sweet forehead kiss and a tight hand squeeze",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_12",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What is their favourite romantic setting?",
    "options": [
      "Candlelit dinner with fairy lights and soft music",
      "A blanket under the stars on a crisp quiet night",
      "A cozy fireplace inside a mountain cabin as snow falls",
      "A warm beach at sunset with waves washing over their feet",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_13",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "How do they prefer their partner to initiate physical affection?",
    "options": [
      "Gentle, spontaneous touches throughout the day",
      "Pulling them in for an unexpected warm bear hug",
      "Reaching for their hand while walking or sitting together",
      "Nuzzling their neck or resting head on their shoulder",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_14",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What makes a handwritten love letter special to them?",
    "options": [
      "The raw, honest expression of emotions from the heart",
      "Keeping the physical paper forever in a memory box",
      "Seeing their partner's unique handwriting and doodles",
      "Re-reading it on days when they miss each other deeply",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_15",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What is their reaction when their partner wears their clothes?",
    "options": [
      "Thinks it is the absolute cutest thing in the world",
      "Loves the scent their partner leaves on the fabric",
      "Playfully complains but secretly takes 10 photos",
      "Gladly hands over hoodies and shirts forever",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_16",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What is their favourite time to receive an 'I love you'?",
    "options": [
      "Right in the middle of an ordinary, mundane moment",
      "First thing in the morning when opening eyes",
      "Right before falling asleep at night",
      "During a deep, meaningful look across the room",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_17",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "How do they feel about matching couple items (shirts, keychains, bracelets)?",
    "options": [
      "Loves subtle, aesthetic matching items (bracelets, rings, mugs)",
      "Loves fully matching cute pajamas or hoodies at home",
      "Prefers complementary color palettes rather than identical items",
      "Happy to wear anything as long as it brings a smile",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_18",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What is their favourite sweet sound their partner makes?",
    "options": [
      "Their genuine, unfiltered belly laugh",
      "Their sleepy morning voice right after waking up",
      "The soft hum or singing when they are in a happy mood",
      "The gentle whisper of 'I love you' in their ear",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_19",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "How do they feel about cuddling during sleep?",
    "options": [
      "Loves falling asleep tangled up in each other's arms",
      "Cuddles for 15 minutes first, then rolls to their side for space",
      "Needs to at least have feet or hands touching all night",
      "Loves being the 'little spoon' or the 'big spoon'",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "lov_20",
    "category": "love_language",
    "categoryName": "Love Language & Affection",
    "categoryIcon": "💖",
    "isSensitive": false,
    "question": "What is the most romantic thing about their relationship?",
    "options": [
      "How they can be their silly, goofy selves without any pretense",
      "How safe, peaceful, and grounded they feel in each other's presence",
      "The deep friendship and loyalty beneath the romance",
      "How their love continues to grow sweeter with every passing day",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_01",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What was their favourite moment from the early days of dating?",
    "options": [
      "The very first time their eyes met and spark flew",
      "The first deep late-night conversation that lasted for hours",
      "The nervous first kiss that made hearts flutter",
      "The moment they realized 'This is the person I want'",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_02",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their ideal frequency for romantic date nights?",
    "options": [
      "At least once a week without fail",
      "A couple of cozy dates during the week + a fun weekend plan",
      "A mix of spontaneous weeknight dinners & monthly grand dates",
      "Every single evening spent together is a date in their eyes",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_03",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they prefer to handle minor disagreements?",
    "options": [
      "Talk it out calmly and lovingly right away",
      "Take 20 minutes to cool off, then discuss gently together",
      "Use humor and a warm hug to disarm tension first",
      "Focus on finding a solution as teammates rather than arguing",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_04",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their stance on phone privacy between partners?",
    "options": [
      "Complete open-book trust — nothing to hide whatsoever",
      "Open trust while respecting personal journaling & diary spaces",
      "Total trust where phones are left around freely without worry",
      "Believes honesty and transparency build the strongest bond",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_05",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What helps them rebuild connection after a busy, disconnected week?",
    "options": [
      "A dedicated weekend date with no phones and full attention",
      "An evening of cooking, cuddles, and watching a movie together",
      "Taking a scenic drive together just talking about life",
      "A long romantic breakfast in bed on Saturday morning",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_06",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their favourite couple tradition or ritual?",
    "options": [
      "Good morning and goodnight sweet messages without fail",
      "Weekly movie nights with special snacks",
      "Celebrating monthly milestones or special anniversaries",
      "A special kiss goodbye every time one of them walks out the door",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_07",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they prefer to divide chores and daily responsibilities?",
    "options": [
      "50/50 balance — working together like a synchronized team",
      "Dividing by personal preference (one cooks, the other cleans)",
      "Flexible — whoever has more energy picks up the slack lovingly",
      "Doing chores together with music playing to make it fun",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_08",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is an important boundary they value in relationships?",
    "options": [
      "Never going to bed staying angry without communicating love",
      "Never raising voices or speaking with disrespect during debates",
      "Protecting couple time from excessive external social drama",
      "Always being each other's safe confidante and protecting secrets",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_09",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they feel about celebrating Valentine's Day or anniversaries?",
    "options": [
      "Loves going all out with cards, gifts, dates & reservations",
      "Prefers an intimate, low-key, heartfelt celebration at home",
      "Loves celebrating with an adventurous weekend trip together",
      "Believes in celebrating love in little ways all 365 days of the year",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_10",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their favourite thing about their partner's family or friends?",
    "options": [
      "How warm and welcoming they have been from day one",
      "The funny stories and memories they share about partner",
      "Seeing where their partner got their wonderful traits from",
      "How much they support and cheer on your relationship",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_11",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they prefer to communicate when physically apart?",
    "options": [
      "Frequent sweet check-ins and photos throughout the day",
      "A long, heartwarming FaceTime / video call in the evening",
      "Voice notes sharing little thoughts and funny moments",
      "A balance of sweet texts during work and a goodnight call",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_12",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their favourite way to spend a rainy afternoon together?",
    "options": [
      "Reading books or napping together listening to the rain",
      "Baking warm cookies and drinking hot chocolate",
      "Playing board games or video games on the rug",
      "Watching a movie marathon wrapped up in one blanket",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_13",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their ideal balance between couple time and solo time?",
    "options": [
      "Mostly together, with healthy space for individual hobbies",
      "Equal balance of quality couple time and independent passions",
      "Loves 'parallel play' — being in the same room doing different things",
      "Enjoys doing almost everything together as best friends",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_14",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they like to handle financial teamwork in the relationship?",
    "options": [
      "Open, honest communication with shared budgeting goals",
      "Splitting shared costs evenly while keeping personal savings",
      "Taking turns treating each other to dates and fun experiences",
      "Focusing on building a secure, generous future together",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_15",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their favourite kind of couple photo?",
    "options": [
      "Candid, unposed moments bursting with genuine laughter",
      "Aesthetic, beautiful travel photos against scenic backdrops",
      "Cute, silly mirror selfies and goofy snapshots",
      "Warm, intimate close-ups holding each other gently",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_16",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they feel about double dates with other couple friends?",
    "options": [
      "Loves them — enjoys socializing and laughing as a foursome",
      "Enjoys them occasionally, but prefers one-on-one dates more",
      "Loves hosting couple game nights or dinners at home",
      "Enjoys casual double dates for fun activities (bowling, brunch)",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_17",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is the biggest green flag they saw in their partner early on?",
    "options": [
      "How respectfully and kindly they treat everyone around them",
      "How attentively they listened when partner spoke about their passions",
      "How consistent, reliable, and honest their actions matched their words",
      "How safe, calm, and peaceful they made their partner feel",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_18",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they like to celebrate good news or personal achievements?",
    "options": [
      "A special dinner date at a lovely restaurant to toast together",
      "A happy dance and heartfelt congratulations from partner",
      "A sweet surprise gift or cake to mark the milestone",
      "Sharing the happy news with close family and celebrating warmly",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_19",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their favourite thing to do on a road trip together?",
    "options": [
      "Singing along loudly to shared throwback playlists",
      "Having deep, wandering conversations about life and dreams",
      "Stopping at quirky roadside diners, viewpoints, and farm stands",
      "Holding hands across the center console while one drives",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_20",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they feel about PDA on social media?",
    "options": [
      "Loves posting cute appreciation photos and milestone celebrations",
      "Keeps relationship mostly private, sharing only with close friends",
      "Enjoys subtle, aesthetic photos that capture the vibe without oversharing",
      "Focuses on living the moment in real life rather than posting",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_21",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their favourite way to be cheered on when facing a challenge?",
    "options": [
      "Hearing partner say: 'You've got this, and I am right behind you'",
      "A good luck hug and an encouraging text message before the big event",
      "Partner helping with logistics so they can focus on their goal",
      "A celebration waiting for them regardless of the outcome",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_22",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "How do they handle differences in opinion on minor topics?",
    "options": [
      "Enjoys playful, respectful debates and learning partner's perspective",
      "Agrees to disagree with a laugh — differences keep life interesting",
      "Finds cute compromises that make both partners happy",
      "Focuses on the bigger picture of harmony and love",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_23",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What makes their home feel like a shared sanctuary?",
    "options": [
      "Framed memories, couple photos, and personal mementos",
      "A warm, welcoming, clutter-free, and fragrant atmosphere",
      "A kitchen stocked with both of their favourite foods and treats",
      "The feeling that both partners are completely relaxed and safe",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_24",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What is their favourite time of the week to connect?",
    "options": [
      "Friday evening when the workweek melts away into freedom",
      "Lazy Saturday mornings with no alarms and fresh coffee",
      "Sunday golden hour reflecting on the week and looking ahead",
      "Quiet weeknight moments right before bedtime",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "rel_25",
    "category": "relationship_prefs",
    "categoryName": "Relationship Preferences",
    "categoryIcon": "💑",
    "isSensitive": false,
    "question": "What has been the greatest gift of this relationship so far?",
    "options": [
      "Having a true soulmate and best friend to walk through life with",
      "Learning to love and be loved with complete authenticity",
      "All the endless laughter, inside jokes, and sweet memories",
      "The quiet peace of knowing someone is always on your team",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_01",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "If they were stranded on a deserted island, which item would they secretly pack?",
    "options": [
      "An endless supply of their favourite snacks and sweets",
      "A solar-powered music player with headphones",
      "A super cozy blanket and pillow",
      "A survival multitool and fire starter",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_02",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What is their silliest guilty pleasure?",
    "options": [
      "Binge-watching trashy reality TV or drama shows",
      "Eating cereal or dessert at 1:00 AM in the kitchen",
      "Singing dramatically in the shower using the shampoo bottle as a mic",
      "Looking at real estate listings for multimillion-dollar mansions",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_03",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "If they could possess one magical superpower, what would it be?",
    "options": [
      "Teleportation — to travel anywhere (or to partner) instantly",
      "Time travel — to revisit favorite sweet memories",
      "Invisibility or flying through the clouds",
      "Mind reading — to know what their partner is craving for dinner!",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_04",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "In a zombie apocalypse, what role would they play?",
    "options": [
      "The tactical strategist planning safe shelter and food routes",
      "The brave fighter protecting their partner at all costs",
      "The funny companion keeping spirits high with jokes",
      "The one who accidentally befriended a zombie because it looked cute",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_05",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What is their biggest funny pet peeve?",
    "options": [
      "Chewing loudly or noisy eating",
      "Slow walkers taking up the entire sidewalk",
      "Leaving empty boxes back in the fridge or pantry",
      "People who don't return shopping carts to the stall",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_06",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "If they won a million dollars tomorrow, what is the first silly thing they'd buy?",
    "options": [
      "A life-sized plushie or giant comfort bed",
      "An absurdly luxurious espresso or ice-cream machine",
      "First-class tickets for a spontaneous trip around the world",
      "A shopping spree for their partner and beloved pets",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_07",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What kind of character would they be in a romantic comedy movie?",
    "options": [
      "The charming, slightly clumsy protagonist who falls in love",
      "The witty, loyal best friend who always gives great advice",
      "The hopeless romantic planning elaborate sweet gestures",
      "The cool, mysterious love interest with a soft heart inside",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_08",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What is their go-to karaoke performance song vibe?",
    "options": [
      "Passionate, dramatic 90s/2000s ballad at the top of their lungs",
      "Fun, upbeat pop anthem that gets everyone dancing",
      "A cute romantic duet with their partner",
      "Nodding along in the crowd cheering their partner on instead",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_09",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "If they could magically trade lives with an animal for 24 hours, what would it be?",
    "options": [
      "A pampered indoor house cat napping in sunbeams all day",
      "A golden retriever showered with praise and tennis balls",
      "A soaring eagle flying freely over mountain peaks",
      "A playful river otter holding hands while floating on water",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_10",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What is their funniest habit when they think nobody is watching?",
    "options": [
      "Doing a little happy food dance when taking the first bite",
      "Talking to themselves or narrating what they are doing",
      "Making funny voices or sounds to pets and objects",
      "Checking their reflection and making silly faces in mirrors",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_11",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "If they had to live inside a fictional universe, which one would it be?",
    "options": [
      "Hogwarts / Harry Potter magical world",
      "Studio Ghibli aesthetic countryside with talking cats",
      "Disney / Pixar fairy tale kingdom with happy endings",
      "A cozy Animal Crossing island paradise",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_12",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "Would they rather explore the deep mysterious ocean or outer space?",
    "options": [
      "Deep ocean with glowing bioluminescent creatures",
      "Outer space with glittering nebulae and distant planets",
      "Neither — prefers exploring a warm cafe on solid ground!",
      "Both as long as their partner is holding their hand",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_13",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What is their typical reaction to a scary movie or horror jump scare?",
    "options": [
      "Jumps a foot in the air and hides behind their partner's shoulder",
      "Laughs at how cheesy the special effects are",
      "Closes their eyes through all the scary parts",
      "Genuinely loves the adrenaline rush and suspense",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_14",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "If they had to eat one single food for the rest of their life, what would it be?",
    "options": [
      "Artisanal pizza with their favourite toppings",
      "Fresh gourmet tacos and guacamole",
      "Authentic savory noodles / ramen",
      "Sushi rolls and fresh sashimi",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_15",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What is their philosophy on amusement park rollercoasters?",
    "options": [
      "Loves extreme thrill rides with loops and big drops!",
      "Prefers gentle, scenic rides like Ferris wheels and water flumes",
      "Will ride them only if holding partner's hand tightly",
      "Happily holds the bags and eats funnel cake on the ground",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_16",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "If they could have an endless lifetime supply of one drink, what would it be?",
    "options": [
      "Their favorite artisan iced coffee / latte",
      "Crisp iced peach tea or bubble tea",
      "Sparkling mineral water with fresh lemon",
      "Cozy spiced chai or hot chocolate",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_17",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What is their funny talent or weird party trick?",
    "options": [
      "Can remember obscure movie quotes or lyrics instantly",
      "Surprisingly flexible or good at balance tricks",
      "Great at making funny animal impressions",
      "Can guess the ending of movies within the first 15 minutes",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_18",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "If your couple story had a theme song, what vibe would it have?",
    "options": [
      "An acoustic, warm, romantic indie love song",
      "An upbeat, joyful, dance-in-the-kitchen pop bop",
      "A timeless, sweeping cinematic classic ballad",
      "A cozy, nostalgic lo-fi beat with soft melodies",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_19",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "How do they react when they lose in a friendly board game?",
    "options": [
      "Laughs it off and demands an immediate rematch!",
      "Pouts adorably for 10 seconds before smiling",
      "Congratulates their partner with a high five or kiss",
      "Secretly plots master strategy for next time",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fun_20",
    "category": "fun_random",
    "categoryName": "Fun & Random",
    "categoryIcon": "🎲",
    "isSensitive": false,
    "question": "What would their dream carnival prize be?",
    "options": [
      "The gigantic fluffy plushie on the top shelf",
      "A box of warm cotton candy and churros",
      "Winning bragging rights over their partner!",
      "A tiny matching couple souvenir",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_01",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is the very first room they want to decorate in a future shared home?",
    "options": [
      "The master bedroom — making it an ultra-cozy sanctuary",
      "The kitchen — a warm, spacious place for cooking together",
      "The living room — with a giant couch, big TV & fireplace",
      "A sunny garden, balcony or outdoor patio with fairy lights",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_02",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is a future holiday tradition they are excited to build together?",
    "options": [
      "Putting up the holiday tree together while drinking hot cocoa",
      "A special New Year's Eve getaway or reflection night",
      "Making a signature holiday breakfast in matching pajamas",
      "Hosting an annual friends & family gratitude dinner",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_03",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is their dream pace of life for the future?",
    "options": [
      "Peaceful, unhurried, and grounded in simple everyday joys",
      "Dynamic, adventurous, and filled with frequent travel",
      "A healthy balance of career ambition and rich family life",
      "Living close to nature with plenty of open space and fresh air",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_04",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "How do they envision their future mornings together in 10 years?",
    "options": [
      "Drinking warm coffee on the porch together as the sun rises",
      "Making breakfast as music plays softly in a bright kitchen",
      "Gentle morning walks with their beloved dog",
      "Cozy weekend lie-ins with no alarms and zero hurry",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_05",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What kind of home aesthetic do they dream of living in?",
    "options": [
      "Warm Scandinavian minimalist with soft textures & plants",
      "Cozy modern farmhouse with wooden beams & rustic charm",
      "Chic contemporary with sleek lines & artistic accents",
      "Boho sanctuary with cozy rugs, books, and warm ambient lamps",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_06",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "How do they feel about growing old together?",
    "options": [
      "Excited — dreams of being the cute old couple holding hands in the park",
      "Finds it romantic that their love will have decades of shared stories",
      "Looks forward to sitting in rocking chairs laughing at inside jokes",
      "Cherishes that every passing year makes their bond deeper",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_07",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is a major shared milestone they look forward to celebrating?",
    "options": [
      "Moving into their forever dream home together",
      "Taking a month-long bucket-list international adventure",
      "Reaching a major career or creative dream as a couple",
      "Celebrating their golden 50th wedding anniversary surrounded by love",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_08",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What value do they want to anchor their shared home with?",
    "options": [
      "Unconditional kindness, warmth, and open-door hospitality",
      "Continuous laughter, joy, and playful silliness",
      "Deep mutual respect, emotional safety, and open communication",
      "Curiosity, lifelong learning, and shared adventures",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_09",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is a shared domestic habit they look forward to?",
    "options": [
      "Grocery shopping on Saturday mornings picking out treats",
      "Going on evening post-dinner strolls around the neighborhood",
      "Sunday meal prep and baking together for the week",
      "Cuddling on the couch every night recapping their days",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_10",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "How do they envision family and pets in their future?",
    "options": [
      "A bustling, joyful home with kids and happy furry pets",
      "A peaceful home with beloved pets and close-knit family visits",
      "An adventurous life with pets that travel along with them",
      "A warm haven focused on nurturing deep, loving connections",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_11",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is a future travel goal they talk about with starry eyes?",
    "options": [
      "Taking a cross-country scenic road trip across natural parks",
      "Cruising through the Mediterranean or tropical islands",
      "Living in a foreign country together for a few months",
      "Exploring historical castles and ancient towns in Europe",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_12",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is something they never want to lose as the years go by?",
    "options": [
      "The playful spark, teasing, and romantic flirting",
      "The habit of holding hands whenever walking together",
      "The ability to talk for hours about anything without boredom",
      "The gratitude and appreciation for having found each other",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_13",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "How do they want their partner to support their future personal dreams?",
    "options": [
      "By being their loudest cheerleader and constant source of courage",
      "By providing practical advice and helping balance life's demands",
      "By giving them space and freedom to explore their passions",
      "By believing in them even on days when they doubt themselves",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_14",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is a future skill or hobby they want to learn as a couple?",
    "options": [
      "Learning couple ballroom or salsa dancing",
      "Learning gardening and growing their own food",
      "Learning a new language before traveling to that country",
      "Learning photography or woodworking together",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "fut_15",
    "category": "future_together",
    "categoryName": "Future Together",
    "categoryIcon": "🏡",
    "isSensitive": false,
    "question": "What is their ultimate definition of a successful life together?",
    "options": [
      "Looking back on a lifetime of deep love, smiles, and no regrets",
      "Building a peaceful sanctuary where both felt cherished and free",
      "Creating a positive ripple of kindness in the world around them",
      "Knowing they loved each other with everything they had every single day",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_01",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What core personal value guides their everyday life?",
    "options": [
      "Kindness & compassion — treating every soul with dignity",
      "Honesty & integrity — living authentically and truthfully",
      "Loyalty & commitment — standing by the people they love",
      "Growth & courage — striving to become a better person daily",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_02",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What does it mean for them to feel truly spiritually or emotionally connected?",
    "options": [
      "A quiet understanding where words aren't even necessary",
      "Being able to share darkest fears without fear of judgment",
      "Knowing their partner loves their soul, not just their surface",
      "Feeling like their lives were meant to intertwine in this universe",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_03",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What makes life feel most meaningful to them on an ordinary day?",
    "options": [
      "Sharing small, sweet moments of laughter with their partner",
      "Helping someone or brightening another person's day",
      "Creating something beautiful or learning something new",
      "Taking in the beauty of nature, sunsets, and peaceful moments",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_04",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What is something they appreciate most about their partner's character?",
    "options": [
      "Their gentle patience and caring, tender heart",
      "Their resilience, determination, and inner strength",
      "Their sense of humor and ability to bring light into darkness",
      "Their unwavering loyalty and how deeply they love",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_05",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "How do they define true emotional intimacy in a relationship?",
    "options": [
      "Complete psychological safety — being 100% naked emotionally",
      "Mutual vulnerability where both partners feel heard and valued",
      "Growing together through challenges without drifting apart",
      "Sharing your most sacred dreams, wounds, and hopes",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_06",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What is a life lesson they hold close to their heart?",
    "options": [
      "Time and love are the only things that truly matter in the end",
      "You cannot control the storm, but you can choose how you weather it",
      "Kindness is never wasted, even when unreturned",
      "Forgiveness is a gift you give yourself to keep your heart light",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_07",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What is something they hope their partner always remembers about them?",
    "options": [
      "That their love for their partner is steadfast, deep, and sincere",
      "That they always try their best, even on imperfect days",
      "How much their partner's happiness means to their own heart",
      "That they cherish every single second spent together",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_08",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "When they look back at how they have grown, what change are they most grateful for?",
    "options": [
      "Becoming more patient, understanding, and grounded",
      "Learning to communicate their feelings and boundaries clearly",
      "Letting go of perfectionism and embracing authentic joy",
      "Opening their heart to love someone without fear",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_09",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What does forgiveness mean to them in a loving relationship?",
    "options": [
      "Choosing to move forward as teammates without holding resentment",
      "Understanding that both partners are human and make mistakes",
      "A tender conversation followed by genuine growth and reassurance",
      "Re-anchoring in love because the relationship matters more than pride",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_10",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What is a subtle way their partner makes them feel deeply loved without saying a word?",
    "options": [
      "The tender, loving way their partner looks at them across a room",
      "How partner instinctively reaches for their hand in quiet moments",
      "How partner remembers their comfort preferences and anticipates needs",
      "The gentle, protective warmth of their partner's embrace",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_11",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What is a deep hope they carry for their partner's personal happiness?",
    "options": [
      "That partner achieves every dream their heart longs for",
      "That partner always feels safe, confident, and deeply valued",
      "That partner never loses their sparkling smile and joyful spirit",
      "That partner finds peaceful fulfillment in everything they do",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_12",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What does it feel like when they are completely at peace with their partner?",
    "options": [
      "Like coming home after a long journey to a warm fireplace",
      "Like taking off a heavy coat and taking a deep, clean breath",
      "Like floating gently on a calm, sunlit lake with no worries",
      "A quiet stillness in their chest where everything feels right",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_13",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "How do they view the challenges they have faced together so far?",
    "options": [
      "As stepping stones that made their love stronger and unbreakable",
      "As proof that they can overcome anything as a united team",
      "As gentle reminders to never take each other for granted",
      "As chapters in a love story that only deepened their bond",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_14",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "What does it mean to be a good partner to them?",
    "options": [
      "Listening with an open heart, offering grace, and loving faithfully",
      "Being a reliable teammate who celebrates joys and shares burdens",
      "Keeping romance alive while nurturing mutual personal freedom",
      "Showing up every day with kindness, respect, and a warm smile",
      "Other (Type custom answer...)"
    ]
  },
  {
    "id": "dep_15",
    "category": "deep_connection",
    "categoryName": "Deep Connection",
    "categoryIcon": "🌌",
    "isSensitive": true,
    "question": "If they could freeze one feeling between you two forever, what would it be?",
    "options": [
      "The gentle, magical warmth of holding each other close at night",
      "The pure, joyful laughter shared during silly private moments",
      "The overwhelming gratitude of having found each other in this vast universe",
      "The quiet certainty that you are each other's forever person",
      "Other (Type custom answer...)"
    ]
  }
];

  if (typeof window !== 'undefined') {
    window.QUIZ_CATEGORIES = QUIZ_CATEGORIES;
    window.COUPLE_QUIZ_QUESTIONS = COUPLE_QUIZ_QUESTIONS;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      QUIZ_CATEGORIES,
      COUPLE_QUIZ_QUESTIONS
    };
  }
})();

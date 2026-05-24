import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to prevent crash on startup if key is temporarily absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please verify your Secrets configuration in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Define the precise responseSchema as specified by the instructions
const movieQuerySchema = {
  type: Type.OBJECT,
  properties: {
    action_type: {
      type: Type.STRING,
      description: "Classify the user's intent as either 'mood_matcher' or 'movie_finder'."
    },
    movies: {
      type: Type.ARRAY,
      description: "List of highly curated movie recommendations or identified movies.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          year: { type: Type.INTEGER },
          region: {
            type: Type.STRING,
            description: "e.g., Hollywood, Bollywood, Korean, Chinese, Japanese"
          },
          genre: { type: Type.STRING },
          synopsis: {
            type: Type.STRING,
            description: "A brief, engaging summary of the movie."
          },
          match_reason: {
            type: Type.STRING,
            description: "Why this movie fits the user's description, query, or selected region and mood."
          },
          confidence_score: {
            type: Type.INTEGER,
            description: "0-100 score of how closely this matches their query."
          },
          imdb_rating: {
            type: Type.STRING,
            description: "The official or highly accurate IMDb rating of the movie, e.g., '8.5/10' or '7.9/10'."
          },
          imdb_url: {
            type: Type.STRING,
            description: "The direct IMDb URL representing the movie, e.g., 'https://www.imdb.com/title/tt1375666/' (Inception) or a correct IMDb search/details link."
          },
          image_url: {
            type: Type.STRING,
            description: "A highly descriptive, beautiful, real cinematic wallpaper background or movie poster URL. Use precise high-resolution Unsplash tags, e.g., 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1200' (space) or 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200' (neon cinema), or accurate IMDb/Google background image representations."
          }
        },
        required: [
          "title",
          "year",
          "region",
          "genre",
          "synopsis",
          "match_reason",
          "confidence_score",
          "imdb_rating",
          "imdb_url",
          "image_url"
        ]
      }
    },
    ui_metadata: {
      type: Type.OBJECT,
      description: "Styling data for interactive visual layout corresponding to recommending files' vibe.",
      properties: {
        environment_3d: {
          type: Type.STRING,
          description: "Suggested 3D style (e.g., 'dark_bloody_train_cabin', 'neon_cyberpunk', 'cozy_vintage_theater', 'dark_horror_corridor', 'rainy_tokyo_street', 'bright_comedy_club', 'epic_space_galaxy')."
        },
        color_palette: {
          type: Type.ARRAY,
          description: "An array of 3 hex color codes to apply to ambient lighting.",
          items: {
            type: Type.STRING
          }
        },
        interaction_sounds: {
          type: Type.OBJECT,
          properties: {
            click_sound: {
              type: Type.STRING,
              description: "Sound feedback (e.g., 'flesh_squelch', 'heavy_metal_clank', 'soft_bubble_pop', 'vintage_click', 'sci_fi_click')."
            },
            hover_sound: {
              type: Type.STRING,
              description: "Hover sweep sound (e.g., 'low_growl', 'lightsaber_hum', 'magical_chime', 'neon_hum', 'static_crackle')."
            },
            ambience: {
              type: Type.STRING,
              description: "Background audio theme name for synthesizer (e.g., 'distant_train_tracks_and_screams', 'rain_and_thunder', 'crowd_laughing', 'lofi_beats', 'space_drones', 'haunted_whispers', 'retro_jazz_vinyl')."
            }
          },
          required: [
            "click_sound",
            "hover_sound",
            "ambience"
          ]
        }
      },
      required: [
        "environment_3d",
        "color_palette",
        "interaction_sounds"
      ]
    }
  },
  required: [
    "action_type",
    "movies",
    "ui_metadata"
  ]
};

// API Endpoint for dynamic matching & recommendation
app.post("/api/movie-query", async (req, res) => {
  const { task, region, mood, query, exclude } = req.body;

  try {
    const ai = getGeminiClient();

    let userPromptString = "";
    
    // Inject excluded list under rigid directive
    const excludeList = Array.isArray(exclude) && exclude.length > 0 
      ? `\nCRITICAL DIRECTIVE: DO NOT recommend any of the following already recommended movie titles under any circumstances. Choose completely different films instead: ${JSON.stringify(exclude)}`
      : "";

    // Generate high-entropy seed to break standard paths or response caching
    const randomSeed = Math.random().toString(36).substring(2, 10) + "_" + Date.now();

    if (task === "mood_matcher") {
      const formattedMoods = Array.isArray(mood) ? mood.join(", ") : (mood || 'Classic');
      userPromptString = `As a highly creative and expert film curator, the user has requested movie recommendations from the region: "${region || 'Any'}" with mood/genre(s): "${formattedMoods}". Use the specified response schema to return JSON.

CRITICAL INSTRUCTION FOR VARIETY & RANDOMIZATION (Seed Token: ${randomSeed}):
- DO NOT ALWAYS RECOMMEND THE MOST OBVIOUS OR FAMOUS TITLES (e.g., if Bollywood + Action is chosen, do not just suggest 'Sholay', 'Bahubali' over and over again; if Hollywood + Action, avoid repeating 'Die Hard' or 'Mad Max' unless requested).
- Pull randomly from a deep, diverse, and robust pool of outstanding movies, hidden gems, cult classics, critical masterpieces, and high-quality films.
- Make each response surprising and unique by intentionally seeking different matching films across multiple calls.
${excludeList}

Ensure the match_reason is convincing and detailed. Generate fully customized ui_metadata matching the vibe (e.g. funny movies get a bright theme, horror get dark_bloody_train_cabin or dark_horror_corridor, sci-fi gets neon_cyberpunk or epic_space_galaxy, etc).`;
    } else {
      userPromptString = `The user is describing plot details, characters, or scenes in their own vague words: "${query || ''}". Act as an expert film detective to identify the exact movie they are searching for (return up to 3 candidate fits, ordered by highest confidence). State clear reasoning in the matches.

VARIETY INSTRUCTION (Seed Token: ${randomSeed}):
- If the description could fit multiple matching films, provide a highly diverse list of those candidates rather than repeating the single most obvious match.
${excludeList}

Provide rich ui_metadata matching the identified film's exact artistic direction (e.g. if searching for a train horror, return 'dark_bloody_train_cabin' along with eerie sounds and blood colors).`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPromptString,
      config: {
        responseMimeType: "application/json",
        responseSchema: movieQuerySchema,
        temperature: 0.95,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Failed to extract text prediction from the model response.");
    }

    // Since responseMimeType is application/json, parse and return
    res.json(JSON.parse(text.trim()));
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    res.status(500).json({
      error: err.message || "An error occurred while matching movies. Please try again."
    });
  }
});

// Configure Vite middleware in development or static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();

import {
  collection,
  // eslint-disable-next-line no-unused-vars
  addDoc,
  getDocs,
  // eslint-disable-next-line no-unused-vars
  deleteDoc,
  doc,
  // eslint-disable-next-line no-unused-vars
  setDoc,
  writeBatch
} from "firebase/firestore";
import { db } from "../config/firebase";

// TMDB Configuration
const API_KEY = "80d491707d8cf7b38aa19c7ccab0952f";
const BASE_URL = "https://api.themoviedb.org/3";

// --- Helper: Fetch Movies from API ---
const fetchMoviesFromAPI = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    const movies = data.results || [];

    // Enhance movies with trailer data
    const enhancedMovies = await Promise.all(movies.map(async (movie) => {
      let trailerKey = "";
      try {
        const videoRes = await fetch(`${BASE_URL}/movie/${movie.id}/videos?api_key=${API_KEY}`);
        const videoData = await videoRes.json();
        const trailer = videoData.results.find(v => v.type === "Trailer" && v.site === "YouTube");
        if (trailer) trailerKey = trailer.key;
      } catch (e) {
        console.warn(`Could not fetch trailer for movie ${movie.id}`,e);
      }

      return {
        id: String(movie.id), // Ensure ID is string for Firestore
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        release_date: movie.release_date,
        rating: movie.vote_average,
        vote_count: movie.vote_count,
        popularity: movie.popularity,
        original_language: movie.original_language,
        genre_ids: movie.genre_ids,
        trailer_key: trailerKey,
        status: "now_showing"
      };
    }));

    return enhancedMovies;
  } catch (error) {
    console.error("Error fetching from TMDB:", error);
    return [];
  }
};

// --- Theatres Data (8-10 fields) ---
const THEATRES = [
  {
    id: "theatre_1",
    name: "Grand Cinema Royale",
    location: "123 Downtown Blvd, Metropolis",
    amenities: ["IMAX", "Dolby Atmos", "Recliner Seats", "Gourmet Food"],
    capacity: 250,
    ticketPrice: { standard: 12, vip: 25 },
    contactInfo: "+1-555-0101",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-71053e68cc23?q=80&w=2066&auto=format&fit=crop",
    rating: 4.8,
    totalScreens: 5
  },
  {
    id: "theatre_2",
    name: "City Plex Mall",
    location: "456 Mall Road, Center City",
    amenities: ["4DX", "Food Court", "Arcade"],
    capacity: 180,
    ticketPrice: { standard: 10, vip: 20 },
    contactInfo: "+1-555-0202",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop",
    rating: 4.2,
    totalScreens: 3
  },
  {
    id: "theatre_3",
    name: "Starlight Drive-In",
    location: "789 Outskirts Lane, Suburbia",
    amenities: ["Open Air", "Car Service", "Pet Friendly"],
    capacity: 100, // cars
    ticketPrice: { standard: 20, vip: 35 }, // per car
    contactInfo: "+1-555-0303",
    imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
    rating: 4.5,
    totalScreens: 1
  },
  {
    id: "theatre_4",
    name: "Independent Arts House",
    location: "321 Culture St, Arts District",
    amenities: ["Indie Films", "Coffee Bar", "Discussion Hall"],
    capacity: 80,
    ticketPrice: { standard: 15, vip: 15 },
    contactInfo: "+1-555-0404",
    imageUrl: "https://images.unsplash.com/photo-1586899028174-e7098604235b?q=80&w=2071&auto=format&fit=crop",
    rating: 4.9,
    totalScreens: 2
  }
];

// --- Helper: Generate Showtimes ---
const generateShowtimes = (movies, theatres) => {
  const showtimes = [];
  let showCounter = 1;

  // Only create showtimes for the first 10 movies to avoid explosion
  const moviesToShow = movies.slice(0, 10);

  moviesToShow.forEach(movie => {
    theatres.forEach(theatre => {
      // Create 2 showtimes per movie per theatre
      const times = ["10:00 AM", "01:00 PM", "04:00 PM", "07:00 PM"];
      // Randomly pick 2 times
      const pickedTimes = times.sort(() => 0.5 - Math.random()).slice(0, 2);

      pickedTimes.forEach(time => {
        showtimes.push({
          id: `show_${showCounter++}`,
          movieId: movie.id,
          movieTitle: movie.title,
          theatreId: theatre.id,
          theatreName: theatre.name,
          time: time,
          price: theatre.ticketPrice.standard
        });
      });
    });
  });
  return showtimes;
};

// --- Helper: Generate Seats ---
function generateSeats(showTimeId) {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D']; // Smaller seat map for demo

  rows.forEach((row) => {
    for (let col = 1; col <= 8; col++) {
      seats.push({
        id: `${showTimeId}_${row}${col}`,
        showTimeId,
        seatId: `${row}${col}`,
        status: 'available', // default
        type: row === 'A' ? 'VIP' : 'Standard',
      });
    }
  });
  return seats;
}

// --- Main Seed Function ---
export async function seedFirestore() {
  console.log("Starting Database Seeding...");

  // 1. Clear Collections Helper
  const clearCollection = async (collectionName) => {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);

    if (snapshot.empty) return;

    console.log(`Clearing ${snapshot.size} docs from ${collectionName}...`);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  };

  try {
    // FETCH REAL DATA
    console.log("Fetching movies from TMDB API...");
    const realMovies = await fetchMoviesFromAPI();

    if (realMovies.length === 0) {
      throw new Error("Failed to fetch movies from API");
    }
    console.log(`Fetched ${realMovies.length} movies from API.`);

    // CLEAR EXISTING DATA
    await clearCollection("movies");
    await clearCollection("theatres");
    await clearCollection("showtimes");
    await clearCollection("seats");

    // SEED MOVIES
    console.log("Seeding Movies...");
    const moviesBatch = writeBatch(db);
    for (const movie of realMovies) {
      const docRef = doc(db, "movies", movie.id);
      moviesBatch.set(docRef, movie);
    }
    await moviesBatch.commit();
    console.log(`Seeded ${realMovies.length} movies.`);

    // SEED THEATRES
    console.log("Seeding Theatres...");
    const theatresBatch = writeBatch(db);
    for (const theatre of THEATRES) {
      const docRef = doc(db, "theatres", theatre.id);
      theatresBatch.set(docRef, theatre);
    }
    await theatresBatch.commit();
    console.log(`Seeded ${THEATRES.length} theatres.`);

    // SEED SHOWTIMES
    const showtimes = generateShowtimes(realMovies, THEATRES);
    console.log(`Seeding ${showtimes.length} showtimes...`);
    const showtimesBatch = writeBatch(db);
    for (const show of showtimes) {
      const docRef = doc(db, "showtimes", show.id);
      showtimesBatch.set(docRef, show);
    }
    await showtimesBatch.commit();

    // SEED SEATS (Chunked)
    console.log("Seeding Seats (this may take a moment)...");
    let seatParams = [];
    showtimes.forEach(show => {
      const seats = generateSeats(show.id);
      seatParams = [...seatParams, ...seats];
    });

    // Batch write seats
    const chunkSize = 400;
    for (let i = 0; i < seatParams.length; i += chunkSize) {
      const chunk = seatParams.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(seat => {
        const docRef = doc(db, "seats", seat.id);
        batch.set(docRef, seat);
      });
      await batch.commit();
      console.log(`Seeded batch ${Math.floor(i / chunkSize) + 1} of seats...`);
    }

    console.log("Database Seeding Completed Successfully! ");
    return true;

  } catch (error) {
    console.error("Error Seeding Database:", error);
    throw error;
  }
}

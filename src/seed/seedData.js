import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
// import { collections } from "../utils/firebaseUtils";

const MOVIES = [
  {
    id: "movie_1",
    title: "Inception",
    genre: ["Sci-Fi", "Thriller"],
    rating: 8.8,
    synopsis: "A thief who enters dream worlds...",
    duration: 148,
    status: "now_showing"
  },
  {
    id: "movie_2",
    title: "The Dark Knight",
    genre: ["Action", "Drama"],
    rating: 9.0,
    synopsis: "Batman raises the stakes...",
    duration: 152,
    status: "now_showing"
  },
  {
    id: "movie_3",
    title: "Interstellar",
    genre: ["Sci-Fi", "Adventure"],
    rating: 8.6,
    synopsis: "A journey through spacetime...",
    duration: 169,
    status: "coming_soon"
  },
  {
    id: "movie_4",
    title: "Avengers: Endgame",
    genre: ["Action", "Sci-Fi"],
    rating: 8.4,
    synopsis: "The Avengers assemble one last time...",
    duration: 181,
    status: "now_showing"
  },
  {
    id: "movie_5",
    title: "Parasite",
    genre: ["Thriller", "Drama"],
    rating: 8.5,
    synopsis: "A dark tale of class divide...",
    duration: 132,
    status: "coming_soon"
  }
];

// Theatres
const THEATRES = [
  {
    id: "theatre_1",
    name: "Grand Cinema",
    location: "Downtown"
  },
  {
    id: "theatre_2",
    name: "City Plex",
    location: "Mall Road"
  },
  {
    id: "theatre_3",
    name: "IMAX Arena",
    location: "Tech Park"
  }
];

// Showtimes (movie ↔ theatre mapping)
const SHOWTIMES = [
  {
    id: "show_1",
    movieId: "movie_1",
    theatreId: "theatre_1",
    time: "10:30"
  },
  {
    id: "show_2",
    movieId: "movie_1",
    theatreId: "theatre_1",
    time: "18:45"
  },
  {
    id: "show_3",
    movieId: "movie_1",
    theatreId: "theatre_2",
    time: "20:30"
  },
  {
    id: "show_4",
    movieId: "movie_2",
    theatreId: "theatre_1",
    time: "21:00"
  },
  {
    id: "show_5",
    movieId: "movie_3",
    theatreId: "theatre_3",
    time: "16:30"
  },
  {
    id: "show_6",
    movieId: "movie_4",
    theatreId: "theatre_2",
    time: "14:00"
  },
  {
    id: "show_7",
    movieId: "movie_5",
    theatreId: "theatre_1",
    time: "19:15"
  }
];

// Generate seats
function generateSeats(showTimeId) {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  rows.forEach((row) => {
    for (let col = 1; col <= 12; col++) {
      seats.push({
        id: `${showTimeId}_${row}${col}`,
        showTimeId,
        seatId: `${row}${col}`,
        status: 'available',
        lockedBy: null,
        lockedAt: null,
        bookingId: null,
        type: row === 'A' || row === 'B' ? 'VIP' : 'Regular',
      });
    }
  });

  return seats;
}

// seed data store
export async function seedFirestore(){
    //checking if movie already has the data
    const movieRef = collection(db, "movies");
    const existingMovies = await getDocs(movieRef);

    //check if we already have that movie in our database collection "movies"
    if(existingMovies.size>0){

        console.log("Movies already seeded");
        return
    }
    // if empty, we seed the data
    console.log("Starting the seeding process...")

    // Seed/Write movies
    for(const movie of MOVIES){
        await setDoc(doc(db, "movies", movie.id), movie);
    }
    console.log("Movies Seeded Successfully");

    // Seed Theatres

    for(const theatre of THEATRES){ 
        await setDoc(doc(db, "theatres", theatre.id), theatre);
    }

    console.log("Theatres Seeded")

    //Seed Showtimes
    for(const show of SHOWTIMES){
        await setDoc(doc(db, "showtimes", show.id), show);
    }

    console.log("Showtimes seeded..")

    // Writing Seats
    for(const show of SHOWTIMES){
        const seats = generateSeats(show.id);
        for(const seat of seats){
            await setDoc(doc(db, "seats", seat.id), seat);
        }
        console.log("Seats Created")

        console.log("Seeding Completed on Firebase")
    }
}

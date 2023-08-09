import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';
import { firebaseConfig } from '../config/Config';

// Firebase'i başlat
initializeApp(firebaseConfig);

function Movies() {
  const apiKey = "6ab01c21fa27fc770e684630e45bc43a";
  const [movieData, setMovieData] = useState(null);
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);

  function getRandomNumber() {
    return Math.floor(Math.random() * 999999) + 2;
  }

  const fetchMovieData = async (id) => {
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
      const data = response.data;
      if (data.poster_path === null || data.adult) {
        const newId = getRandomNumber();
        fetchMovieData(newId);
      } else {
        setMovieData(data);
      }
    } catch (error) {
      const newId = getRandomNumber();
      fetchMovieData(newId);
      return;
    }
  };

  useEffect(() => {
    const id = getRandomNumber();
    fetchMovieData(id);

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const handleMouseDown = (event) => {
    if (event.button === 0) {
      setStartX(event.clientX);
    }
  };

  const handleMouseUp = (event) => {
    if (event.button === 0) {
      setEndX(event.clientX);
      const diffX = startX - endX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Kaydırma sola doğru oldu
          console.log("Sola kaydırıldı");
          if (movieData) {
            // Firebase'e beğenmeme durumunu kaydet
            const database = getDatabase();
            const likesRef = ref(database, 'likes');
            push(likesRef, { id: movieData.id, liked: false });
          }
          fetchMovieData(getRandomNumber());
        } else {
          // Kaydırma sağa doğru oldu
          console.log("Sağa kaydırıldı");
          if (movieData) {
            // Firebase'e beğenme durumunu kaydet
            const database = getDatabase();
            const likesRef = ref(database, 'likes');
            push(likesRef, { id: movieData.id, liked: true });
          }
          fetchMovieData(getRandomNumber());
        }
      }
    }
  };

  return (
    <div id="movieContainer" style={{ pointerEvents: movieData ? "auto" : "none" }}>
      {movieData ? (
        <>
          <img
            src={`https://image.tmdb.org/t/p/original/${movieData.poster_path}`}
            alt={movieData.title}
            onDragStart={(e) => e.preventDefault()}
            style={{ userSelect: "none", MozUserSelect: "none", WebkitUserSelect: "none" }}
          />
          <h2>{movieData.title}</h2>
        </>
      ) : (
        <p>Yükleniyor...</p>
      )}
    </div>
  );
}

export default Movies;

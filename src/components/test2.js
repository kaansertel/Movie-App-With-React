import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Movies() {
  const apiKey = "6ab01c21fa27fc770e684630e45bc43a";
  const [movieData, setMovieData] = useState(null);

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

  let startX = 0;
  let endX = 0;

  const handleMouseDown = (event) => {
    // Sadece sol fare tıklaması sırasında işlem yapalım
    if (event.button === 0) {
      startX = event.clientX;
    }
  };

  const handleMouseUp = (event) => {
    // Sadece sol fare tıklaması sırasında işlem yapalım
    if (event.button === 0) {
      endX = event.clientX;

      const diffX = startX - endX; // Başlangıçtan bitişe olan farkı hesapla
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Kaydırma sola doğru oldu
          console.log("Sola kaydırıldı");
          fetchMovieData(getRandomNumber());
        } else {
          // Kaydırma sağa doğru oldu
          console.log("Sağa kaydırıldı");
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

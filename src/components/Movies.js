import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue } from 'firebase/database';
import { firebaseConfig } from '../config/Config';

// Firebase'i başlat
initializeApp(firebaseConfig);

function Movies() {
  const apiKey = "6ab01c21fa27fc770e684630e45bc43a";
  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [end, setEnd] = useState(false);
  const database = getDatabase();
  let tempData = null;
  let tempMovie = [];
  let count = 0;

  function getRandomNumber() {
    count++;
    let tempId = Math.floor(Math.random() * 999999) + 2;
    if (tempMovie.includes(tempId) === false) {
      setLoading(true);
      return tempId;
    } else if (tempMovie.includes(tempId)) {
      setLoading(false);
      setEnd(true);
      return null;
    }
  }

  const fetchMovieData = async (id) => {
    try {
      if (end === false) {
        if (!(tempMovie.includes(id))) {
          tempMovie.push(id);
        }
        if (loading === true) {
          const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}`);
          const data = response.data;
          if (data.poster_path === null || data.adult) {
            const newId = getRandomNumber();
            if (end === false) {
              console.log("1",end);
              count = 0;
              fetchMovieData(newId);
            }
          } else {
            setMovieData(data);
            tempData = data;
          }
        }
      } else {
        return <div></div>
      }
    } catch (error) {
      if (end === false) {
        if (loading === true) {
          if (tempMovie.includes(id) === false) {
            tempMovie.push(id);
          }
          const newId = getRandomNumber();
          if (end === false && count < 500) {
            console.log("2",end);
            setEnd(true);
            
            fetchMovieData(newId);
          }
        }
      }else {
        return <div></div>
      }
    }
  };

  function checkId(id) {
    let check = false;
    if(tempMovie.includes(id)){
      id = getRandomNumber();
      console.log("Yeni id",id);
      checkId(id);
    }else {
      check = true;
    }
    if (check) {
      return id;
    }
  }

  useEffect(() => {
    let id = getRandomNumber();

    // Veritabanında mevcut olan movieId'leri al
    const likedMoviesRef = ref(database, 'likedMovies');
    onValue(likedMoviesRef, (snapshot) => {
      const likedMoviesData = snapshot.val();
      const likedMovieIds = likedMoviesData ? Object.values(likedMoviesData).map(movie => movie.movieId) : [];
      tempMovie = likedMovieIds;
      console.log("Yaptı");
      console.log(tempMovie);
      checkId(id);
      fetchMovieData(id);
    });
    console.log("id:",id);
    if (end === false && !(tempMovie.includes(id))) {
      console.log("3",end);
      fetchMovieData(id);
    }

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
          handleDislikeMovie();
          if (end === false) {
            count = 0;
            console.log("4",end);
            fetchMovieData(getRandomNumber());
          }
        } else {
          // Kaydırma sağa doğru oldu
          console.log("Sağa kaydırıldı");
          handleLikeMovie();
          if (end === false) {
            count = 0;
            console.log("5",end);
            fetchMovieData(getRandomNumber());
          }
        }
      }
    }
  };

  const handleLikeMovie = () => {
    if (tempData) {
      const { id, title, poster_path } = tempData;
      const likedMoviesRef = ref(database, 'likedMovies'); // Referans oluşturuluyor
      const newLikeRef = push(likedMoviesRef); // Yeni bir anahtar altında referans oluşturuluyor
      const likeId = newLikeRef.key;
      set(newLikeRef, {
        // id: likeId,
        movieId: id,
        // title: title,
        // poster_path: poster_path,
        liked: true
      });
    }
  };

  const handleDislikeMovie = () => {
    if (tempData) {
      const { id, title, poster_path } = tempData;
      const likedMoviesRef = ref(database, 'likedMovies'); // Referans oluşturuluyor
      const newLikeRef = push(likedMoviesRef); // Yeni bir anahtar altında referans oluşturuluyor
      const likeId = newLikeRef.key;
      set(newLikeRef, {
        // id: likeId,
        movieId: id,
        // title: title,
        // poster_path: poster_path,
        liked: false
      });
    }
  };

  return (
    <div id="movieContainer" style={{ pointerEvents: movieData ? "auto" : "none" }}>
      {(loading) ? (
        (movieData) ? (
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
        )) : <p>Filmler bitti... Yeni film eklenene kadar bekleyiniz.</p>}
    </div>
  );
}

export default Movies;

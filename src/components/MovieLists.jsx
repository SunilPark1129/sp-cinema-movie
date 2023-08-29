import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { requestFetch } from "../redux/reducers/movieFetchReducer";
import { setMovie } from "../redux/reducers/selectedReducer";
import useObserver from "../hooks/useObserver";
import MovieRecommend from "./MovieRecommend";
import Loading from "./Loading";
import NoPoster from "./NoPoster";

import { FetchError, SearchHomePage, ListEmpty } from "./CatchPage";

import { useLists, useSelected } from "../hooks/useReducer";

function DisplayMovieLists() {
  const { data, lists } = useLists();

  if (lists[0]?.movies.length !== 0) {
    return lists.map(({ movies, page }) => (
      <div className="lists__content" key={page}>
        <DisplayMovieContent
          movies={movies}
          page={lists[lists.length - 1].page + 1}
          totalPage={data.total_pages}
        />
      </div>
    ));
  }

  return <ListEmpty />;
}

function DisplayMovieContent({ totalPage, movies, page }) {
  const dispatch = useDispatch();
  const lastIdxRef = useRef(null);

  // IntersectionObserver - if current scroll position is on the last movie item
  const hasReachedPosition = useObserver(lastIdxRef, { threshold: 0.5 });

  useEffect(() => {
    if (hasReachedPosition && totalPage >= page) {
      dispatch(
        requestFetch({
          url: null,
          currentPage: `&page=${page}&`,
        })
      );
    }
  }, [hasReachedPosition]);

  function posterClickHandler(target) {
    dispatch(setMovie(target));
  }

  function getPosterImage({ title, poster_path, backdrop_path }) {
    if (poster_path || backdrop_path) {
      return (
        <img
          src={
            "https://image.tmdb.org/t/p/w500/" + (poster_path || backdrop_path)
          }
          alt={title}
        />
      );
    }

    return <NoPoster />;
  }

  return movies.map(
    (
      { id, title, poster_path, release_date, vote_average, backdrop_path },
      idx
    ) => {
      return (
        <div
          className="lists__item"
          key={id}
          ref={idx === 19 ? lastIdxRef : null}
          onClick={() => posterClickHandler(movies[idx])}
        >
          {getPosterImage({ title, poster_path, backdrop_path })}
          <div className="lists__item__text-box">
            <p>{title}</p>
            <p>{release_date ? release_date.replace(/-/g, "/") : "??"}</p>
            <p>
              <span>&hearts;</span> {vote_average}
            </p>
          </div>
        </div>
      );
    }
  );
}

function CategoryHeader() {
  const { data } = useLists();

  let totalMovieNums = data.total_results;
  let movie = "movies";
  const MAX_MOVIE_LISTS = 10000;

  if (totalMovieNums > MAX_MOVIE_LISTS) {
    totalMovieNums = "10000+";
  }
  if (totalMovieNums <= 1) {
    movie = "movie";
  }

  return (
    <header className="lists__header">
      <h3>MOVIES</h3>
      <p>
        We have found <span>{totalMovieNums}</span> {movie}
      </p>
    </header>
  );
}

// a component for displaying movie items
export default function MovieLists() {
  const { lists, isLoading, error } = useLists();
  const { currentLocation } = useSelected();

  return (
    <article className="lists">
      <div className="lists__container">
        {!error &&
          lists.length === 0 &&
          !isLoading &&
          currentLocation === "search" && <SearchHomePage />}

        {!error && lists.length !== 0 && (
          <>
            {/* header */}
            <CategoryHeader />

            {/* display random movie */}
            <MovieRecommend />

            {/* display movies */}
            <DisplayMovieLists />
          </>
        )}

        {/* fetch error */}
        {error && <FetchError />}

        {/* is loading */}
        {isLoading && <Loading />}
      </div>

      {/* style */}
      <div className="border">
        <div></div>
        <div></div>
      </div>
    </article>
  );
}

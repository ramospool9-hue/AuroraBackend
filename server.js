const express = require('express');
const cors = require('cors');
const searchYoutube = require('youtube-search-api');
const { Client } = require('genius-lyrics');

const app = express();

app.use(cors());

const genius =
  new Client();

// =====================
// SEARCH
// =====================

app.get('/search', async (req, res) => {

  try {

    const query =
      req.query.q;

    const result =
      await searchYoutube.GetListByKeyword(
        query,
        false,
        15
      );

    const songs =
      result.items.map((video) => ({

        id:
          video.id,

        title:
          video.title,

        artist:
          video.channelTitle ||
          'Unknown',

        picture:
          video.thumbnail?.thumbnails?.[0]?.url ||
          '',
      }));

    res.json(
      songs
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error:
        error.message,
    });
  }
});

// =====================
// AUDIO
// =====================

app.get('/audio/:id', async (req, res) => {

  const id =
    req.params.id;

  res.json({

    audio:
      `https://www.youtube.com/watch?v=${id}`,
  });
});

// =====================
// LYRICS
// =====================

app.get('/lyrics', async (req, res) => {

  try {

    let title =
      req.query.title;

    let artist =
      req.query.artist;

    const searches =
      await genius.songs.search(
        `${artist} ${title}`
      );

    const firstSong =
      searches[0];

    if (
      firstSong
    ) {

      const lyrics =
        await firstSong.lyrics();

      return res.json({
        lyrics,
      });
    }

    res.json({
      lyrics:
        'Letra no encontrada',
    });

  } catch (error) {

    console.log(error);

    res.json({
      lyrics:
        'Letra no encontrada',
    });
  }
});

app.get('/', (req, res) => {

  res.send(
    'Aurora Backend funcionando 🚀'
  );
});

app.listen(
  process.env.PORT || 3000,
  '0.0.0.0',
  () => {

    console.log(
      'Servidor iniciado 🚀'
    );
  }
);
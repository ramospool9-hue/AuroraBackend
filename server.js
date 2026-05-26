const express = require('express');
const cors = require('cors');
const ytdlp = require('yt-dlp-exec');
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
      await ytdlp(
        `ytsearch15:${query}`,
        {
          dumpSingleJson: true,
          noWarnings: true,
          preferFreeFormats: true,
          flatPlaylist: true,
        }
      );

    const songs =
      result.entries.map((video) => {

        let artist =
          video.channel ||
          'Unknown';

        let title =
          video.title || '';

        // EXTRAER:
        // ARTISTA - TITULO

        if (
          title.includes('-')
        ) {

          const parts =
            title.split('-');

          if (
            parts.length >= 2
          ) {

            artist =
              parts[0]
                .trim();

            title =
              parts
                .slice(1)
                .join('-')
                .trim();
          }
        }

        // LIMPIAR TITULO

        title =
          title
            .replace(/\(.*?\)/g, '')
            .replace(/\[.*?\]/g, '')
            .replace(/official/gi, '')
            .replace(/video/gi, '')
            .replace(/lyrics/gi, '')
            .replace(/audio/gi, '')
            .replace(/music/gi, '')
            .replace(/hd/gi, '')
            .trim();

        return {

          id:
            video.id,

          title,

          artist,

          picture:
            video.thumbnail,
        };
      });

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

  try {

    const id =
      req.params.id;

    const url =
      `https://youtube.com/watch?v=${id}`;

    const result =
      await ytdlp(
        url,
        {
          getUrl: true,
          format:
            'bestaudio',
          noWarnings: true,
        }
      );

    res.json({

      audio:
        result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      error:
        error.message,
    });
  }
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

    title =
      title
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/official/gi, '')
        .replace(/video/gi, '')
        .replace(/lyrics/gi, '')
        .replace(/audio/gi, '')
        .replace(/music/gi, '')
        .replace(/hd/gi, '')
        .trim();

    // =====================
    // LRCLIB
    // =====================

    try {

      const url =
        `https://lrclib.net/api/get?artist_name=${encodeURIComponent(
          artist
        )}&track_name=${encodeURIComponent(
          title
        )}`;

      const response =
        await fetch(
          url
        );

      const data =
        await response.json();

      if (
        data.plainLyrics
      ) {

        return res.json({

          lyrics:
            data.plainLyrics,
        });
      }

    } catch (e) {}

    // =====================
    // GENIUS
    // =====================

    try {

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

        if (
          lyrics
        ) {

          return res.json({
            lyrics,
          });
        }
      }

    } catch (e) {}

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

// =====================
// TEST
// =====================

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
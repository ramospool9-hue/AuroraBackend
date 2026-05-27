const express = require('express');
const cors = require('cors');
const searchYoutube = require('youtube-search-api');
const ytdlp = require('yt-dlp-exec');
const { Client } = require('genius-lyrics');

const app = express();

app.use(cors());

const genius =
  new Client();

// =====================
// ROOT
// =====================

app.get('/', (req, res) => {

  res.send(
    'Aurora Backend funcionando 🚀'
  );
});

// =====================
// SEARCH
// =====================

app.get('/search', async (req, res) => {

  try {

    const query =
      req.query.q;

    if (!query) {

      return res.status(400).json({

        error:
          'Query requerida',
      });
    }

    const result =
      await searchYoutube.GetListByKeyword(
        query,
        false,
        15
      );

    const songs =
      result.items
        .filter(
          (video) =>
            video.type !==
            'channel'
        )
        .map(
          (video) => ({

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
          })
        );

    res.json(
      songs
    );

  } catch (error) {

    console.log(
      'SEARCH ERROR:',
      error
    );

    res.status(500).json({

      error:
        'Error buscando canciones',
    });
  }
});

// =====================
// AUDIO REAL
// =====================

app.get('/audio/:id', async (req, res) => {

  try {

    const id =
      req.params.id;

    const url =
      `https://www.youtube.com/watch?v=${id}`;

    const audio =
      await ytdlp(
        url,
        {

          getUrl: true,

          format:
            'bestaudio',

          noWarnings:
            true,

          preferFreeFormats:
            true,
        }
      );

    res.json({

      audio,
    });

  } catch (error) {

    console.log(
      'AUDIO ERROR:',
      error
    );

    res.status(500).json({

      error:
        'Error obteniendo audio',
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

    if (
      !title ||
      !artist
    ) {

      return res.json({

        lyrics:
          'Letra no encontrada',
      });
    }

    title =
      title
        .replace(/\(.*?\)/g, '')
        .replace(/\[.*?\]/g, '')
        .replace(/official/gi, '')
        .replace(/lyrics/gi, '')
        .replace(/audio/gi, '')
        .replace(/video/gi, '')
        .trim();

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

      if (lyrics) {

        return res.json({

          lyrics,
        });
      }
    }

    res.json({

      lyrics:
        'Letra no encontrada',
    });

  } catch (error) {

    console.log(
      'LYRICS ERROR:',
      error
    );

    res.json({

      lyrics:
        'Letra no encontrada',
    });
  }
});

// =====================
// START SERVER
// =====================

const PORT =
  process.env.PORT || 3000;

app.listen(
  PORT,
  '0.0.0.0',
  () => {

    console.log(
      `Servidor iniciado en puerto ${PORT}`
    );
  }
);
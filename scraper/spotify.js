const axios = require("axios");
const crypto = require("crypto");

class Parser {
  _getImg(o) {
    return (o?.sources || []).map(s => ({ 
      url: s.url,
      width: s.width || s.maxWidth || null,
      height: s.height || s.maxHeight || null 
    }));
  }

  _getCol(o) {
    return o?.extractedColors?.colorRaw?.hex || o?.extractedColors?.colorDark?.hex || null;
  }

  _getVI(v) {
    return v?.squareCoverImage?.extractedColorSet ? { 
      text_color: v.squareCoverImage.extractedColorSet.encoreBaseSetTextColor || null, 
      high_contrast: v.squareCoverImage.extractedColorSet.highContrast || null, 
      higher_contrast: v.squareCoverImage.extractedColorSet.higherContrast || null, 
      min_contrast: v.squareCoverImage.extractedColorSet.minContrast || null 
    } : null;
  }

  _getLink(uri) {
    if (!uri) return { id: null, url: null };
    const p = uri.split(':');
    return {
      uri,
      id: p[2] || null,
      url: p[2] ? `https://open.spotify.com/$${p[1]}/${p[2]}` : null
    };
  }

  parseSearch(res) {
    if (!res) return null;
    
    const parse = (arr, mapFn, isTrack = false) => (arr || []).reduce((acc, node) => {
      const d = isTrack ? node.item?.data : node.data;
      if (d) acc.push({ ...mapFn(d), ...(node.matchedFields && { matched_fields: node.matchedFields }) });
      return acc;
    }, []);

    const trackItems = res.tracksV2?.items?.length ? res.tracksV2.items : res.topResultsV2?.itemsV2?.filter(i => i.item?.__typename === "TrackResponseWrapper");

    return {
      top_results: (res.topResultsV2?.itemsV2 || []).reduce((acc, node) => {
        const wrap = node.item;
        const d = wrap?.data;
        if (!d) return acc;
        const type = wrap.__typename?.replace('ResponseWrapper', '') || 'Unknown';
        acc.push({
          type: type, ...this._getLink(d.uri),
          name: d.name || d.profile?.name || d.displayName || null,
          images: this._getImg(d.coverArt || d.visuals?.avatarImage || d.images?.items?.[0] || d.avatar),
          matched_fields: node.matchedFields || []
        });
        return acc;
      }, []),
      tracks: parse(trackItems, t => ({
        ...this._getLink(t.uri), name: t.name || null, duration_ms: t.duration?.totalMilliseconds || 0,
        explicit: t.contentRating?.label === "EXPLICIT", media_type: t.trackMediaType || null,
        playability: { playable: !!t.playability?.playable, reason: t.playability?.reason || null },
        associations: { audio_count: t.associationsV3?.audioAssociations?.totalCount || 0, video_count: t.associationsV3?.videoAssociations?.totalCount || 0 },
        artists: (t.artists?.items || []).map(a => ({ ...this._getLink(a.uri), uri: a.uri, name: a.profile?.name })),
        album: {
          ...this._getLink(t.albumOfTrack?.uri), name: t.albumOfTrack?.name || null,
          images: this._getImg(t.albumOfTrack?.coverArt), color_dark: this._getCol(t.albumOfTrack?.coverArt), visual_identity: this._getVI(t.albumOfTrack?.visualIdentity)
        },
        sixteen_by_nine_cover: t.visualIdentity?.sixteenByNineCoverImage?.image?.data?.sources || []
      }), true),
      albums: parse(res.albumsV2?.items, a => ({
        ...this._getLink(a.uri), name: a.name || null, type: a.type || null, release_year: a.date?.year || null,
        playability: { playable: !!a.playability?.playable, reason: a.playability?.reason || null },
        artists: (a.artists?.items || []).map(art => ({ ...this._getLink(art.uri), uri: art.uri, name: art.profile?.name })),
        images: this._getImg(a.coverArt), color_dark: this._getCol(a.coverArt), visual_identity: this._getVI(a.visualIdentity)
      })),
      artists: parse(res.artists?.items, art => ({
        ...this._getLink(art.uri), name: art.profile?.name || null, images: this._getImg(art.visuals?.avatarImage), color_dark: this._getCol(art.visuals?.avatarImage), visual_identity: this._getVI(art.visualIdentity)
      })),
      episodes: parse(res.episodes?.items, ep => ({
        ...this._getLink(ep.uri), name: ep.name || null, description: ep.description || null, duration_ms: ep.duration?.totalMilliseconds || 0, explicit: ep.contentRating?.label === "EXPLICIT", media_types: ep.mediaTypes || [], release_date: ep.releaseDate?.isoString || null,
        playability: { playable: ep.playability?.reason === "PLAYABLE", reason: ep.playability?.reason || null }, played_state: ep.playedState?.state || null, is_paywall: !!ep.restrictions?.paywallContent,
        images: this._getImg(ep.coverArt), color_dark: this._getCol(ep.coverArt), visual_identity: this._getVI(ep.visualIdentity), video_preview_thumbnail: this._getImg(ep.videoPreviewThumbnail?.imagePreview?.data),
        podcast: { ...this._getLink(ep.podcastV2?.data?.uri), name: ep.podcastV2?.data?.name || null, publisher: ep.podcastV2?.data?.publisher?.name || null, media_type: ep.podcastV2?.data?.mediaType || null }
      })),
      podcasts: parse(res.podcasts?.items, pod => ({
        ...this._getLink(pod.uri), name: pod.name || null, publisher: pod.publisher?.name || null, media_type: pod.mediaType || null,
        topics: (pod.topics?.items || []).map(t => ({ ...this._getLink(t.uri), uri: t.uri, title: t.title })),
        images: this._getImg(pod.coverArt), color_dark: this._getCol(pod.coverArt), visual_identity: this._getVI(pod.visualIdentity)
      })),
      playlists: parse(res.playlists?.items, pl => ({
        ...this._getLink(pl.uri), name: pl.name || null, description: pl.description || null, format: pl.format || null, attributes: pl.attributes || [],
        images: this._getImg(pl.images?.items?.[0]), color_dark: this._getCol(pl.images?.items?.[0]), visual_identity: this._getVI(pl.visualIdentity),
        owner: { ...this._getLink(pl.ownerV2?.data?.uri), display_name: pl.ownerV2?.data?.name || null, username: pl.ownerV2?.data?.username || null, images: this._getImg(pl.ownerV2?.data?.avatar) }
      })),
      genres: parse(res.genres?.items, g => ({
        ...this._getLink(g.uri), name: g.name || null, images: this._getImg(g.image), color_dark: this._getCol(g.image)
      })),
      users: parse(res.users?.items, u => ({
        ...this._getLink(u.uri), display_name: u.displayName || null, username: u.username || null, images: this._getImg(u.avatar), color_dark: this._getCol(u.avatar)
      }))
    };
  }

  parseTrack(data) {
    const t = data?.track || data;
    if (!t || t.__typename !== 'Track') return null;
    const allArtists = [...(t.firstArtist?.items || []), ...(t.otherArtists?.items || [])];
    
    return {
      ...this._getLink(t.uri), name: t.name || null, duration_ms: t.duration?.totalMilliseconds || 0,
      playcount: parseInt(t.playcount) || 0, explicit: t.contentRating?.label === "EXPLICIT", track_number: t.trackNumber || null,
      album: {
        ...this._getLink(t.albumOfTrack?.uri), name: t.albumOfTrack?.name || null, type: t.albumOfTrack?.type || null, release_year: t.albumOfTrack?.date?.year || null,
        images: this._getImg(t.albumOfTrack?.coverArt), color: this._getCol(t.albumOfTrack?.coverArt), visual_identity: this._getVI(t.albumOfTrack?.visualIdentity)
      },
      artists: allArtists.map(node => ({ ...this._getLink(node.uri), name: node.profile?.name || null, images: this._getImg(node.visuals?.avatarImage) }))
    };
  }

  parseArtist(data) {
    const a = data?.artist || data;
    if (!a || a.__typename !== 'Artist') return null;
    
    return {
      ...this._getLink(a.uri || `spotify:artist:${a.id}`), uri: a.uri || `spotify:artist:${a.id}`, name: a.profile?.name || null, verified: !!a.profile?.verified,
      images: this._getImg(a.visuals?.avatarImage), header_images: this._getImg(a.visuals?.headerImage?.data || a.headerImage?.data), color: this._getCol(a.visuals?.avatarImage),
      statistics: { followers: a.stats?.followers || 0, monthly_listeners: a.stats?.monthlyListeners || 0 },
      top_tracks: (a.discography?.topTracks?.items || []).map(node => ({
        ...this._getLink(node.track?.uri), name: node.track?.name || null, playcount: parseInt(node.track?.playcount) || 0, duration_ms: node.track?.duration?.totalMilliseconds || 0,
        album: { ...this._getLink(node.track?.albumOfTrack?.uri), name: node.track?.albumOfTrack?.name || null, images: this._getImg(node.track?.albumOfTrack?.coverArt) }
      }))
    };
  }

  parseAlbum(data) {
    const al = data?.albumUnion || data?.album || data;
    if (!al || (al.__typename !== 'Album' && al.__typename !== 'AlbumRelease')) return null;
    
    return {
      ...this._getLink(al.uri), name: al.name || null, type: al.type || null, 
      release_date: al.date?.isoString || al.date?.year || null, label: al.label || null,
      playability: { playable: !!al.playability?.playable, reason: al.playability?.reason || null },
      images: this._getImg(al.coverArt), color: this._getCol(al.coverArt), visual_identity: this._getVI(al.visualIdentity),
      artists: (al.artists?.items || []).map(art => ({ ...this._getLink(art.uri), name: art.profile?.name || null })),
      copyrights: al.copyrights?.items || [],
      tracks: (al.tracks?.items || al.tracksV2?.items || []).map(node => {
        const t = node.track || node;
        return {
          ...this._getLink(t.uri), name: t.name || null, duration_ms: t.duration?.totalMilliseconds || 0,
          playcount: parseInt(t.playcount) || 0, explicit: t.contentRating?.label === "EXPLICIT", track_number: t.trackNumber || null,
          artists: (t.artists?.items || []).map(a => ({ ...this._getLink(a.uri), uri: a.uri, name: a.profile?.name }))
        };
      })
    };
  }

  parsePlaylist(data) {
    const pl = data?.playlistV2 || data?.playlist || data;
    if (!pl || (pl.__typename !== 'Playlist' && pl.__typename !== 'PlaylistResponseWrapper')) return null;
    
    return {
      ...this._getLink(pl.uri), name: pl.name || null, description: pl.description || null, format: pl.format || null,
      followers: pl.followers || pl.ownerV2?.data?.followers || 0,
      images: this._getImg(pl.images?.items?.[0] || pl.image), color: this._getCol(pl.images?.items?.[0] || pl.image), visual_identity: this._getVI(pl.visualIdentity),
      owner: {
        ...this._getLink(pl.ownerV2?.data?.uri), display_name: pl.ownerV2?.data?.name || null, username: pl.ownerV2?.data?.username || null,
        images: this._getImg(pl.ownerV2?.data?.avatar)
      },
      tracks: (pl.content?.items || pl.tracks?.items || []).map(node => {
        const t = node.item?.data || node.track || node; 
        if (!t || t.__typename !== 'Track') return null;
        return {
          ...this._getLink(t.uri), name: t.name || null, duration_ms: t.duration?.totalMilliseconds || 0, explicit: t.contentRating?.label === "EXPLICIT",
          album: { ...this._getLink(t.albumOfTrack?.uri), name: t.albumOfTrack?.name || null, images: this._getImg(t.albumOfTrack?.coverArt) },
          artists: (t.artists?.items || []).map(a => ({ ...this._getLink(a.uri), uri: a.uri, name: a.profile?.name }))
        };
      }).filter(item => item !== null)
    };
  }
}


class Spotify {
  constructor() {
    this.cfg = {
      secret: '376136387538459893883312310911992847112448894410210511297108', 
      version: 61,
      client_version: '1.2.88.61.ge172202b',
      query: {
        search: {
          opt: "searchDesktop",
          sha: "21b3fe49546912ba782db5c47e9ef5a7dbd20329520ba0c7d0fcfadee671d24e"
        },
        track: {
          opt: "getTrack",
          sha: "612585ae06ba435ad26369870deaae23b5c8800a256cd8a57e08eddc25a37294",
        },
        artist: {
          opt: "queryArtistOverview",
          sha: "5b9e64f43843fa3a9b6a98543600299b0a2cbbbccfdcdcef2402eb9c1017ca4c"
        },
        album: {
          opt: "getAlbum",
          sha: "b9bfabef66ed756e5e13f68a942deb60bd4125ec1f1be8cc42769dc0259b4b10"
        },
        playlist: {
          opt: "fetchPlaylist",
          sha: "32b05e92e438438408674f95d0fdad8082865dc32acd55bd97f5113b8579092b"
        }
      }
    };
    this.is = axios.create({
      headers: {
        'referer': 'https://open.spotify.com/',
        'origin': 'https://open.spotify.com',
        'content-type': 'application/json',
        'accept': 'application/json',
        'user-agent': 'Mozilla/5.0 (Linux; Android 16; NX729J) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36',
      }
    });
    this.parser = new Parser();
  }
  
  generateTOTP(tsms) {
    const counter = Math.floor((tsms / 1000) / 30);
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));
    const hmac = crypto.createHmac('sha1', Buffer.from(this.cfg.secret, "utf8")).update(buffer);
    const digest = hmac.digest();
    const offset = digest[digest.length - 1] & 0xf;
    const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    return code.toString().padStart(6, '0');
  }
  
  async getToken() {
    try {
      if (this.is.defaults.headers.authorization) return true
      const sts = Math.floor(Date.now() / 1000);
      const { data: token } = await this.is.get("https://open.spotify.com/api/token", {
        params: {
          reason: "init",
          productType: "web-player",
          totp: this.generateTOTP(Date.now()),
          totpServer: this.generateTOTP(sts * 1000),
          totpVer: String(this.cfg.version)
        }
      });
      const { data: client } = await this.is.post('https://clienttoken.spotify.com/v1/clienttoken', {
        client_data: {
          client_version: this.cfg.client_version,
          client_id: token.clientId,
          js_sdk_data: {
            device_brand: "unknown",
            device_model: "unknown",
            os: "linux",
            os_version: "24.04",
            device_id: crypto.randomUUID(),
            device_type: "computer"
          }
        }
      });
      
      Object.assign(this.is.defaults.headers, {
        'accept-language': 'en', 
        'app-platform': 'WebPlayer', 
        'authorization': `Bearer ${token.accessToken}`, 
        'client-token': client.granted_token.token,
        'spotify-app-version': this.cfg.client_version
      })
      return true
    } catch (error) {
      return false;
    }
  }
  
  async query(name, vars) {
    try {
      if (!(await this.getToken())) return;
      const sel = this.cfg.query[name]
      
      const { data: res } = await this.is.post('https://api-partner.spotify.com/pathfinder/v2/query', {
        variables: vars,
        operationName: sel.opt,
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: sel.sha
          }
        }
      });
      
      return res
    } catch (error) {
      throw error
    }
  }
  
  async search(query) {
    try {
      const res = await this.query("search", {
        searchTerm: query,
        offset: 0,
        limit: 10,
        numberOfTopResults: 5,
        includeAudiobooks: true,
        includeArtistHasConcertsField: false,
        includePreReleases: true,
        includeAuthors: false,
        includeEpisodeContentRatingsV2: false
      });
      return this.parser.parseSearch(res.data.searchV2)
    } catch (error) {
      throw error
    }
  }
  
  async track(ids) {
    try {
      const res = await this.query("track", {
         uri: `spotify:track:${ids}`
      });
      return this.parser.parseTrack(res.data.trackUnion)
    } catch (error) {
      throw error
    }
  }
  
  async artist(ids) {
    try {
      const res = await this.query("artist", {
        uri: `spotify:artist:${ids}`,
        locale: "",
        preReleaseV2: false
      });
      return this.parser.parseArtist(res.data.artistUnion)
    } catch (error) {
      throw error
    }
  }
  
  async album(ids) {
    try {
      const res = await this.query("album", {
        uri: `spotify:album:${ids}`,
        locale: "",
        offset: 0,
        limit: 50
      });
      return this.parser.parseAlbum(res.data.albumUnion)
    } catch (error) {
      throw error
    }
  }
  
  async playlist(ids) {
    try {
      const res = await this.query("playlist", {
        uri: `spotify:playlist:${ids}`,
        offset: 0,
        limit: 25,
        enableWatchFeedEntrypoint: false,
        includeEpisodeContentRatingsV2: false
      });
      return this.parser.parsePlaylist(res.data.playlistV2)
    } catch (error) {
      throw error
    }
  }
}

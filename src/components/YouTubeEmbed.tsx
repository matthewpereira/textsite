import { useState } from 'react';

interface Props {
  videoId: string;
  title?: string;
}

/**
 * Click-to-play YouTube embed.
 *
 * The iframe is only mounted after a user interaction, so the initial load is
 * just an <img> (the auto-generated 480x360 YouTube thumbnail) instead of
 * YouTube's hefty player JS. Layout is reserved with aspect-ratio so the play
 * state and the loaded state occupy the same space. Uses youtube-nocookie.com
 * for the embed.
 */
const YouTubeEmbed = ({ videoId, title }: Props) => {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        className="youtubeEmbed"
        title={title || 'Video'}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="youtubeEmbed youtubeEmbed--poster"
      onClick={() => setPlaying(true)}
      aria-label={title ? `Play video: ${title}` : 'Play video'}
    >
      <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" />
      <span className="youtubeEmbed__play" aria-hidden="true">▶</span>
    </button>
  );
};

export default YouTubeEmbed;

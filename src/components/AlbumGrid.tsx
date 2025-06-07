import { AlbumMetadata } from '../utils/albumCache';

interface AlbumGridProps {
  albums: AlbumMetadata[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const AlbumGrid = ({ albums, loading, hasMore, onLoadMore }: AlbumGridProps) => {
  const handleAlbumClick = (albumId: string) => {
    window.location.href = `${window.location.origin}/?${albumId}`;
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {albums.map((album) => (
          <div
            key={album.albumId}
            onClick={() => handleAlbumClick(album.albumId)}
            style={{
              cursor: 'pointer',
              border: '1px solid #ddd',
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'transform 0.2s, box-shadow 0.2s',
              backgroundColor: '#fff'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
            }}
          >
            {album.cover && (
              <img
                src={`https://i.imgur.com/${album.cover}m.jpg`}
                alt={album.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover'
                }}
                loading="lazy"
              />
            )}
            <div style={{
              padding: '12px',
              borderTop: '1px solid #eee'
            }}>
              <h3 style={{
                margin: '0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                lineHeight: '1.4'
              }}>
                {album.title}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666'
        }}>
          Loading albums...
        </div>
      )}

      {hasMore && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '20px'
        }}>
          <button
            onClick={onLoadMore}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Load More Albums
          </button>
        </div>
      )}

      {!hasMore && albums.length > 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          All albums loaded ({albums.length} total)
        </div>
      )}
    </div>
  );
};

export default AlbumGrid;

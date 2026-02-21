import { useState, useEffect, useRef } from 'react';
import { decode } from 'blurhash';
import './PlaygroundView.css';

const DEMO_IMAGES = [
  {
    url: 'https://textsite-r2-api.matthewpereira.workers.dev/api/images/albums%2Fdefault%2Fimages%2Fimg_1767298260064_72dvpgxsm.png',
    width: 1470,
    height: 980,
    blurHash: 'LaJHaY8_tSV@~qD%s.s:-;tQaKNG',
  },
  {
    url: 'https://textsite-r2-api.matthewpereira.workers.dev/api/images/albums%2Fdefault%2Fimages%2Fimg_1767298261207_2j9ixl24s.jpg',
    width: 1470,
    height: 980,
    blurHash: 'LXD]o6Io9FWB~qRiIUWC-;RjRka|',
  },
  {
    url: 'https://textsite-r2-api.matthewpereira.workers.dev/api/images/albums%2Fdefault%2Fimages%2Fimg_1767298262372_cjtwygnov.jpg',
    width: 1307,
    height: 980,
    blurHash: 'LoAeK*kDWWo0T#j]bIWVT2WBaykC',
  },
  {
    url: 'https://textsite-r2-api.matthewpereira.workers.dev/api/images/albums%2Fdefault%2Fimages%2Fimg_1767298263447_9vej2esjw.jpg',
    width: 1470,
    height: 980,
    blurHash: 'L7H-fI4T0xt+~oITRO-AO,E2xa-p',
  },
];

// Spinner: current behaviour — grey spinning circle, image hidden until loaded
function SpinnerImage({ url, reloadKey }: { url: string; reloadKey: number }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(false); }, [reloadKey]);

  return (
    <div className="pg-img-wrapper">
      {!loaded && (
        <div className="pg-spinner-placeholder">
          <div className="pg-spinner" />
        </div>
      )}
      <img
        key={reloadKey}
        src={`${url}?v=${reloadKey}`}
        onLoad={() => setLoaded(true)}
        className={`pg-img ${loaded ? 'pg-img--visible' : 'pg-img--hidden'}`}
        alt=""
      />
    </div>
  );
}

// Fade: image starts invisible and fades in, no placeholder
function FadeImage({ url, reloadKey }: { url: string; reloadKey: number }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(false); }, [reloadKey]);

  const handleLoad = () => {
    // Two rAFs: first paints the image at opacity 0, second starts the transition
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  };

  return (
    <div className="pg-img-wrapper">
      <img
        key={reloadKey}
        src={`${url}?v=${reloadKey}`}
        onLoad={handleLoad}
        className={`pg-img pg-img--fade ${ready ? 'pg-img--visible' : ''}`}
        alt=""
      />
    </div>
  );
}

// BlurHash canvas component
function BlurCanvas({ hash, width, height }: { hash: string; width: number; height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = 32;
    const H = Math.round(32 * (height / width));
    canvas.width = W;
    canvas.height = H;

    const pixels = decode(hash, W, H);
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(W, H);
    imageData.data.set(pixels);
    ctx.putImageData(imageData, 0, 0);

    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  }, [hash, width, height]);

  return <canvas ref={canvasRef} className={`pg-blur-canvas pg-img--fade ${ready ? 'pg-img--visible' : ''}`} />;
}

// BlurHash: blurred canvas placeholder fades to sharp image
function BlurHashImage({ url, width, height, blurHash, reloadKey }: {
  url: string; width: number; height: number; blurHash: string; reloadKey: number;
}) {
  const [ready, setReady] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  useEffect(() => { setReady(false); setCanvasKey(k => k + 1); }, [reloadKey]);

  const handleLoad = () => {
    requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
  };

  return (
    <div className="pg-img-wrapper">
      <BlurCanvas key={canvasKey} hash={blurHash} width={width} height={height} />
      <img
        key={reloadKey}
        src={`${url}?v=${reloadKey}`}
        onLoad={handleLoad}
        className={`pg-img pg-img--overlay pg-img--fade ${ready ? 'pg-img--visible' : ''}`}
        alt=""
      />
    </div>
  );
}

type Technique = 'spinner' | 'fade' | 'blurhash';

const TECHNIQUES: { id: Technique; label: string; description: string }[] = [
  { id: 'spinner', label: 'Spinner', description: 'Current — grey spinner while loading' },
  { id: 'fade', label: 'Fade-in', description: 'Image fades in from transparent' },
  { id: 'blurhash', label: 'BlurHash', description: 'Colour-accurate blur fades to sharp' },
];

export default function PlaygroundView() {
  const [reloadKey, setReloadKey] = useState(0);
  const [active, setActive] = useState<Technique>('spinner');

  const reload = () => setReloadKey(k => k + 1);

  return (
    <div className="pg">
      <div className="pg-header">
        <div className="pg-tabs">
          {TECHNIQUES.map(t => (
            <button
              key={t.id}
              className={`pg-tab ${active === t.id ? 'pg-tab--active' : ''}`}
              onClick={() => { setActive(t.id); setReloadKey(k => k + 1); }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="pg-meta">
          <span className="pg-description">{TECHNIQUES.find(t => t.id === active)!.description}</span>
          <button className="pg-reload" onClick={reload}>↺ Reload</button>
        </div>
      </div>

      <div className="pg-grid">
        {DEMO_IMAGES.map((img, i) => (
          <div key={i} className="pg-cell">
            {active === 'spinner' && <SpinnerImage url={img.url} reloadKey={reloadKey} />}
            {active === 'fade' && <FadeImage url={img.url} reloadKey={reloadKey} />}
            {active === 'blurhash' && (
              <BlurHashImage
                url={img.url}
                width={img.width}
                height={img.height}
                blurHash={img.blurHash}
                reloadKey={reloadKey}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

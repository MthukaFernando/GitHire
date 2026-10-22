import Strands from './Strands';

const AnalysisLoading = ({ message = 'AI is analysing candidates...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 0',
    }}>
      <div style={{ width: '100%', maxWidth: '480px', height: '280px', position: 'relative' }}>
        <Strands
          glass={true}
          energy={0.6}
          colors={['#843cd7', '#2819d4']}
          count={3}
          speed={1}
          amplitude={1}
          waviness={1}
          thickness={1}
          spread={1.95}
          glow={1}
          taper={1}
          intensity={1}
          saturation={1}
          hueShift={0}
          scale={1}      // <-- Decrease this to zoom out the strands inside the ball
          glassSize={0.8}  // <-- Decrease this to make the physical ball smaller
          rim={1}
          dispersion={1}
          listening
          interactive={false}
          clickPulse={false}
          intro
        />
      </div>
      {message && (
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default AnalysisLoading;
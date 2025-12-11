import { races } from '../data/races';

export function RacesPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Løpskalender</h1>

      {races.map(race => (
        <div key={race.id} style={{ border: '1px solid #ddd', padding: '10px', marginTop: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>{race.name}</h2>
          <p>{race.place}</p>
          <p>{race.date}</p>
          <p>{race.distanceKm} km</p>
          <a href={race.signupUrl} target="_blank">
            Gå til påmelding
          </a>
        </div>
      ))}
    </div>
  );
}

/** Decorative travel illustration, not a geographic map or station photograph. */
export default function StationLandscape({ index = 0 }) {
  return (
    <svg className={`station-landscape landscape-${index % 4}`} viewBox="0 0 360 160" fill="none" aria-hidden="true">
      <circle className="landscape-sun" cx={260 - (index % 3) * 30} cy="42" r="23" />
      <path className="landscape-cloud" d="M30 42h90M50 34h42M218 26h78" strokeWidth="7" strokeLinecap="round" />
      <path className="landscape-hill" d="M0 118Q65 60 122 98T246 94T360 78V160H0Z" />
      <g className="landscape-city">
        {[35, 65, 103, 218, 250, 290].map((x, i) => <rect key={x} x={x} y={105 - ((i + index) % 3) * 15} width={i % 2 ? 26 : 19} height={55 + ((i + index) % 3) * 15} rx="2" />)}
        <path d="M144 120V79l28-20 28 20v41h-12V90h-32v30Z" />
      </g>
      <path className="landscape-river" d="M0 135Q80 110 172 141T360 124V160H0Z" />
      <g className="landscape-rail">
        <path d="M-10 144H370M-10 151H370" strokeWidth="2" />
        {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${i * 16} 142v11`} strokeWidth="3" />)}
      </g>
    </svg>
  )
}

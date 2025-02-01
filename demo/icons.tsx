export function Loader({ size = 20, color = 'black', rotate = true, ...props }) {
  return (
    <svg style={{ width: size, height: size }} viewBox="0 0 50 50" {...props}>
      <title>Loader</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36.7915 44.2353C36.0298 43.0573 36.4012 41.4938 37.4959 40.6167C42.0705 36.9515 45 31.3179 45 25C45 13.9543 36.0457 5 25 5C13.9543 5 5 13.9543 5 25C5 31.3179 7.92945 36.9515 12.5041 40.6167C13.5989 41.4938 13.9702 43.0573 13.2085 44.2353V44.2353C12.4716 45.3748 10.9497 45.7256 9.87005 44.9036C3.87179 40.3369 0 33.1206 0 25C0 11.1929 11.1929 0 25 0C38.8071 0 50 11.1929 50 25C50 33.1206 46.1282 40.3369 40.1299 44.9036C39.0503 45.7256 37.5284 45.3748 36.7915 44.2353V44.2353Z"
        fill={color}
      >
        <animateTransform
          attributeName="transform"
          attributeType="xml"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1s"
          repeatCount={rotate ? 'indefinite' : 0}
          begin="0s"
        />
      </path>
    </svg>
  )
}

export function Branch({ size = 24, stroke = 3, color = 'blue', ...props }) {
  return (
    <svg style={{ width: size, height: size }} viewBox="0 0 50 50" fill="none" {...props}>
      <title>Branch</title>
      <circle cx="9" cy="41" r="6.5" stroke={color} strokeWidth={stroke} />
      <circle cx="41" cy="9" r="6.5" stroke={color} strokeWidth={stroke} />
      <circle cx="9" cy="9" r="6.5" stroke={color} strokeWidth={stroke} />
      <path d="M9 34.5V15.5" stroke={color} strokeWidth={stroke} />
      <path d="M9 34C9 27 17.5 25.5 25.5 25.5C33.5 25.5 41 23 41 15.5" stroke={color} strokeWidth={stroke} />
    </svg>
  )
}

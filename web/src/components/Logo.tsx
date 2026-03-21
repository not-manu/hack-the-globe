export default function Logo({ height = 34 }: { height?: number }) {
  return (
    <img
      src="/logo-transparent-cropped.png"
      alt="ScrapYard"
      height={height}
      style={{ height, width: "auto" }}
      draggable={false}
    />
  )
}
